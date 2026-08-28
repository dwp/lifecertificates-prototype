module.exports = {
  number: '2',

  title: 'Support agent life certificate processing',

  dateCreated: '21 July 2026',

  visible: true,

  status: 'Exploratory',

  dateUpdated: '',

  about: [
    'This prototype introduces a support agent journey for reviewing and processing submitted life certificates.',

    'The prototype explores how support agents review customer and witness information, identify differences, record decisions and complete life certificate processing.',
  ],

  users: [
    {
      title: 'Primary roles',

      items: [
        {
          name: 'Support agent',

          description:
            'Reviews submitted life certificates, assesses differences and records decisions before completing processing.',

          journeys: [
            {
              href: '/support-agent',

              title:
                'Support agent reviews and processes a life certificate',

              description:
                'Review certificate information, identify differences, record decisions and complete life certificate processing.',
            },
          ],
        },
      ],
    },
  ],

  currentFocus: [

    'How support agents review information extracted from submitted life certificates.',
    'How support agents identify and assess differences between submitted information and known customer records.',
    'How support agents record decisions and supporting rationale consistently.',
    'How review workflows help support agents process certificates efficiently.',
    'How customer information, evidence, case history and notes support decision making.',

  ],

  knownGaps: [

    'OCR extraction remains simulated using pre-populated data.',
    'Evidence review uses placeholder interactions.',
    'Case allocation and work management features are not yet represented.',
    'Notifications and downstream actions are not yet represented.',
    'Internal operational processes outside life certificate review are not yet prototyped.',
    'Management information and reporting features are not yet included.',

  ],

  changes: {
    added: [

      'Support agent life certificate processing journey.',
      'Life certificate review workflow covering customer and witness information.',
      'Difference detection and review stages for submitted certificate information.',
      'Decision recording and case note functionality.',
      'Case overview, evidence review and timeline views for support agents.',

    ],

    updated: [

      'Version structure to support dedicated operational user journeys.',
      'Research focus to include internal support agent activities and decision making.',

    ],

    removed: [

    ],
  },
}
