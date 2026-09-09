module.exports = {
  number: '0.3',

  title: 'Summary-led proof of life journey',

  dateCreated: '8 September 2026',

  visible: true,

  status: 'Draft',

  dateUpdated: '9 September 2026',

  about: [
    'This prototype develops the baseline customer journey concepts into a shorter, summary-led proof of life journey.',
    'After document scanning and proof of life, customers review information derived from their documents and held by DWP in one summary.',
    'Customers only need to visit focused sections when information is incorrect or missing. Customers whose information is up to date can complete the journey in 8 screens, including the GOV.UK guidance page.',
    'The prototype also explores evidence requirements, alternative evidence, contact preferences, lasting power of attorney and confirmation messaging.',
    'Representative-assisted journeys are supported, along with deterrents targeted at potential bad actors.',
  ],

  users: [
    {
      title: 'Primary roles',
      items: [
        {
          name: 'Customer',
          description:
            'Provides proof of life when required to continue receiving pension payments.',
          journeys: [
            {
              href: '/customer/zero-knowledge/start',
              title: 'Variation 1: zero knowledge of the customer',
              description:
                'No DWP-held information is shared directly with the customer.',
            },
            {
              href: '/customer/prototype-data',
              title: 'Variation 2: review and change information (with scenario picker)',
              description:
                'After document scanning and proof of life, customers see a summary of information derived from their documents and held by DWP. They can change incorrect information, add missing details and choose how they prefer to be contacted.',
            },
          ],
        },
      ],
    },
  ],

  currentFocus: [
    'The purpose of proof of life and what customers expect after completing the journey.',
    'Completing proof of life and providing supporting evidence digitally.',
    'Providing alternative evidence, such as a letter from a doctor, when a customer cannot use a camera.',
    'Reviewing information derived from documents and held by DWP in a single summary.',
    'Changing incorrect information or adding missing details through short, focused sections of the journey.',
    'Completing the straight-through journey when the information shown is already up to date.',
    'Managing lasting power of attorney information within the service.',
    'The connection between proving identity and reviewing or updating information held by DWP.',
    'Reviewing, adding and updating contact details, then choosing a preferred contact method.',
    'How customers expect their contact details to be used for important notifications and reminders.',
  ],

  knownGaps: [
    'Document scanning uses placeholder interactions.',
    'Proof of life uses placeholder interactions.',
    "Using another nation's credential or evidence, such as a Certificat de Vie, is not yet represented.",
    'Notifications and reminders are described in the journey but are not prototyped.',
    'Limited input field validation.',
    'Validation and error messaging for selecting or adding contact details are not yet complete.',
    'Address selection and comparison behaviour is still being explored.',
    'The summary-card presentation for selecting known addresses is experimental.',
    'Internal operational journeys are not yet represented.',
  ],

  changes: {
    added: [
      'A summary-led journey showing information derived from documents and held by DWP after document scanning and proof of life.',
      'A configurable customer-data scenario picker for testing different paths through the journey, with the complete customer record used as the default happy path.',
      'Focused review sections that allow customers to change incorrect information or add missing details before returning to check answers.',
      'Contact preference journeys that allow customers to choose an existing contact method or add missing email, phone or address information.',
      'Support for selecting a contact address from information held by DWP, an identity document or a newly entered address.',
      'A deterrent in the assisted journey advising that registered lasting powers of attorney will be notified when the journey is completed.',
    ],

    updated: [
      'The straight-through journey so customers whose information is up to date can complete the service in 8 screens, including the GOV.UK guidance page.',
      'Review and change information journeys to show known information first and only ask customers to visit sections that need attention.',
      'Email and phone content to explain how contact details may be used for important notifications and reminders.',
      'Contact preference routing so the selected preference is retained when customers add or later update contact information.',
      'Confirmation messaging to include a reference to confirmation sent by email.',
    ],

    removed: [
      'The requirement for every customer to review pre-filled input pages before reaching check answers.',
      'The separate review and change information variation without power of attorney.',
      'Repeated contact preference logic and assumptions that updating contact information also changes the preferred contact method.',
    ],
  },
}
