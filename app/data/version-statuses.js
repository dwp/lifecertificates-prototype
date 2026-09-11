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
  Draft: {
    label: 'Draft',
    description:
      'A design that is still being developed and has not been approved as the current baseline.',
    tag: {
      text: 'Draft',
      classes: 'govuk-tag--blue',
    },
    banner: {
      titleText: 'Draft',
      html:
        '<p class="govuk-notification-banner__heading">This version is still being developed.</p>' +
        '<p class="govuk-notification-banner__body">Use <a class="govuk-link" href="/current">/current</a> for the latest version.</p>',
    },
  },

  Current: {
    label: 'Current',
    description:
      'The approved prototype version and current design baseline.',
    tag: {
      text: 'Current',
      classes: 'govuk-tag--green',
    },
    banner: {
      type: 'success',
      titleText: 'Current',
      html:
        '<p class="govuk-notification-banner__heading">This is the current design baseline.</p>',
    },
  },

  Previous: {
    label: 'Previous',
    description:
      'A previous design baseline replaced by a newer approved version.',
    tag: {
      text: 'Previous',
      classes: 'govuk-tag--grey',
    },
    banner: {
      titleText: 'Previous',
      html:
        '<p class="govuk-notification-banner__heading">This version has been replaced by a newer approved design.</p>' +
        '<p class="govuk-notification-banner__body">Use <a class="govuk-link" href="/current">/current</a> for the latest version.</p>',
    },
  },

  Archived: {
    label: 'Archived',
    description:
      'A historic or discontinued version retained for context.',
    tag: {
      text: 'Archived',
      classes: 'govuk-tag--grey',
    },
    warning: {
      text: 'This version is archived and is not part of the current service design.',
      iconFallbackText: 'Warning',
    },
  },
}
