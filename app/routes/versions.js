const fs = require('fs')
const path = require('path')
const govukPrototypeKit = require('govuk-prototype-kit')

module.exports = function createVersionRouter({ version }) {
  const router = govukPrototypeKit.requests.setupRouter()

  // Load the version definition matching the route.
  //
  // Example:
  // version = '2'   -> app/data/versions/2.js
  // version = '2.1' -> app/data/versions/2.1.js
  //
  // Security note:
  //
  // Version definitions are loaded from the
  // application's version data directory and are
  // intended to map to application-controlled
  // prototype versions rather than arbitrary paths.
  const versionData = require(`../data/versions/${version}`)

  // Make the current version available to every route
  // handled by this version router.
  //
  // Exposes:
  // - versionId   -> route version identifier
  //                  Example: '1', '2', '2.1'
  //
  // - version     -> full version definition object
  //                  Example: version.status
  //                           version.number
  //                           version.title
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
  // /versions/1
  // /versions/2
  // /versions/2.1
  //
  // Pass the version definition into the page so
  // all content is driven from the version file.
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
  // app/routes/versions/1/customer.js
  // app/routes/versions/1/exploratory.js
  //
  // app/routes/versions/2/customer.js
  // app/routes/versions/2/support-agent.js
  // app/routes/versions/2/service-manager.js
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
  // Example:
  // /versions/2/overview
  router.get('/overview', function (req, res) {
    res.render(`versions/${version}/overview`, {
      baseUrl: `/versions/${version}`,
      page: 'service-overview',
    })
  })

  return router
}
