const govukPrototypeKit = require('govuk-prototype-kit')

module.exports = function createCustomerRouter({ version }) {

  const router = govukPrototypeKit.requests.setupRouter()

  // Base paths used throughout the customer journey.
  //
  // Example:
  // Route: /versions/1/customer/start
  // View: versions/1/customer/start
  const viewPath = `versions/${version}/customer`
  const baseUrl = `/versions/${version}/customer`

  // =====================================================
  // Journey entry points
  // =====================================================
  //
  // Entry pages used to start and access customer journeys.

  router.get('/', function (req, res) {
    res.render(`${viewPath}/index`, {
      version,
      baseUrl,
    })
  })

  router.get('/start', function (req, res) {
    res.render(`${viewPath}/start`, {
      version,
      baseUrl,
    })
  })

  // Temporary routing used while the journey is being
  // developed. Users are redirected directly to the
  // check answers page.
  router.post('/start', function (req, res) {
    res.redirect(`${baseUrl}/check-answers`)
  })

  // =====================================================
  // Power of attorney
  // =====================================================
  //
  // Prototype routes used to review and manage
  // lasting power of attorney information.

  router.get('/tell-us-about-lpa/review-lpa', function (req, res) {

    // Allow hasLPA to be passed via the URL and
    // stored in the session for later pages.
    if (req.query.hasLPA !== undefined) {
      req.session.data.hasLPA = req.query.hasLPA
    }

    res.render(`${viewPath}/tell-us-about-lpa/review-lpa`, {
      version,
      baseUrl,
    })

  })

  router.post('/tell-us-about-lpa/review-lpa', function (req, res) {

    const registerLPA = req.session.data.registerLPA

    // Direct users to the appropriate next step
    // depending on whether they want to register
    // a power of attorney.
    if (registerLPA === 'Yes') {
      return res.redirect(`${baseUrl}/tell-us-about-lpa/register-lpa`)
    }

    return res.redirect(`${baseUrl}/tell-us-about-lpa/review-address`)

  })

  return router

}