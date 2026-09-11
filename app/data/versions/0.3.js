module.exports = {
  number: '0.3',

  title: 'Summary-led proof of life journey',

  dateCreated: '8 September 2026',

  visible: true,

  status: 'Draft',

  dateUpdated: '9 September 2026',

  about: [
    'This prototype develops the DWP-held information journey into a shorter, summary-led proof of life journey.',
    'When customers prove life using the camera, they review information from their identity document and DWP records in one summary.',
    'Customers only visit additional sections to change incorrect information or add missing details.',
    'Customers whose information is up to date can complete the journey in 8 screens, including the GOV.UK guidance page.',
    'The prototype also explores alternative evidence, contact preferences, lasting power of attorney, assisted journeys, confirmation messaging and deterrents for potential bad actors.',
  ],

  users: [
    {
      title: 'Primary roles',
      items: [
        {
          name: 'Customer',
          description:
            'Provides proof of life to continue receiving pension payments.',
          journeys: [
            {
              href: '/customer/zero-knowledge/start',
              title: 'Variation 1: zero knowledge of the customer',
              description:
                'Customers provide information using blank fields without seeing information held by DWP.',
            },
            {
              href: '/customer/review-and-change-info/setup-scenario',
              title: 'Variation 2: review customer info (with scenario setup)',
              description:
                'When they prove life using the camera, customers can review, change or add information held by DWP.',
            },
          ],
        },
      ],
    },
  ],

  currentFocus: [
    'Customer\'s understanding the purpose of proof of life and what happens after the journey.',
    'Completing proof of life and providing supporting evidence digitally.',
    'Providing a doctor’s letter when a customer cannot prove life using the camera.',
    'Reviewing information from an identity document and DWP records in one summary.',
    'Changing incorrect information or adding missing details through focused sections.',
    'Completing the shorter journey when the information shown is up to date.',
    'Understanding and managing lasting power of attorney information.',
    'Understanding how proving identity enables customers to review and update DWP records.',
    'Reviewing and updating contact details before choosing a preferred contact method.',
    'Understanding how contact details may be used for important notifications and reminders.',
  ],

  knownGaps: [
    'Document scanning and proof of life use placeholder interactions.',
    'Credentials and evidence used by other countries, such as a Certificat de Vie, are not represented.',
    'Notifications and reminders are described but not prototyped.',
    'Input validation and error messaging are limited.',
    'Address selection and comparison are still being explored.',
    'Summary cards for selecting known addresses are experimental.',
    'Internal operational journeys are not represented.',
  ],

  changes: {
    added: [
      'A summary-led journey for reviewing information from identity documents and DWP records after proving life using the camera.',
      'Scenario setup for testing different combinations of identity, payment, contact and lasting power of attorney information.',
      'Focused sections for changing incorrect information or adding missing details before returning to check answers.',
      'Contact preference journeys for choosing existing contact details or adding missing information.',
      'Options for using a DWP-held address, an identity document address or a newly entered address.',
      'A deterrent explaining that registered attorneys will be notified when the journey is completed.',
    ],

    updated: [
      'The straight-through journey so customers with up-to-date information can complete it in 8 screens, including the GOV.UK guidance page.',
      'Review and change journeys to show known information before asking customers to make changes.',
      'Email and phone content to explain how contact details may be used for important notifications and reminders.',
      'Contact preference routing to retain the selected preference when contact information is added or updated.',
      'Confirmation messaging to refer to confirmation sent by email.',
    ],

    removed: [
      'The requirement for every customer to review pre-filled input pages before reaching check answers.',
      'The separate review and change variation without lasting power of attorney.',
      'Repeated contact preference logic and the assumption that updating contact details changes the preferred contact method.',
    ],
  },
}
