module.exports = {

  number: '0.4',

  title: 'One Login/Letter hybrid authentication',

  dateCreated: '16 September 2026',

  visible: true,

  status: 'Draft',

  designTrack: 'Exploratory',

  researchStatus: 'Not tested',

  dateUpdated: 'Not applicable',

  about: [
    'This prototype explores how customers authenticate into a proof of life service.',
    'Customers can tell us whether they have received a letter from DWP.',
    'Customers who have received a letter can use a code from the letter with personal information held by DWP.',
    'Customers who have not received a letter can authenticate using a mocked GOV.UK One Login journey.',
    'After authentication, customers return to the proof of life journey they started.',
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
              title: '1: zero knowledge of the customer',
              description: 'Customers enter information into blank fields without seeing information held by DWP.',
              id: 'zero-knowledge',
              href: '/customer/zero-knowledge/start',
              authentication: {
                startHref: '../authenticate/start?journey=zero-knowledge',
                returnTo: '/customer/zero-knowledge/document-front-scan',
              },
            },
            {
              title: '2: review customer info (with scenario setup)',
              description: 'Customers review and update information held by DWP.',
              id: 'review-and-change-info',
              href: '/customer/review-and-change-info/setup-scenario',
              authentication: {
                startHref: '../authenticate/start?journey=review-and-change-info',
                returnTo: '/customer/review-and-change-info/document-front-scan',
              },
            },
          ],
        },
      ],
    },
  ],

  currentFocus: [
    'Understanding whether customers expect to authenticate before starting the proof of life journey.',
    'Understanding whether customers recognise which authentication option applies to them.',
    'Understanding whether customers know if they have received a relevant letter from DWP.',
    'Understanding whether customers can find and enter the code from their DWP letter.',
    'Understanding whether customers are comfortable using personal information held by DWP as part of authentication.',
    'Understanding whether customers recognise GOV.UK One Login and understand why they are being directed to it.',
    'Understanding whether customers can move through authentication and return to the proof of life journey.',
    'Comparing the letter and GOV.UK One Login authentication routes.',
  ],

  knownGaps: [
    'The authentication journey does not verify the information entered by the customer.',
    'The format of the code included in the DWP letter has not been confirmed.',
    'The GOV.UK One Login journey uses placeholder pages and does not represent the complete service.',
    'The prototype does not connect to GOV.UK One Login.',
    'Authentication failures, expired codes and locked accounts are not represented.',
    'Input validation and error messaging are limited.',
  ],

  changes: {
    added: [
      'A shared authentication journey used by the review and change information and zero-knowledge journeys.',
      'A choice between authenticating with a code from a DWP letter or GOV.UK One Login.',
      'A letter authentication route using a 10-character example code and the customer’s date of birth.',
      'A placeholder GOV.UK One Login authentication route.',
      'Journey-specific configuration that returns customers to the journey they started after authentication.',
    ],

    updated: [],

    removed: [],
  },
}
