const fs = require('fs')
const path = require('path')
const govukPrototypeKit = require('govuk-prototype-kit')

module.exports = function createVersionRouter({ version }) {
  const router = govukPrototypeKit.requests.setupRouter()

  // Load the version definition matching the route.
  //
  // Examples:
  // version = '0.1' -> app/data/versions/0.1.js
  // version = '0.3' -> app/data/versions/0.3.js
  // version = '1'   -> app/data/versions/1.js
  // version = '1.1' -> app/data/versions/1.1.js
  //
  // Security note:
  //
  // Version definitions are loaded from the
  // application's version data directory and are
  // intended to map to application-controlled
  // prototype versions rather than arbitrary paths.
  const versionData = require(`../data/versions/${version}`)

  // Create a collection of valid user and journey
  // combinations defined in the version metadata.
  //
  // This allows generic page rendering to be restricted
  // to journeys intentionally exposed in the version
  // definition.
  //
  // Example:
  //
  // href: '/customer/review-and-change-info/start'
  //
  // becomes:
  //
  // {
  //   user: 'customer',
  //   journey: 'review-and-change-info',
  // }
  const validJourneys = versionData.users
    .flatMap((group) => group.items || [])
    .flatMap((item) =>
      (item.journeys || []).map((journey) => {
        const parts = journey.href.split('/')

        return {
          user: parts[1],
          journey: parts[2],
        }
      }),
    )

  // Returns true if the user and journey combination
  // is defined in the version metadata.
  function isValidJourney(user, journey) {
    return validJourneys.some(
      (entry) =>
        entry.user === user &&
        entry.journey === journey,
    )
  }

  // Returns true if the Nunjucks template exists.
  //
  // Example:
  // versions/0.1/customer/review-and-change-info/start
  //
  // becomes:
  // app/views/versions/0.1/customer/review-and-change-info/start.html
  function templateExists(template) {
    const templatePath = path.join(
      process.cwd(),
      'app',
      'views',
      `${template}.html`,
    )

    return fs.existsSync(templatePath)
  }

  // Make the current version available to every route
  // handled by this version router.
  //
  // Exposes:
  // - versionId -> route version identifier
  //                Examples:
  //                '0.1', '0.3', '1', '1.1'
  //
  // - version   -> full version definition object
  //                Examples:
  //                version.status
  //                version.number
  //                version.title
  //
  // This allows all pages within a version to use the
  // same version metadata without needing to pass it
  // explicitly on every render.
  router.use((req, res, next) => {
    res.locals.version = versionData

    next()
  })

  // Version landing page.
  //
  // Examples:
  // /versions/0.1
  // /versions/0.3
  // /versions/1
  // /versions/1.1
  //
  // Pass the version definition into the page so all
  // content is driven from the version file.
  router.get('/', function (req, res) {
    res.render(`versions/${version}/index`, {
      baseUrl: `/versions/${version}`,
      page: 'version-overview',
    })
  })

  // Register all route files that exist for this version.
  //
  // Examples:
  //
  // app/routes/versions/0.1/customer.js
  // app/routes/versions/0.1/exploratory.js
  //
  // app/routes/versions/0.3/customer.js
  // app/routes/versions/1/customer.js
  // app/routes/versions/1.1/support-agent.js
  //
  // Route files are automatically mounted using the
  // filename as the route path.
  //
  // Security note:
  //
  // Route discovery is restricted to the application's
  // versions directory. Route names originate from
  // application-controlled files on disk rather than
  // request parameters or other user-supplied input.
  const versionsDirectory = path.resolve(
    __dirname,
    'versions',
  )

  const versionRoutesDirectory = path.resolve(
    versionsDirectory,
    version,
  )

  // Security note:
  //
  // Ensure the resolved path remains within the
  // expected versions directory before performing
  // any filesystem operations.
  if (!versionRoutesDirectory.startsWith(versionsDirectory)) {
    throw new Error(`Invalid version path: ${version}`)
  }

  if (fs.existsSync(versionRoutesDirectory)) {
    fs.readdirSync(versionRoutesDirectory)
      .filter((file) => file.endsWith('.js'))
      .forEach((file) => {
        const routeName = file.replace('.js', '')

        // Keep the exploratory route prefixed with "_"
        // so existing URLs continue to work.
        const mountPath = routeName === 'exploratory'
          ? '/_exploratory'
          : `/${routeName}`

        router.use(
          mountPath,

          // Security note:
          //
          // Route modules are loaded from files
          // discovered within the validated version
          // directory. Route names are derived from
          // application-controlled filesystem entries
          // rather than user input.
          require(`./versions/${version}/${routeName}`)({
            version,
          }),
        )
      })
  }

  // Service overview for the current version.
  //
  // Examples:
  // /versions/0.1/overview
  // /versions/0.3/overview
  // /versions/1/overview
  // /versions/1.1/overview
  router.get('/overview', function (req, res) {
    res.render(`versions/${version}/overview`, {
      baseUrl: `/versions/${version}`,
      page: 'service-overview',
    })
  })

  // Generic page renderer.
  //
  // Supports rendering journey pages without relying
  // on GOV.UK Prototype Kit automatic page discovery.
  //
  // Examples:
  //
  // /versions/0.1/customer/review-and-change-info/start
  // /versions/0.3/customer/tell-us-about-lpa/review-address
  // /versions/1/customer/zero-knowledge/start
  // /versions/1.1/support-agent/review-case/check-details
  //
  // Supports additional page path segments:
  //
  // /versions/0.3/customer/review-and-change-info/evidence/start
  // /versions/0.3/customer/review-and-change-info/proof-of-life/check
  //
  // Requests are only rendered if:
  // - the user and journey combination exists in the
  //   version metadata
  // - the template exists
  //
  // Unknown journeys or missing templates fall through
  // to the standard 404 page.
  router.get('/:user/:journey/*', function (req, res, next) {
    const { user, journey } = req.params

    const page = req.params[0]

    if (!isValidJourney(user, journey)) {
      return next()
    }

    const template =
      `versions/${version}/${user}/${journey}/${page}`

    if (!templateExists(template)) {
      return next()
    }

    return res.render(template, {
      version,
      baseUrl: `/versions/${version}`,
    })
  })

  // Generic POST handler for prototype navigation.
  //
  // Many prototype pages submit forms directly to the
  // next page rather than through custom route logic.
  //
  // Valid POST requests are converted into GET requests
  // by redirecting to the equivalent page URL.
  //
  // Supports nested page paths.
  router.post('/:user/:journey/*', function (req, res, next) {
    const { user, journey } = req.params

    const page = req.params[0]

    if (!isValidJourney(user, journey)) {
      return next()
    }

    const template =
      `versions/${version}/${user}/${journey}/${page}`

    if (!templateExists(template)) {
      return next()
    }

    return res.redirect(
      `/versions/${version}/${user}/${journey}/${page}`,
    )
  })

  return router
}
