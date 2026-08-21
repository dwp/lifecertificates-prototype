const govukPrototypeKit = require('govuk-prototype-kit')

module.exports = function createServiceManagerRouter({ version }) {

  const router = govukPrototypeKit.requests.setupRouter()

  // Base paths used throughout the service manager journey.
  //
  // Example:
  // viewPath: versions/1/service-manager
  // baseUrl: /versions/1/service-manager
  const viewPath = `versions/${version}/service-manager`
  const baseUrl = `/versions/${version}/service-manager`

  // =====================================================
  // Index
  // =====================================================
  //
  // Service manager journey homepage.
  //
  // Example:
  // /versions/1/service-manager
  router.get('/', function (req, res) {
    res.render(`${viewPath}/index`, {
      version,
      baseUrl,
    })
  })

  // =====================================================
  // Dashboard
  // =====================================================
  //
  // Service manager dashboard used to monitor
  // workload, performance and service risks.
  //
  // Example:
  // /versions/1/service-manager/dashboard
  router.get('/dashboard', function (req, res) {
    res.render(`${viewPath}/dashboard`, {
      version,
      baseUrl,
    })
  })

  return router

}
