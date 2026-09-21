const govukPrototypeKit = require('govuk-prototype-kit')

module.exports = function createCustomerRouter({
  version,
  versionConfig,
}) {
  const router = govukPrototypeKit.requests.setupRouter()

  const viewPath = `versions/${version}/customer`
  const baseUrl = `/versions/${version}/customer`

  const documentScanningStartPage = 'document-front-scan'
  const proofOfLifeStartPage = 'verify-identity'

  const customer = require('../../../data/customer')

  // =====================================================
  // Version journey configuration
  // =====================================================

  // Return every journey defined for every user in the
  // current version object.
  function getJourneys() {
    if (!versionConfig || !Array.isArray(versionConfig.users)) {
      return []
    }

    return versionConfig.users.flatMap((userGroup) =>
      (userGroup.items || []).flatMap(
        (user) => user.journeys || [],
      ),
    )
  }

  // Find a journey using its stable ID.
  function findJourney(journeyId) {
    return getJourneys().find(
      (journey) => journey.id === journeyId,
    )
  }

  // Add the current version prefix to a configured path.
  // Only customer paths from the version object are accepted.
  function getVersionedPath(path) {
    if (!path || !path.startsWith('/customer/')) {
      return null
    }

    return `/versions/${version}${path}`
  }

  // =====================================================
  // Shared helpers
  // =====================================================

  function asArray(value) {
    if (!value) {
      return []
    }

    return Array.isArray(value) ? value : [value]
  }

  function normaliseJourneyStartPoint(value) {
    if (value === 'authentication') {
      return 'authentication'
    }

    if (value === 'document-scanning') {
      return 'document-scanning'
    }

    if (value === 'proof-of-life') {
      return 'proof-of-life'
    }

    if (value === 'check-answers') {
      return 'check-answers'
    }

    return 'start'
  }

  function normaliseIdentityDocumentType(value) {
    return value === 'passport'
      ? 'passport'
      : 'driver-licence'
  }

  function normaliseProofOfLifeMethod(value) {
    return value === 'medical' ? 'medical' : 'camera'
  }

  function normaliseBankAccountType(value) {
    if (value === 'international') {
      return 'international'
    }

    if (value === 'none') {
      return 'none'
    }

    return 'uk'
  }

  function normaliseDriverLicenceContactAddress(value) {
    if (value === 'different-from-document') {
      return 'different-from-document'
    }

    if (value === 'none') {
      return 'none'
    }

    return 'same-as-document'
  }

  function normalisePassportContactAddress(value) {
    return value === 'none' ? 'none' : 'held'
  }

  function normalisePhoneMobileStatus(value) {
    if (value === 'no') {
      return 'no'
    }

    if (value === 'unknown') {
      return 'unknown'
    }

    return 'yes'
  }

  function cloneCustomer(customerData) {
    return JSON.parse(JSON.stringify(customerData))
  }

  function includesProperty(group, property) {
    return asArray(group).includes(property)
  }

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

  // =====================================================
  // Customer scenario data
  // =====================================================

  function applyCustomerScenario(customerData, scenario) {
    // Set the identity document and extracted address.
    if (scenario.identityDocumentType === 'passport') {
      customerData.identityDocument.type = 'Passport'
      customerData.identityDocument.extractedDetails.address =
        emptyAddress()
    } else {
      customerData.identityDocument.type = 'Driver licence'
    }

    // Set the contact address held by DWP.
    if (scenario.identityDocumentType === 'passport') {
      if (scenario.contactAddressState === 'none') {
        customerData.contactDetails.address = emptyAddress()
      }
    } else if (
      scenario.contactAddressState === 'same-as-document'
    ) {
      customerData.contactDetails.address = cloneCustomer(
        customerData.identityDocument.extractedDetails.address,
      )
    } else if (scenario.contactAddressState === 'none') {
      customerData.contactDetails.address = emptyAddress()
    }

    // Set payment details held by DWP.
    if (scenario.bankAccountType === 'international') {
      customerData.paymentDetails.accountNumber = ''
      customerData.paymentDetails.sortCode = ''
    } else if (scenario.bankAccountType === 'none') {
      customerData.paymentDetails.nameOnTheAccount = ''
      customerData.paymentDetails.accountNumber = ''
      customerData.paymentDetails.sortCode = ''
      customerData.paymentDetails.IBAN = ''
    } else {
      customerData.paymentDetails.IBAN = ''
    }

    // Set contact details held by DWP.
    if (!includesProperty(scenario.contactDetails, 'emailAddress')) {
      customerData.contactDetails.emailAddress = ''
    }

    if (!includesProperty(scenario.contactDetails, 'phone')) {
      customerData.contactDetails.phone = {
        countryCode: '',
        nationalNumber: '',
        isMobile: null,
      }
    } else if (scenario.phoneMobileStatus === 'no') {
      customerData.contactDetails.phone.isMobile = false
    } else if (scenario.phoneMobileStatus === 'unknown') {
      customerData.contactDetails.phone.isMobile = null
    } else {
      customerData.contactDetails.phone.isMobile = true
    }

    customerData.contactDetails.contactPreference = ''

    // Set lasting power of attorney information.
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

    return customerData
  }

  function clearAuthenticationData(data) {
    const keys = [
      'authenticated',
      'authenticationJourney',
      'authenticationMethod',
      'receivedDwpLetter',
      'letterCode',
      'authenticationDateOfBirth',
      'oneLoginEmail',
      'oneLoginPassword',
    ]

    keys.forEach((key) => {
      delete data[key]
    })
  }

  function clearCustomerJourneyData(data) {
    const keys = [
      'proofOfLifeMethod',
      'proofOfLifeVerifiedOnline',
      'medicalExemption',
      'fullName',
      'dateOfBirth',
      'bankAccountType',
      'nameOnTheAccount',
      'accountNumber',
      'sortCode',
      'IBAN',
      'emailAddress',
      'phone-country-code',
      'phone-national-number',
      'mobilePhone',
      'addressLine1',
      'addressLine2',
      'addressTown',
      'addressCounty',
      'addressPostcode',
      'addressCountry',
      'newAddressLine1',
      'newAddressLine2',
      'newAddressTown',
      'newAddressCounty',
      'newAddressPostcode',
      'newAddressCountry',
      'contactAddressSource',
      'contactPreference',
      'hasLPA',
      'registerLPA',
      'LPAAction',
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

    clearAuthenticationData(data)
  }

  function clearCustomerScenario(data) {
    const keys = [
      'customerScenarioConfigured',
      'customerScenario',
      'customerScenarioStartPoint',
      'customerScenarioProofOfLifeMethod',
      'customerScenarioIdentityDocumentType',
      'customerScenarioDriverLicenceContactAddress',
      'customerScenarioPassportContactAddress',
      'customerScenarioBankAccountType',
      'customerScenarioContactDetails',
      'customerScenarioPhoneMobileStatus',
      'customerScenarioPowerOfAttorney',
      'customerScenarioPaymentDetails',
      'customerScenarioDoctor',
      'customerScenarioIdentityDocument',
      'customerScenarioPhoneDetails',
    ]

    keys.forEach((key) => {
      delete data[key]
    })
  }

  // Complete authentication and return to the journey
  // configured in the current version object.
  function completeAuthentication(req, res) {
    const journey = findJourney(
      req.session.data.authenticationJourney,
    )

    const destination = getVersionedPath(
      journey?.authentication?.returnTo,
    )

    if (!destination) {
      clearAuthenticationData(req.session.data)
      return res.redirect(`${baseUrl}/`)
    }

    req.session.data.authenticated = true

    return res.redirect(destination)
  }

  // Mark authentication as complete and enter the configured
  // journey at its post-authentication destination.
  function skipAuthentication(req, res, journeyId) {
    const journey = findJourney(journeyId)

    const destination = getVersionedPath(
      journey?.authentication?.returnTo,
    )

    if (!destination) {
      clearAuthenticationData(req.session.data)

      return res.redirect(`${baseUrl}/`)
    }

    req.session.data.authenticationJourney = journey.id
    req.session.data.authenticationMethod = 'scenario'
    req.session.data.authenticated = true

    return res.redirect(destination)
  }
  // Make the current customer record available to templates.
  router.use((req, res, next) => {
    const scenarioCustomer = cloneCustomer(customer)
    const scenario = req.session.data.customerScenario

    if (scenario) {
      applyCustomerScenario(scenarioCustomer, scenario)
    }

    res.locals.customer = scenarioCustomer
    next()
  })

  // =====================================================
  // Customer scenario setup
  // =====================================================

  router.get(
    '/review-and-change-info/setup-scenario',
    function (req, res) {
      res.render(
        `${viewPath}/review-and-change-info/setup-scenario`,
        { version, baseUrl },
      )
    },
  )

  router.post(
    '/review-and-change-info/setup-scenario',
    function (req, res) {
      const startPoint = normaliseJourneyStartPoint(
        req.body.customerScenarioStartPoint,
      )

      const identityDocumentType =
        normaliseIdentityDocumentType(
          req.body.customerScenarioIdentityDocumentType,
        )

      const driverLicenceContactAddress =
        normaliseDriverLicenceContactAddress(
          req.body
            .customerScenarioDriverLicenceContactAddress,
        )

      const passportContactAddress =
        normalisePassportContactAddress(
          req.body
            .customerScenarioPassportContactAddress,
        )

      const contactAddressState =
        identityDocumentType === 'passport'
          ? passportContactAddress
          : driverLicenceContactAddress

      const bankAccountType = normaliseBankAccountType(
        req.body.customerScenarioBankAccountType,
      )

      const contactDetails = asArray(
        req.body.customerScenarioContactDetails,
      )

      const phoneMobileStatus = normalisePhoneMobileStatus(
        req.body.customerScenarioPhoneMobileStatus,
      )

      const powerOfAttorney = asArray(
        req.body.customerScenarioPowerOfAttorney,
      )

      const proofOfLifeMethod =
        startPoint === 'check-answers'
          ? normaliseProofOfLifeMethod(
              req.body.customerScenarioProofOfLifeMethod,
            )
          : null

      req.session.data.customerScenarioConfigured = 'true'
      req.session.data.customerScenarioStartPoint = startPoint
      req.session.data.customerScenarioIdentityDocumentType =
        identityDocumentType
      req.session.data
        .customerScenarioDriverLicenceContactAddress =
          driverLicenceContactAddress
      req.session.data
        .customerScenarioPassportContactAddress =
          passportContactAddress
      req.session.data.customerScenarioBankAccountType =
        bankAccountType
      req.session.data.customerScenarioContactDetails =
        contactDetails
      req.session.data.customerScenarioPhoneMobileStatus =
        phoneMobileStatus
      req.session.data.customerScenarioPowerOfAttorney =
        powerOfAttorney

      if (proofOfLifeMethod) {
        req.session.data.customerScenarioProofOfLifeMethod =
          proofOfLifeMethod
      } else {
        delete req.session.data
          .customerScenarioProofOfLifeMethod
      }

      req.session.data.customerScenario = {
        identityDocumentType,
        contactAddressState,
        bankAccountType,
        contactDetails,
        phoneMobileStatus,
        powerOfAttorney,
      }

      clearCustomerJourneyData(req.session.data)

        if (startPoint === 'check-answers') {
          req.session.data.proofOfLifeMethod = proofOfLifeMethod

          return res.redirect(
            `${baseUrl}/review-and-change-info/check-answers`,
          )
        }

        delete req.session.data.proofOfLifeMethod

        if (startPoint === 'authentication') {
          return res.redirect(
            `${baseUrl}/authenticate/start?journey=review-and-change-info`,
          )
        }

        if (startPoint === 'proof-of-life') {
          return res.redirect(
            `${baseUrl}/review-and-change-info/${proofOfLifeStartPage}`,
          )
        }

        if (startPoint === 'document-scanning') {
          return res.redirect(
            `${baseUrl}/review-and-change-info/${documentScanningStartPage}`,
          )
        }

        return res.redirect(
          `${baseUrl}/review-and-change-info/start`,
        )
    },
  )

  router.get(
    '/review-and-change-info/setup-scenario/reset',
    function (req, res) {
      clearCustomerScenario(req.session.data)
      clearCustomerJourneyData(req.session.data)

      return res.redirect(
        `${baseUrl}/review-and-change-info/setup-scenario`,
      )
    },
  )

  // =====================================================
  // Journey entry points
  // =====================================================

  router.get('/', function (req, res) {
    res.render(`${viewPath}/index`, { version, baseUrl })
  })

  router.get(
    '/review-and-change-info/start',
    function (req, res) {
      res.render(
        `${viewPath}/review-and-change-info/start`,
        { version, baseUrl },
      )
    },
  )

  router.get('/zero-knowledge/start', function (req, res) {
    req.session.data = {}

    res.render(`${viewPath}/zero-knowledge/start`, {
      version,
      baseUrl,
    })
  })

  // =====================================================
  // Authentication
  // =====================================================

  // The journey start buttons link here with a stable ID:
  // /authenticate/start?journey=zero-knowledge
  // /authenticate/start?journey=review-and-change-info
  router.get('/authenticate/start', function (req, res) {
    if (req.query.journey) {
      const journey = findJourney(req.query.journey)

      if (!journey || !journey.authentication) {
        return res.redirect(`${baseUrl}/`)
      }

      clearAuthenticationData(req.session.data)
      req.session.data.authenticationJourney = journey.id
    }

    const journey = findJourney(
      req.session.data.authenticationJourney,
    )

    if (!journey || !journey.authentication) {
      return res.redirect(`${baseUrl}/`)
    }

    return res.render(
      `${viewPath}/authenticate/start`,
      { version, baseUrl },
    )
  })

  router.post('/authenticate/start', function (req, res) {
    const receivedDwpLetter =
      req.session.data.receivedDwpLetter

    if (receivedDwpLetter === 'Yes') {
      req.session.data.authenticationMethod = 'letter'

      return res.redirect(
        `${baseUrl}/authenticate/enter-letter-code`,
      )
    }

    req.session.data.authenticationMethod = 'one-login'

    return res.redirect(
      `${baseUrl}/authenticate/one-login`,
    )
  })

  router.get(
    '/authenticate/one-login-start',
    function (req, res) {
      res.render(
        `${viewPath}/authenticate/one-login-start`,
        { version, baseUrl },
      )
    },
  )

  router.get(
    '/authenticate/one-login-create-account-email',
    function (req, res) {
      res.render(  `${viewPath}/authenticate/one-login-create-account-email`, { version, baseUrl }, )
    },
  )
  router.get(
    '/authenticate/one-login-create-account-check-email',
    function (req, res) {
      res.render(  `${viewPath}/authenticate/one-login-create-account-check-email`, { version, baseUrl }, )
    },
  )
  router.get(
    '/authenticate/one-login-create-account-password',
    function (req, res) {
      res.render(  `${viewPath}/authenticate/one-login-create-account-password`, { version, baseUrl }, )
    },
  )
  router.get(
    '/authenticate/one-login-create-account-get-codes',
    function (req, res) {
      res.render(  `${viewPath}/authenticate/one-login-create-account-get-codes`, { version, baseUrl }, )
    },
  )
  router.post(
    '/authenticate/one-login-create-account-get-codes',
    function (req, res) {
      const method = req.body.securityCodesMethod

      if (!method) {
        return res.render(
          `${viewPath}/authenticate/one-login-create-account-get-codes`,
          {
            version,
            baseUrl,
            error: {
              text: 'Select how you want to get security codes'
            }
          }
        )
      }

      return res.redirect(
        `${baseUrl}/authenticate/${method}`
      )
    },
  )
  router.get(
    '/authenticate/one-login-create-account-phone',
    function (req, res) {
      res.render( `${viewPath}/authenticate/one-login-create-account-phone`, { version, baseUrl }, )
    },
  )
  router.get(
    '/authenticate/one-login-create-account-authenticator',
    function (req, res) {
      res.render(  `${viewPath}/authenticate/one-login-create-account-authenticator`, { version, baseUrl }, )
    },
  )
  router.get(
    '/authenticate/one-login-sign-in-email',
    function (req, res) {
      res.render(`${viewPath}/authenticate/one-login-sign-in-email`, { version, baseUrl }, )
    },
  )
  router.get(
    '/authenticate/one-login-sign-in-password',
    function (req, res) {
      res.render(`${viewPath}/authenticate/one-login-sign-in-password`, { version, baseUrl }, )
    },
  )
  router.get(
    '/authenticate/one-login-sign-in-check-phone',
    function (req, res) {
      res.render(`${viewPath}/authenticate/one-login-sign-in-check-phone`, { version, baseUrl }, )
    },
  )
router.get(
  '/authenticate/one-login-return-to-service',
  function (req, res) {

    const journey = findJourney(
      req.session.data.authenticationJourney,
    )

    const destination = getVersionedPath(
      journey?.authentication?.returnTo,
    )

    if (!destination) {
      clearAuthenticationData(req.session.data)
      return res.redirect(`${baseUrl}/`)
    }

    req.session.data.authenticated = true

    res.render(
      `${viewPath}/authenticate/one-login-return-to-service`,
      {
        version,
        baseUrl,
        destination,
      },
    )
  },
)
  // Letter authentication route.
  router.get(
    '/authenticate/enter-letter-code',
    function (req, res) {
      res.render(
        `${viewPath}/authenticate/enter-letter-code`,
        { version, baseUrl },
      )
    },
  )

  router.post(
    '/authenticate/enter-letter-code',
    function (req, res) {
      return res.redirect(
        `${baseUrl}/authenticate/enter-date-of-birth`,
      )
    },
  )

  router.get(
    '/authenticate/enter-date-of-birth',
    function (req, res) {
      res.render(
        `${viewPath}/authenticate/enter-date-of-birth`,
        { version, baseUrl },
      )
    },
  )

  router.post(
    '/authenticate/enter-date-of-birth',
    function (req, res) {
      return completeAuthentication(req, res)
    },
  )

  // Mock GOV.UK One Login route.
  router.get('/authenticate/one-login', function (req, res) {
    res.render(
      `${viewPath}/authenticate/one-login`,
      { version, baseUrl },
    )
  })

  router.post('/authenticate/one-login/', function (req, res) {
    // The placeholder currently completes authentication.
    // Change this redirect when more One Login pages are added.
    return completeAuthentication(req, res)
  })

  // =====================================================
  // Review and change information journey
  // =====================================================

  router.post(
    '/review-and-change-info/verify-identity',
    function (req, res) {
      return res.redirect(
        `${baseUrl}/review-and-change-info/check-answers`,
      )
    },
  )

  router.post(
    '/review-and-change-info/review-bank-details',
    function (req, res) {
      const bankAccountType = normaliseBankAccountType(
        req.body.bankAccountType,
      )

      req.session.data.bankAccountType = bankAccountType

      if (bankAccountType === 'international') {
        delete req.session.data.accountNumber
        delete req.session.data.sortCode
      } else {
        delete req.session.data.IBAN
      }

      return res.redirect(
        `${baseUrl}/review-and-change-info/check-answers`,
      )
    },
  )

  router.get(
    '/review-and-change-info/review-lpa',
    function (req, res) {
      if (req.query.hasLPA !== undefined) {
        req.session.data.hasLPA = req.query.hasLPA
      }

      res.render(
        `${viewPath}/review-and-change-info/review-lpa`,
        { version, baseUrl },
      )
    },
  )

  router.post(
    '/review-and-change-info/review-lpa',
    function (req, res) {
      if (req.session.data.registerLPA === 'Yes') {
        return res.redirect(
          `${baseUrl}/review-and-change-info/register-lpa`,
        )
      }

      return res.redirect(
        `${baseUrl}/review-and-change-info/review-address`,
      )
    },
  )

  router.post(
    '/review-and-change-info/register-lpa',
    function (req, res) {
      if (req.session.data.LPAAction === 'Leave') {
        return res.redirect(
          `${baseUrl}/review-and-change-info/register-lpa-first`,
        )
      }

      return res.redirect(
        `${baseUrl}/review-and-change-info/review-address`,
      )
    },
  )

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
