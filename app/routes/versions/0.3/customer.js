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
  // Set the customer object using the customer const
  // defined at the top of the file.
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
  //
  // Change post URL to include parent folder to apply.
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
  // Verify identity (Variation 2)
  // =====================================================
  //
  // Prototype routes used to action verified identity.

  // Users move from verifying proof of life with their
  // camera to reviewing bank details held by DWP.
  router.post('/review-and-change-info/verify-identity', function (req, res) {
    res.redirect(`${baseUrl}/review-and-change-info/check-answers`)
  })

  // =====================================================
  // Power of attorney (Variation 2)
  // =====================================================
  //
  // Prototype routes used to review and manage
  // lasting power of attorney information.

  // Users move from reviewing their bank details
  // to reviewing any lasting power of attorney.
  router.post(
    '/review-and-change-info/review-bank-details',
    function (req, res) {
      res.redirect(`${baseUrl}/review-and-change-info/review-lpa`)
    },
  )

  // Allow hasLPA to be passed via the URL and
  // stored in the session for later pages.
  router.get('/review-and-change-info/review-lpa', function (req, res) {

    if (req.query.hasLPA !== undefined) {
      req.session.data.hasLPA = req.query.hasLPA
    }

    res.render(`${viewPath}/review-and-change-info/review-lpa`, {
      version,
      baseUrl,
    })
  })

  // Users who need to register a lasting power of
  // attorney are shown additional guidance before
  // returning to the main journey.
  router.post('/review-and-change-info/review-lpa', function (req, res) {

    const registerLPA = req.session.data.registerLPA

    if (registerLPA === 'Yes') {
      return res.redirect(
        `${baseUrl}/review-and-change-info/register-lpa`,
      )
    }

    return res.redirect(
      `${baseUrl}/review-and-change-info/review-address`,
    )
  })

  // Users decide whether to continue with their
  // life certificate or leave the service to
  // register a lasting power of attorney first.
  router.post('/review-and-change-info/register-lpa', function (req, res) {

    const LPAAction = req.session.data.LPAAction

    if (LPAAction === 'Leave') {
      return res.redirect(
        `${baseUrl}/review-and-change-info/register-lpa-first`,
      )
    }

    return res.redirect(
      `${baseUrl}/review-and-change-info/review-address`,
    )
  })

  // =====================================================
  // Contact preference (Variation 2)
  // =====================================================
  //
  // Users can select an existing contact method or choose
  // to add missing contact information before continuing.

  // Values beginning with "add-" are temporary routing
  // instructions. Before entering the relevant review
  // flow, replace the temporary value with the contact
  // method the user has indicated they want to use.
  //
  // The individual review routes do not update the contact
  // preference. This means users can later change an email
  // address, phone number or postal address without changing
  // their previously selected contact preference.
  router.post('/review-and-change-info/review-contact-preference',
    function (req, res) {

      const contactPreference =
        req.session.data.contactPreference

      if (contactPreference === 'add-email') {
        req.session.data.contactPreference = 'Email'

        return res.redirect(
          `${baseUrl}/review-and-change-info/review-email`,
        )
      }

      if (contactPreference === 'add-phone') {
        req.session.data.contactPreference = 'Phone'

        return res.redirect(
          `${baseUrl}/review-and-change-info/review-phone`,
        )
      }

      if (contactPreference === 'add-address') {
        req.session.data.contactPreference = 'Post'

        return res.redirect(
          `${baseUrl}/review-and-change-info/review-address`,
        )
      }

      return res.redirect(
        `${baseUrl}/review-and-change-info/check-answers`,
      )
    },
  )

  return router

}
