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

  // Customer journeys.
  //
  // Example:
  // /versions/2/customer
  router.use(
    '/customer',
    require(`./versions/${version}/customer`)({
      version,
    }),
  )

  // Support agent journeys.
  //
  // Example: /versions/2/support-agent
  router.use(
    '/support-agent',
    require(`./versions/${version}/support-agent`)({
      version,
    }),
  )

  // Service manager journeys.
  //
  // Example: /versions/2/service-manager
  router.use(
    '/service-manager',
    require(`./versions/${version}/service-manager`)({
      version,
    }),
  )

  // Exploratory journeys.
  //
  // Example: /versions/2/_exploratory
  router.use(
    '/_exploratory',
    require(`./versions/${version}/exploratory`)({
      version,
    }),
  )

    // Version overview.
    //
    // Example:
    // /versions/2/overview
    router.get('/overview', function (req, res) {
        res.render(`versions/${version}/overview`, {
            version,
            versionData,
            baseUrl: `/versions/${version}`,
        })
    })

  return router

}