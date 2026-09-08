module.exports = {
  number: '3',

  title: 'Proof of life service concept',

  dateCreated: '8 September 2026',

  visible: true,

  status: 'Draft',

  dateUpdated: 'Not applicable',

  about: [
    'This prototype builds on the initial digital proof of life concept.',
    'The prototype explores customers understanding of evidence requirements, identity verification and confirmation messaging. Representative-assisted journeys are also supported as are deterrents targeted at bad actors',
  ],

  users: [
    {
      title: 'Primary roles',
      items: [
        {
          name: 'Customer',
          description:
            'Provides proof of life when required to continue to receive pension payments.',
          journeys: [
            {
              href: '/customer/zero-knowledge/start',
              title: 'Variation 1: zero knowledge of the customer',
              description: 'No DWP-held information is shared directly with the customer.',
            },
            {
              href: '/customer/review-and-change-info/start',
              title: 'Variation 2: review and change information',
              description:
                'After proving their identity, customers can review and request changes to information held by DWP including reviewing previously registered power of attorney.',
            },
          ],
        },
      ],
    },
  ],

  currentFocus: [
    'If customers understand the purpose of proof of life.',
    'If customers can complete a proof of life journey digitally.',
    'If customers can provide supporting evidence digitally.',
    'If customers who cannot prove life using a camera can share a letter from a doctor with the service.',
    'If customers can understand lasting power of attorney within the service.',
    'If customers can provide details in the service.',
    'If customers can understand how proving their identity and proof of life can enable them to update any details held by DWP.',
    'If customers understand what happens after completing the journey.',
  ],

  knownGaps: [
    'Document scanning uses placeholder interactions.',
    'Proof of life uses placeholder interactions.',
    "Using another nation's credential or evidence, like a Cert de Vie, is not yet represented.",
    'Notifications and reminders are not prototyped.',
    'Limited input field validation.',
    'Internal operational journeys are not yet represented.',
  ],

  changes: {
    added: [
      'Non-editable display of known information before the user makes any changes.',
      'Deterrent for potential bad actors in an assisted journey: guidance advising that all registered lasting powers of attorney will be notified on journey completion.',
    ],

    updated: [
      'Confirmation screen messaging to include reference to confirmation sent by email.'
    ],

    removed: [
      'Variation for review and change info (without power of attorney) to simplify prototype.'
    ],
  },
}
