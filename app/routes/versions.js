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
  const versionData = require(`../data/versions/${version}`)

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
      version: versionData,
      baseUrl: `/versions/${version}`,
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
  const versionRoutesDirectory = path.join(__dirname, 'versions', version)

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
          require(`./versions/${version}/${routeName}`)({
            version,
          }),
        )
      })
  }

  // Version overview.
  //
  // Example: /versions/2/overview
  router.get('/overview', function (req, res) {
    res.render(`versions/${version}/overview`, {
      version,
      versionData,
      baseUrl: `/versions/${version}`,
    })
  })

  return router

}
