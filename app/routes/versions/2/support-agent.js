const govukPrototypeKit = require('govuk-prototype-kit')

// Mock support agent cases used by this journey.
//
// Contains:
// - customer details
// - submitted evidence
// - timeline events
// - notes
const supportAgentCases = require('../../../data/support-agent-cases')

// Predefined mismatch review routes.
//
// These routes are controlled by the application and are
// never derived from user input.
//
// Used to:
// - generate mismatch review journeys
// - validate redirect destinations
// - satisfy open redirect security controls
//
// Redirect destinations are restricted to a predefined allowlist
// (allowedMismatchUrls) generated from application-controlled route
// definitions (mismatchRoutes). Requests cannot influence redirect
// targets. Invalid routes are rejected.
const mismatchRoutes = {
  name: '/life-cert/review/name-difference',
  address: '/life-cert/review/address-difference',
  telephone: '/life-cert/review/telephone-difference',
  witnessName: '/life-cert/review/witness-name-difference',
  witnessRole: '/life-cert/review/witness-role-difference',
  witnessAddress: '/life-cert/review/witness-address-difference',
  witnessTelephone: '/life-cert/review/witness-telephone-difference',
}

const allowedMismatchUrls = Object.values(mismatchRoutes)

module.exports = function createSupportAgentRouter({ version }) {

  const router = govukPrototypeKit.requests.setupRouter()

  // Base paths used throughout the support agent journey.
  //
  // Example route:
  // /versions/1/support-agent/dashboard
  //
  // Example view:
  // versions/1/support-agent/dashboard
  const viewPath = `versions/${version}/support-agent`
  const baseUrl = `/versions/${version}/support-agent`

  // =====================================================
  // Helpers
  // =====================================================
  //
  // Utility functions used throughout the support
  // agent journey for:
  // - locating cases
  // - locating customers by NINO
  // - formatting values for display
  // - rendering pages
  // - handling mismatch review workflows

  function getByCaseId(caseId) {
    return supportAgentCases.find(function (item) {
      return item.id === caseId
    })
  }

  function getByNino(nino) {
    if (!nino) return

    function normalise(value) {
      return String(value || '')
        .replace(/\s/g, '')
        .toUpperCase()
    }

    const incoming = normalise(nino)

    return supportAgentCases.find(function (item) {
      return normalise(item.customer.nino) === incoming
    })
  }

  function formatNino(nino) {
    if (!nino) return

    const cleaned = nino.replace(/\s/g, '').toUpperCase()

    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`
  }

  function renderPage(res, page, data) {
    res.render(`${viewPath}/${page}`, {
      version,
      baseUrl,
      ...data,
      formatNino,
    })
  }

  // Store a review decision and any supporting note
  // against the supplied field.
  function storeDecision(session, field, req) {
    session.data[`${field}Decision`] = req.body[`${field}Decision`]
    session.data[`${field}Note`] = req.body.note || req.body.reason || ''
  }

  // Compare submitted certificate information against
  // known customer and witness information.
  //
  // Returns a collection of differences requiring
  // support agent review.
  function getMismatches(viewCase, data) {
    const mismatches = []

    if (!viewCase) return mismatches

    // Customer name
    if (data.enteredName !== viewCase.customer.name) {
      mismatches.push({
        field: 'name',
        url: mismatchRoutes.name,
      })
    }

    // Customer address
    if (
      data.customerAddressLine1 !== viewCase.customer.address.line1 ||
      (data.customerAddressLine2 || '') !== (viewCase.customer.address.line2 || '') ||
      data.customerAddressTown !== viewCase.customer.address.townOrCity ||
      (data.customerAddressCounty || '') !== (viewCase.customer.address.county || '') ||
      data.customerAddressPostcode !== viewCase.customer.address.postcode
    ) {
      mismatches.push({
        field: 'address',
        url: mismatchRoutes.address,
      })
    }

    // Customer telephone
    if (data.telephone !== viewCase.customer.phone) {
      mismatches.push({
        field: 'telephone',
        url: mismatchRoutes.telephone,
      })
    }

    // Witness name
    if (data.witnessName !== viewCase.witness.name) {
      mismatches.push({
        field: 'witnessName',
        url: mismatchRoutes.witnessName,
      })
    }

    // Witness role
    if (data.witnessRole !== viewCase.witness.jobTitle) {
      mismatches.push({
        field: 'witnessRole',
        url: mismatchRoutes.witnessRole,
      })
    }

    // Witness address
    if (
      (data.witnessAddressOrganisation || '') !== (viewCase.witness.address.organisation || '') ||
      data.witnessAddressLine1 !== viewCase.witness.address.line1 ||
      (data.witnessAddressLine2 || '') !== (viewCase.witness.address.line2 || '') ||
      data.witnessAddressTown !== viewCase.witness.address.townOrCity ||
      (data.witnessAddressCounty || '') !== (viewCase.witness.address.county || '') ||
      data.witnessAddressPostcode !== viewCase.witness.address.postcode
    ) {
      mismatches.push({
        field: 'witnessAddress',
        url: mismatchRoutes.witnessAddress,
      })
    }

    // Witness telephone
    if (data.witnessTelephone !== viewCase.witness.phone) {
      mismatches.push({
        field: 'witnessTelephone',
        url: mismatchRoutes.witnessTelephone,
      })
    }

    return mismatches
  }

  // Move to the next recorded mismatch.
  //
  // If no more mismatches remain, continue to the
  // final review page.
  function handleNextMismatch(req, res, nino) {
    const mismatches = req.session.data.mismatches || []

    let index = req.session.data.mismatchIndex || 0

    index++

    req.session.data.mismatchIndex = index

    if (index < mismatches.length) {
      const nextUrl = mismatches[index].url

      // Validate redirect target against a predefined
      // allowlist of internal review routes.
      //
      // Redirect destinations are generated by the
      // application and cannot be supplied by users.
      if (!allowedMismatchUrls.includes(nextUrl)) {
        throw new Error(
          `Unexpected mismatch review route: ${nextUrl}`,
        )
      }

      return res.redirect(
        `${baseUrl}${nextUrl}?nino=${nino}`,
      )
    }

    return res.redirect(
      `${baseUrl}/life-cert/review/check-answers-final?nino=${nino}`,
    )
  }
    // =====================================================
    // Home and dashboard
    // =====================================================
    //
    // Entry points used to access support agent
    // functionality and work queues.
    //
    // Includes:
    // - support agent homepage
    // - dashboard
    // - life certificate work queue

    router.get('/', function (req, res) {
      renderPage(res, 'index', {})
    })

    router.get('/dashboard', function (req, res) {
      renderPage(res, 'dashboard', {
        cases: supportAgentCases,
      })
    })

    router.get('/life-certs', function (req, res) {
      renderPage(res, 'life-certs', {
        cases: supportAgentCases,
      })
    })

  // =====================================================
  // Existing case management
  // =====================================================
  //
  // Review customer information, submitted evidence,
  // timeline activity and case notes for an existing
  // support agent case.

  router.get('/case-overview', function (req, res) {
    const caseId = req.query.caseId
    const viewCase = getByCaseId(caseId)

    renderPage(res, 'case-overview', {
      caseId,
      viewCase,
    })
  })

  router.get('/customer', function (req, res) {
    const caseId = req.query.caseId
    const viewCase = getByCaseId(caseId)

    renderPage(res, 'customer', {
      caseId,
      viewCase,
    })
  })

  router.get('/evidence', function (req, res) {
    const caseId = req.query.caseId
    const viewCase = getByCaseId(caseId)

    renderPage(res, 'evidence', {
      caseId,
      viewCase,
    })
  })

  // Review the history of activity associated with
  // the selected case.
  //
  // Timeline events are combined with case notes and
  // displayed in chronological order.
  router.get('/timeline', function (req, res) {
    const caseId = req.query.caseId
    const viewCase = getByCaseId(caseId)

    let timelineItems = []

    if (viewCase) {
      const systemEvents = viewCase.timeline || []

      const noteEvents = (viewCase.notes || []).map(function (note) {
        return {
          title: note.type === 'decision'
            ? 'Decision recorded'
            : 'Case note added',
          byline: note.by,
          date: note.datetime,
          description: {
            text: note.text,
          },
        }
      })

      timelineItems = systemEvents.concat(noteEvents)

      timelineItems.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date)
      })
    }

    renderPage(res, 'timeline', {
      caseId,
      viewCase: {
        ...viewCase,
        timeline: timelineItems,
      },
    })
  })

  // View notes associated with the selected case.
  router.get('/notes', function (req, res) {
    const caseId = req.query.caseId
    const viewCase = getByCaseId(caseId)

    renderPage(res, 'notes', {
      caseId,
      viewCase,
    })
  })

  // Add a note to the selected case.
  router.get('/add-note', function (req, res) {
    const caseId = req.query.caseId
    const viewCase = getByCaseId(caseId)

    renderPage(res, 'add-note', {
      caseId,
      viewCase,
    })
  })

  router.post('/add-note', function (req, res) {
    const caseId = req.query.caseId

    res.redirect(`${baseUrl}/notes?caseId=${caseId}`)
  })

  // =====================================================
  // Life certificate processing
  // =====================================================
  //
  // Start review of a submitted life certificate.
  //
  // A support agent can open a certificate using a
  // customer's National Insurance number (NINO).
  //
  // The selected case and any session data collected
  // during review are passed into subsequent stages
  // of the journey.

  router.get('/life-cert', function (req, res) {
    const nino = req.query.nino
    const viewCase = getByNino(nino)

    renderPage(res, 'life-cert/index', {
      nino,
      viewCase,
      data: req.session.data,
    })
  })

  // =====================================================
  // OCR review journey
  // =====================================================
  //
  // Review certificate information section by section
  // before presenting a consolidated check answers page.
  //
  // Adding a step to reviewSteps automatically creates:
  //
  // GET  /life-cert/review/{step}
  // POST /life-cert/review/{step}
  //
  // New review pages can therefore be added by:
  // 1. Creating the matching view
  // 2. Adding the step name below

  const reviewSteps = [
    'name',
    'address',
    'telephone',
    'signature',
    'witness-name',
    'witness-role',
    'witness-address',
    'witness-telephone',
  ]

  reviewSteps.forEach(function (step, index) {

    router.get(`/life-cert/review/${step}`, function (req, res) {
      const nino = req.query.nino
      const viewCase = getByNino(nino)

      renderPage(res, `life-cert/review/${step}`, {
        nino,
        viewCase,
        data: req.session.data,
      })
    })

    router.post(`/life-cert/review/${step}`, function (req, res) {
      const nino = req.query.nino
      const returnTo = req.query.returnTo
      const nextStep = reviewSteps[index + 1]

      // Preserve mismatch review state whilst
      // certificate values are updated.
      const preserved = {
        mismatches: req.session.data.mismatches,
        mismatchIndex: req.session.data.mismatchIndex,
      }

      Object.assign(req.session.data, req.body)

      req.session.data.mismatches = preserved.mismatches
      req.session.data.mismatchIndex = preserved.mismatchIndex

      // Store values using consistent session keys so
      // information captured from the certificate can
      // be compared with known customer information
      // during later review stages.

      if (step === 'name') {
        req.session.data.enteredName = req.body.name
      }

      if (step === 'address') {
        req.session.data.customerAddressLine1 = req.body.addressLine1
        req.session.data.customerAddressLine2 = req.body.addressLine2
        req.session.data.customerAddressTown = req.body.addressTown
        req.session.data.customerAddressCounty = req.body.addressCounty
        req.session.data.customerAddressPostcode = req.body.addressPostcode
      }

      if (step === 'signature') {
        req.session.data.signatureDecision = req.body.signatureDecision
        req.session.data.signatureNote = req.body.reason || ''
      }

      if (step === 'witness-address') {
        req.session.data.witnessAddressOrganisation = req.body.addressOrganisation
        req.session.data.witnessAddressLine1 = req.body.addressLine1
        req.session.data.witnessAddressLine2 = req.body.addressLine2
        req.session.data.witnessAddressTown = req.body.addressTown
        req.session.data.witnessAddressCounty = req.body.addressCounty
        req.session.data.witnessAddressPostcode = req.body.addressPostcode
      }

      // Users returning from a Change link should
      // return to the page they started from rather
      // than continuing through the review journey.

      if (returnTo === 'check-answers') {
        return res.redirect(
          `${baseUrl}/life-cert/review/check-answers?nino=${nino}`,
        )
      }

      if (returnTo === 'check-answers-final') {
        return res.redirect(
          `${baseUrl}/life-cert/review/check-answers-final?nino=${nino}`,
        )
      }

      if (nextStep) {
        return res.redirect(
          `${baseUrl}/life-cert/review/${nextStep}?nino=${nino}`,
        )
      }

      return res.redirect(
        `${baseUrl}/life-cert/review/check-answers?nino=${nino}`,
      )
    })

  })

  // =====================================================
  // OCR review check answers
  // =====================================================
  //
  // Review information captured during the OCR review
  // journey before comparing it with known customer
  // and witness information.
  //
  // If differences are identified, the support agent
  // is directed into the difference review journey.
  //
  // If no differences are identified, the certificate
  // can be marked as reviewed and returned to the case.

  router.get('/life-cert/review/check-answers', function (req, res) {
    const nino = req.query.nino
    const viewCase = getByNino(nino)

    renderPage(res, 'life-cert/review/check-answers', {
      nino,
      viewCase,
      data: req.session.data,
    })
  })

  router.post('/life-cert/review/check-answers', function (req, res) {
    const nino = req.query.nino
    const viewCase = getByNino(nino)

    const mismatches = getMismatches(
      viewCase,
      req.session.data,
    )

    // If differences exist, begin the difference
    // review journey and record the list in session.
    if (mismatches.length > 0) {
      req.session.data.mismatches = mismatches
      req.session.data.mismatchIndex = 0

      return res.redirect(
        `${baseUrl}/life-cert/review/differences?nino=${nino}`,
      )
    }

    // No differences were found. Record that the
    // certificate has been reviewed and return to
    // the case.
    req.session.data.certificateReviewed = true

    return res.redirect(
      `${baseUrl}/life-cert?nino=${nino}`,
    )
  })

  // =====================================================
  // Differences summary
  // =====================================================
  //
  // Present all identified differences before the
  // support agent enters the detailed review journey.
  //
  // If differences exist, the first difference is
  // opened for review.
  //
  // If no differences remain, continue directly to
  // the final review and decision stage.

  router.get('/life-cert/review/differences', function (req, res) {
    const nino = req.query.nino
    const viewCase = getByNino(nino)

    renderPage(res, 'life-cert/review/differences', {
      nino,
      viewCase,
      mismatches: req.session.data.mismatches || [],
      data: req.session.data,
    })
  })

  router.post('/life-cert/review/differences', function (req, res) {
    const nino = req.query.nino
    const mismatches = req.session.data.mismatches || []

    // No differences remain. Continue to the final
    // review and decision stage.
    if (!mismatches.length) {
      return res.redirect(
        `${baseUrl}/life-cert/review/check-answers-final?nino=${nino}`,
      )
    }

    // Begin review of the first identified difference.
    const firstUrl = mismatches[0].url

    // Validate redirect target against the predefined
    // mismatch route allowlist.
    if (!allowedMismatchUrls.includes(firstUrl)) {
      throw new Error(
        `Unexpected mismatch review route: ${firstUrl}`,
      )
    }

    return res.redirect(
      `${baseUrl}${firstUrl}?nino=${nino}`,
    )
  })

  // =====================================================
  // Difference review journey
  // =====================================================
  //
  // Review each identified mismatch and record a
  // decision before progressing to final review.
  //
  // Adding a difference type below automatically
  // creates:
  //
  // GET  /life-cert/review/{route}
  // POST /life-cert/review/{route}
  //
  // and includes it in the mismatch review flow.

  const differenceSteps = [
    {
      route: 'name-difference',
      field: 'name',
    },
    {
      route: 'address-difference',
      field: 'address',
    },
    {
      route: 'telephone-difference',
      field: 'telephone',
    },
    {
      route: 'witness-name-difference',
      field: 'witnessName',
    },
    {
      route: 'witness-role-difference',
      field: 'witnessRole',
    },
    {
      route: 'witness-address-difference',
      field: 'witnessAddress',
    },
    {
      route: 'witness-telephone-difference',
      field: 'witnessTelephone',
    },
  ]

  differenceSteps.forEach(function (step) {

    router.get(`/life-cert/review/${step.route}`, function (req, res) {
      const nino = req.query.nino
      const viewCase = getByNino(nino)

      renderPage(res, `life-cert/review/${step.route}`, {
        nino,
        viewCase,
        data: req.session.data,
      })
    })

    router.post(`/life-cert/review/${step.route}`, function (req, res) {
      const nino = req.query.nino
      const returnTo = req.query.returnTo

      // Record the support agent's decision and any
      // supporting rationale for the current difference.
      storeDecision(req.session, step.field, req)

      // Users returning from the final check answers page
      // should return there once their review is complete.
      if (returnTo === 'check-answers-final') {
        return res.redirect(
          `${baseUrl}/life-cert/review/check-answers-final?nino=${nino}`,
        )
      }

      // Continue to the next recorded difference.
      return handleNextMismatch(req, res, nino)
    })

  })

  //   // =====================================================
  // Final review and decision
  // =====================================================
  //
  // Review all recorded decisions before completing
  // processing of the submitted life certificate.
  //
  // At this point:
  // - OCR review has been completed
  // - differences have been reviewed
  // - decisions have been recorded
  //
  // Submitting this stage marks the certificate as
  // reviewed and returns the support agent to the case.

  router.get('/life-cert/review/check-answers-final', function (req, res) {
    const nino = req.query.nino
    const viewCase = getByNino(nino)

    renderPage(res, 'life-cert/review/check-answers-final', {
      nino,
      viewCase,
      data: req.session.data,
    })
  })

  router.post('/life-cert/review/check-answers-final', function (req, res) {
    const nino = req.query.nino

    // Record that the life certificate has completed
    // the review process.
    req.session.data.certificateReviewed = true

    // Return the support agent to the life certificate.
    return res.redirect(
      `${baseUrl}/life-cert?nino=${nino}`,
    )
  })

  // =====================================================
  // Exit confirmation
  // =====================================================
  //
  // Allow support agents to leave the review journey
  // without accidentally losing their place.
  //
  // If the user confirms they want to exit, return
  // to the life certificate.
  //
  // Otherwise, return them to the review journey.

  router.get('/life-cert/review/exit-confirm', function (req, res) {
    const nino = req.query.nino
    const viewCase = getByNino(nino)

    renderPage(res, 'life-cert/review/exit-confirm', {
      nino,
      viewCase,
    })
  })

  router.post('/life-cert/review/exit-confirm', function (req, res) {
    const nino = req.query.nino
    const confirmExit = req.body.confirmExit

    if (confirmExit === 'yes') {
      return res.redirect(
        `${baseUrl}/life-cert?nino=${nino}`,
      )
    }

    return res.redirect(
      `${baseUrl}/life-cert/review/name?nino=${nino}`,
    )
  })

  return router

}
