const govukPrototypeKit = require('govuk-prototype-kit')


module.exports = function createCustomerRouter({ version }) {

  const router = govukPrototypeKit.requests.setupRouter()

  // Base paths used throughout the customer journey.
  //
  // Example:
  // Route: /versions/0.3/customer/start
  // View: versions/0.3/customer/start
  const viewPath = `versions/${version}/customer`
  const baseUrl = `/versions/${version}/customer`


  // =====================================================
  // Set up the mock customer data
  // =====================================================
  //
  // Load the complete customer record.
  //
  // This is the canonical customer fixture. Do not change
  // it directly because required modules are cached and
  // shared between prototype sessions.
  const customer = require('../../../data/customer')


  // Convert a submitted checkbox group into an array.
  //
  // Express may provide:
  //
  // - undefined when nothing is selected
  // - a string when one item is selected
  // - an array when multiple items are selected
  function asArray(value) {

    if (!value) {
      return []
    }

    if (Array.isArray(value)) {
      return value
    }

    return [value]
  }


  // Return a supported identity-document type.
  //
  // A driver licence is used by default if the submitted
  // value is missing or unexpected.
  function normaliseIdentityDocumentType(value) {

    if (value === 'passport') {
      return 'passport'
    }

    return 'driver-licence'
  }


  // Return a supported mobile-phone status.
  //
  // Yes is used by default because it matches the complete
  // customer fixture.
  function normalisePhoneMobileStatus(value) {

    if (value === 'no') {
      return 'no'
    }

    if (value === 'unknown') {
      return 'unknown'
    }

    return 'yes'
  }


  // Create a new copy of the complete customer fixture.
  //
  // The fixture contains only plain objects, arrays and
  // primitive values, so JSON cloning is sufficient for
  // this prototype.
  function cloneCustomer(customerData) {
    return JSON.parse(
      JSON.stringify(customerData),
    )
  }


  // Return whether a property has been enabled in one of
  // the scenario checkbox groups.
  function includesProperty(group, property) {
    return asArray(group).includes(property)
  }


  // Return an empty address while preserving the structure
  // expected by the Nunjucks templates.
  function emptyAddress() {
    return {
      line1: '',
      line2: '',
      town: '',
      county: '',
      postcode: '',
      country: '',
    }
  }


  // Apply the configured scenario to a copy of the complete
  // customer fixture.
  //
  // Empty values are used instead of deleting parent
  // objects. Existing templates can therefore continue
  // accessing nested properties safely.
  function applyCustomerScenario(
    customerData,
    scenario,
  ) {

    // customer.identityDocument
    //
    // An identity document is mandatory for reaching check
    // answers. Its type determines which extracted
    // information is available.
    //
    // Driver licence:
    // - name
    // - date of birth
    // - registered address
    //
    // Passport:
    // - name
    // - date of birth

    if (scenario.identityDocumentType === 'passport') {
      customerData.identityDocument.type = 'Passport'

      customerData.identityDocument.extractedDetails.address =
        emptyAddress()
    } else {
      customerData.identityDocument.type = 'Driver licence'
    }


    // customer.paymentDetails
    //
    // The UK bank account selection represents:
    //
    // - name on the account
    // - account number
    // - sort code
    //
    // IBAN is controlled separately because the customer
    // may have UK bank details, an IBAN or both.

    if (
      !includesProperty(
        scenario.paymentDetails,
        'ukBankAccount',
      )
    ) {
      customerData.paymentDetails.nameOnTheAccount = ''
      customerData.paymentDetails.accountNumber = ''
      customerData.paymentDetails.sortCode = ''
    }

    if (
      !includesProperty(
        scenario.paymentDetails,
        'IBAN',
      )
    ) {
      customerData.paymentDetails.IBAN = ''
    }


    // customer.contactDetails

    if (
      !includesProperty(
        scenario.contactDetails,
        'address',
      )
    ) {
      customerData.contactDetails.address =
        emptyAddress()
    }

    if (
      !includesProperty(
        scenario.contactDetails,
        'emailAddress',
      )
    ) {
      customerData.contactDetails.emailAddress = ''
    }

    if (
      !includesProperty(
        scenario.contactDetails,
        'phone',
      )
    ) {
      customerData.contactDetails.phone = {
        countryCode: '',
        nationalNumber: '',
        isMobile: null,
      }
    } else if (
      scenario.phoneMobileStatus === 'no'
    ) {
      customerData.contactDetails.phone.isMobile = false
    } else if (
      scenario.phoneMobileStatus === 'unknown'
    ) {
      customerData.contactDetails.phone.isMobile = null
    } else {
      customerData.contactDetails.phone.isMobile = true
    }

    if (
      !includesProperty(
        scenario.contactDetails,
        'contactPreference',
      )
    ) {
      customerData.contactDetails.contactPreference = ''
    }


    // customer.powerOfAttorney
    //
    // Lasting power of attorney is represented as one
    // presence-or-absence choice.

    if (
      includesProperty(
        scenario.powerOfAttorney,
        'registeredLPAs',
      )
    ) {
      customerData.powerOfAttorney.hasLPA = true
    } else {
      customerData.powerOfAttorney.hasLPA = false
      customerData.powerOfAttorney.registeredLPAs = []
    }


    // customer.doctor
    //
    // Doctor information is not configured at field level.
    // The complete doctor and uploaded-letter fixture remains
    // available for the medical-evidence route.

    return customerData
  }


  // Clear answers entered during an earlier test.
  //
  // Session data can take precedence over the filtered
  // customer fixture in Nunjucks. Clearing these fields
  // ensures that applying or resetting a scenario produces
  // a predictable starting state.
  function clearCustomerJourneyData(data) {

    const keys = [
      // Proof of life
      'proofOfLifeVerifiedOnline',

      // Identity information
      'fullName',
      'dateOfBirth',

      // Payment information
      'nameOnTheAccount',
      'accountNumber',
      'sortCode',
      'IBAN',

      // Email information
      'emailAddress',

      // Phone information
      'phone-country-code',
      'phone-national-number',
      'mobilePhone',

      // Existing contact address
      'addressLine1',
      'addressLine2',
      'addressTown',
      'addressCounty',
      'addressPostcode',
      'addressCountry',

      // Wholly new address
      'newAddressLine1',
      'newAddressLine2',
      'newAddressTown',
      'newAddressCounty',
      'newAddressPostcode',
      'newAddressCountry',

      // Contact choices
      'contactAddressSource',
      'contactPreference',

      // Lasting power of attorney
      'hasLPA',
      'registerLPA',
      'LPAAction',

      // Doctor information entered during the journey
      'doctorFullName',
      'doctorPracticeName',
      'doctorAddressPractice',
      'doctorAddressLine1',
      'doctorAddressLine2',
      'doctorAddressTown',
      'doctorAddressCounty',
      'doctorAddressPostcode',
      'doctorAddressCountry',
      'doctorEmailAddress',
      'doctor-country-code',
      'doctor-national-number',
      'doctorPhoneNumber',
      'doctorLetter',
    ]

    keys.forEach((key) => {
      delete data[key]
    })
  }


  // Remove the configured customer scenario.
  //
  // This restores the complete canonical customer fixture
  // as the starting point for the journey.
  function clearCustomerScenario(data) {

    delete data.customerScenarioConfigured
    delete data.customerScenario

    delete data.customerScenarioIdentityDocumentType
    delete data.customerScenarioPaymentDetails
    delete data.customerScenarioContactDetails
    delete data.customerScenarioPhoneMobileStatus
    delete data.customerScenarioPowerOfAttorney

    // Remove values from older versions of the controls if
    // they remain in the current session.
    delete data.customerScenarioProofOfLifeMethod
    delete data.customerScenarioDoctor
    delete data.customerScenarioIdentityDocument
    delete data.customerScenarioPhoneDetails
  }


  // Create the customer object used by the current request.
  //
  // If no scenario has been configured, pages receive a
  // complete copy of the canonical customer fixture.
  //
  // If a scenario exists, pages receive a filtered copy.
  router.use((req, res, next) => {

    const scenarioCustomer = cloneCustomer(customer)
    const scenario = req.session.data.customerScenario

    if (scenario) {
      applyCustomerScenario(
        scenarioCustomer,
        scenario,
      )
    }

    res.locals.customer = scenarioCustomer

    next()
  })


  // =====================================================
  // Prototype data controls
  // =====================================================
  //
  // Controls used to test different combinations of
  // customer information throughout the prototype.

  // Display the prototype data controls.
  router.get('/prototype-data', function (req, res) {
    res.render(`${viewPath}/prototype-data`, {
      version,
      baseUrl,
    })
  })


  // Apply the selected customer-data scenario.
  //
  // The controls configure:
  //
  // - the identity document scanned by the customer
  // - the information available if proof of life is
  //   completed using the camera
  // - registered lasting powers of attorney
  //
  // The journey itself determines whether proof of life is
  // completed using the camera or supported by medical
  // evidence.
  router.post('/prototype-data', function (req, res) {

    const identityDocumentType =
      normaliseIdentityDocumentType(
        req.body.customerScenarioIdentityDocumentType,
      )

    const paymentDetails = asArray(
      req.body.customerScenarioPaymentDetails,
    )

    const contactDetails = asArray(
      req.body.customerScenarioContactDetails,
    )

    const phoneMobileStatus =
      normalisePhoneMobileStatus(
        req.body.customerScenarioPhoneMobileStatus,
      )

    const powerOfAttorney = asArray(
      req.body.customerScenarioPowerOfAttorney,
    )


    // Store the values used to restore the controls page.
    //
    // Empty checkbox groups are stored as empty arrays so
    // previous selections do not remain in session data.
    req.session.data.customerScenarioConfigured = 'true'

    req.session.data.customerScenarioIdentityDocumentType =
      identityDocumentType

    req.session.data.customerScenarioPaymentDetails =
      paymentDetails

    req.session.data.customerScenarioContactDetails =
      contactDetails

    req.session.data.customerScenarioPhoneMobileStatus =
      phoneMobileStatus

    req.session.data.customerScenarioPowerOfAttorney =
      powerOfAttorney


    // Store the normalised scenario.
    req.session.data.customerScenario = {
      identityDocumentType,
      paymentDetails,
      contactDetails,
      phoneMobileStatus,
      powerOfAttorney,
    }


    // Remove values entered during earlier tests so they
    // cannot override the new starting scenario.
    //
    // This also removes a previous proof-of-life result,
    // allowing the journey to be tested again.
    clearCustomerJourneyData(
      req.session.data,
    )


    // Start the review and change journey.
    //
    // The configured scenario remains active in the current
    // session and will be applied throughout the journey.
    return res.redirect(
      `${baseUrl}/review-and-change-info/start`,
    )
  })


  // Reset the controls and restore the complete customer.
  router.get('/prototype-data/reset', function (req, res) {

    clearCustomerScenario(
      req.session.data,
    )

    clearCustomerJourneyData(
      req.session.data,
    )

    return res.redirect(
      `${baseUrl}/prototype-data`,
    )
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


  // Display the start page for the review and change
  // information journey.
  //
  // If a custom scenario is active, it remains active.
  // Otherwise, the complete customer fixture is used.
  router.get(
    '/review-and-change-info/start',
    function (req, res) {
      res.render(
        `${viewPath}/review-and-change-info/start`,
        {
          version,
          baseUrl,
        },
      )
    },
  )


  // Temporary routing path while the journey is being
  // developed. Users are redirected directly to the
  // check answers page.
  router.post('/start', function (req, res) {
    res.redirect(
      `${baseUrl}/check-answers`,
    )
  })


  // Users starting the zero-knowledge journey begin with
  // a clean set of answers.
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
  // proofOfLifeVerifiedOnline is set to "Yes" when proof of
  // life is completed using the camera.
  //
  // The value remains empty when the customer follows the
  // medical-evidence route.
  router.post(
    '/review-and-change-info/verify-identity',
    function (req, res) {
      res.redirect(
        `${baseUrl}/review-and-change-info/check-answers`,
      )
    },
  )


  // =====================================================
  // Power of attorney (Variation 2)
  // =====================================================
  //
  // Prototype routes used to review and manage lasting
  // power of attorney information.

  // Users move from reviewing their bank details to
  // reviewing any lasting powers of attorney.
  router.post(
    '/review-and-change-info/review-bank-details',
    function (req, res) {
      res.redirect(
        `${baseUrl}/review-and-change-info/review-lpa`,
      )
    },
  )


  // Allow hasLPA to be passed in the URL and stored in the
  // session for later pages.
  router.get(
    '/review-and-change-info/review-lpa',
    function (req, res) {

      if (req.query.hasLPA !== undefined) {
        req.session.data.hasLPA =
          req.query.hasLPA
      }

      res.render(
        `${viewPath}/review-and-change-info/review-lpa`,
        {
          version,
          baseUrl,
        },
      )
    },
  )


  // Users who need to register a lasting power of attorney
  // are shown additional guidance before returning to the
  // main journey.
  router.post(
    '/review-and-change-info/review-lpa',
    function (req, res) {

      const registerLPA =
        req.session.data.registerLPA

      if (registerLPA === 'Yes') {
        return res.redirect(
          `${baseUrl}/review-and-change-info/register-lpa`,
        )
      }

      return res.redirect(
        `${baseUrl}/review-and-change-info/review-address`,
      )
    },
  )


  // Users decide whether to continue with their life
  // certificate or leave the service to register a lasting
  // power of attorney first.
  router.post(
    '/review-and-change-info/register-lpa',
    function (req, res) {

      const LPAAction =
        req.session.data.LPAAction

      if (LPAAction === 'Leave') {
        return res.redirect(
          `${baseUrl}/review-and-change-info/register-lpa-first`,
        )
      }

      return res.redirect(
        `${baseUrl}/review-and-change-info/review-address`,
      )
    },
  )


  // =====================================================
  // Contact preference (Variation 2)
  // =====================================================
  //
  // Users can select an existing contact method or choose
  // to add missing contact information before continuing.

  // Values beginning with "add-" are temporary routing
  // instructions.
  //
  // Replace the temporary value with the preference
  // indicated by the customer before entering the relevant
  // review flow.
  //
  // Individual review routes do not update the preference.
  // Customers can therefore change a contact detail later
  // without changing their preferred contact method.
  router.post(
    '/review-and-change-info/review-contact-preference',
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
