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
  // Set up the mock customer data
  // =====================================================
  //
  // Set the customer object using the custome const
  // defined at the top if the file.
  const customer = require('../../../data/customer')

  router.use((req, res, next) => {
    res.locals.customer = customer
    next()
  })

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

    // Reset journey data so users do not carry answers
    // between different prototype journey variations.
    req.session.data = {}

    res.render(`${viewPath}/start`, {
      version,
      baseUrl,
    })
  })

  // Users starting the zero-knowledge journey
  // begin with a clean set of answers.
  router.get('/zero-knowledge/start', function (req, res) {

    req.session.data = {}

    res.render(`${viewPath}/zero-knowledge/start`, {
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

  // Users move from reviewing their bank details
  // to reviewing any lasting power of attorney
  // information before continuing their journey.
  router.post('/tell-us-about-lpa/review-bank-details', function (req, res) {

    res.redirect(`${baseUrl}/tell-us-about-lpa/review-lpa`)
  })

  // Allow hasLPA to be passed via the URL and
  // stored in the session for later pages.
  router.get('/tell-us-about-lpa/review-lpa', function (req, res) {

    if (req.query.hasLPA !== undefined) {
      req.session.data.hasLPA = req.query.hasLPA
    }

    res.render(`${viewPath}/tell-us-about-lpa/review-lpa`, {
      version,
      baseUrl,
    })
  })

  // Users who need to register a lasting power of
  // attorney are shown additional guidance before
  // returning to the main journey.
  router.post('/tell-us-about-lpa/review-lpa', function (req, res) {

    const registerLPA = req.session.data.registerLPA

    if (registerLPA === 'Yes') {
      return res.redirect(
        `${baseUrl}/tell-us-about-lpa/register-lpa`,
      )
    }

    return res.redirect(
      `${baseUrl}/tell-us-about-lpa/review-address`,
    )
  })

  // After viewing guidance about registering a
  // lasting power of attorney, users return to
  // review their LPA information before continuing.
  router.post('/tell-us-about-lpa/register-lpa', function (req, res) {

    res.redirect(
      `${baseUrl}/tell-us-about-lpa/review-lpa`,
    )
  })

  return router

}
