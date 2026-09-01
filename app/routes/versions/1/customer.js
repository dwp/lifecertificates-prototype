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

  // Temporary routing path while the journey is being
  // developed. Users are redirected directly to the
  // check answers page.
  // Change post url to include parent folder to apply
  router.post('/start', function (req, res) {
    res.redirect(`${baseUrl}/check-answers`)
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

  // =====================================================
  // Verify identity (Variation 3)
  // =====================================================
  //
  // Prototype routes used to action verified identity.

  // Users move from verifying proof of life with their
  // camera to reviewing bank details held by DWP
  router.post('/tell-us-about-lpa/verify-identity', function (req, res) {
    res.redirect(`${baseUrl}/tell-us-about-lpa/review-bank-details`)
  })

  // =====================================================
  // Power of attorney (Variation 3)
  // =====================================================
  //
  // Prototype routes used to review and manage
  // lasting power of attorney information.

  // Users move from reviewing their bank details
  // to reviewing any lasting power of attorney
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

  // Users decide whether to continue with their
  // life certificate or leave the service to
  // register a lasting power of attorney first.
  router.post('/tell-us-about-lpa/register-lpa', function (req, res) {

    const LPAAction = req.session.data.LPAAction

    if (LPAAction === 'Leave') {
      return res.redirect(
        `${baseUrl}/tell-us-about-lpa/register-lpa-first`,
      )
    }

    return res.redirect(
      `${baseUrl}/tell-us-about-lpa/review-address`,
    )
  })

  return router

}
