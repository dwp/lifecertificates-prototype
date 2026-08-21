module.exports = {
  number: '1',

  title: 'Baseline identity and proof of life service concept',

  status: 'InProgress',

  visible: true,

  date: '10 July 2026',

  about: [
    'This prototype builds on the initial digital proof of life concept created in Version 1.',
    'The prototype explores how customers understand evidence requirements, identity verification and confirmation messaging. Representative-assisted journeys have also been introduced for the first time.',
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
                'After proving their identity, customers can review and request changes to information held by DWP.',
            },
            {
              href: '/customer/tell-us-about-lpa/start',
              title: 'Variation 3: tell us about power of attorney',
              description:
                'Builds on Variation 2 and includes the option to review, remove or register a lasting power of attorney.',
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
    'Field validation is limited.',
    'Internal operational journeys are not yet represented.',
  ],

  changes: {
    added: [
      'Customer proof of life journey to establish a shared understanding of a future digital service.',
    ],

    updated: [],

    removed: [],
  },
}
