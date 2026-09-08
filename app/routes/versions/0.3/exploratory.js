const govukPrototypeKit = require('govuk-prototype-kit')

module.exports = function createExploratoryRouter({ version }) {

  const router = govukPrototypeKit.requests.setupRouter()

  // Base paths used throughout exploratory journeys.
  //
  // Example:
  // Route: /versions/1/_exploratory/customer-attorney
  // View: versions/1/_exploratory/customer-attorney/index
  const viewPath = `versions/${version}/_exploratory`
  const baseUrl = `/versions/${version}/_exploratory`

  // =====================================================
  // Exploratory journeys
  // =====================================================
  //
  // Exploratory journeys are concepts, roles or
  // interactions that require further research and
  // validation before becoming part of the main service.
  //
  // Adding a journey here automatically creates:
  //
  // /versions/{version}/_exploratory/{journey}
  //
  // Each journey is expected to have:
  //
  // app/views/versions/{version}/_exploratory/{journey}/index.html
  const exploratoryJourneys = [
    'customer-attorney',
    'witness'
  ]

  // Register routes for each exploratory journey.
  //
  // Example:
  // customer-attorney -> /versions/1/_exploratory/customer-attorney
  // witness -> /versions/1/_exploratory/witness
  exploratoryJourneys.forEach(function (journey) {

    router.get(`/${journey}`, function (req, res) {

      res.render(`${viewPath}/${journey}/index`, {
        version,
        baseUrl: `${baseUrl}/${journey}`,
      })

    })

  })

  return router

}