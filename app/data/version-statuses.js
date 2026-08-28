/**
 * Version status definitions.
 *
 * Use this file as the single source of truth for:
 * - GOV.UK tag text
 * - GOV.UK tag colours
 * - Version status descriptions
 * - Version notification banners
 * - Version warning messages
 */

module.exports = {
  Current: {
    label: 'Current',
    description: 'The recommended prototype version and current design baseline.',
    tag: {
      text: 'Current',
      classes: 'govuk-tag--green',
    },
    banner: {
      type: 'success',
      titleText: 'Current',
      html:
        '<p class="govuk-notification-banner__heading">This is the current design.</p>',
    },
  },

  Draft: {
    label: 'Draft',
    description: 'An early design that is still being explored and may change significantly.',
    tag: {
      text: 'Draft',
      classes: 'govuk-tag--teal',
    },
    banner: {
      titleText: 'Draft',
      html:
      '<p class="govuk-notification-banner__heading">This version is an early draft and may change significantly.</p>' +
      '<p class="govuk-notification-banner__body">Use <a class="govuk-link" href="/current">/current</a> for the latest design.</p>',
    },
  },

  InProgress: {
    label: 'Testing',
    description: 'A version that is currently being designed and tested.',
    tag: {
      text: 'Testing',
      classes: 'govuk-tag--blue',
    },
    banner: {
      titleText: 'Work in progress',
      html:
      '<p class="govuk-notification-banner__heading">This version is actively being designed and tested.</p>' +
      '<p class="govuk-notification-banner__body">Use <a class="govuk-link" href="/current">/current</a> for the latest design.</p>',
    },
  },

  Previous: {
    label: 'Previous',
    description: 'A superseded version retained to show how the design has evolved.',
    tag: {
      text: 'Previous',
      classes: 'govuk-tag--grey',
    },
    banner: {
      titleText: 'Previous',
      html:
        '<p class="govuk-notification-banner__heading">This version has been superseded by a newer design and is retained for reference.</p>' +
        '<p class="govuk-notification-banner__body">Use <a class="govuk-link" href="/current">/current</a> for the latest design.</p>',
    },
  },

  Archived: {
    label: 'Archived',
    description: 'A historic version retained for reference and context only.',
    tag: {
      text: 'Archived',
      classes: 'govuk-tag--grey',
    },
    warning: {
      text: 'This version is archived. It is kept for context and is not part of the agreed service design.',
      iconFallbackText: 'Warning',
    },
  },

  Exploratory: {
    label: 'Exploratory',
    description: 'Concept work that sits outside the agreed service design.',
    tag: {
      text: 'Exploratory',
      classes: 'govuk-tag--orange',
    },
    warning: {
      text: 'This version is exploratory and includes journeys that have not yet been agreed as part of the current service design.',
      iconFallbackText: 'Warning',
    },
  },
}
