module.exports = {
    number: '2.1',
  
    title: 'Assisting medically incapacitated customers',
  
    status: 'InProgress',

    visible: false,
  
    date: 'Not applicable',
  
    about: [
      'This prototype builds on the initial digital proof of life concept created in Version 1.',
      'The prototype explores how customers understand evidence requirements, identity verification and confirmation messaging. Representative-assisted journeys have also been introduced for the first time.'
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
                href: '/customer',
                title: 'Customer learns about the service and provides proof of life'
              }
            ]
          },
          {
            name: 'Support agent',
            description:
              'Reviews proof of life forms, also known as life certificates, and works individual cases.',
            journeys: []
          },
          {
            name: 'Service manager',
            description: 'Monitors workload and service risks.',
            journeys: []
          }
        ]
      },
      {
        title: 'Secondary roles',
        items: [
          {
            name: 'Lasting power of attorney',
            description:
              "Acts on behalf of a customer and can access information like a customer's pension payments.",
            journeys: []
          },
          {
            name: 'Witness',
            description:
              "Reviews and vouches for a customer's identity in the offline journey.",
            journeys: []
          }
        ]
      },
      {
        title: 'Exploratory roles',
        description:
          'Roles connected to the service that require further exploration and research.',
        items: [
          {
            name: 'Assisting representative',
            description:
              'Assists the customer to complete document scanning and proof of life checks. Has no access to DWP-held information about the customer.',
            journeys: [
              {
                href: '/representative',
                title: 'Representative helps a customer complete proof of life',
                description:
                  "Branched from the customer's journey if the customer cannot complete biometric liveness checks."
              }
            ]
          }
        ]
      }
    ],
  
    currentFocus: [
      'Whether customers understand what evidence they need to provide.',
      'Whether customers understand why identity verification is required.',
      'Whether customers can review and confirm existing information with confidence.',
      'How representatives may interact with the service.',
      'What support is needed for customers who cannot complete the journey independently.'
    ],
  
    knownGaps: [
      'Representative journeys are exploratory and require further validation.',
      'Providing a Cert de Vie is not yet represented.',
      'Document scanning uses placeholder interactions.',
      'Notifications and reminders are not yet prototyped.',
      'Error handling remains limited.',
      'Operational journeys are not yet represented.'
    ],
  
    changes: {
      added: [
        'Representative journey because support for third-party interactions required further exploration.',
        'Additional guidance content because some customers needed more support during the journey.'
      ],
  
      updated: [
        'Evidence guidance because customers needed clearer information about what they need to provide.',
        'Identity verification content because customers were unsure why identity verification was required.',
        'Confirmation messaging because customers needed clearer information about outcomes and next steps.'
      ],
  
      removed: [
        'Duplicate guidance content because it was no longer adding value to the journey.'
      ]
    }
  }
  