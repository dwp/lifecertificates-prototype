module.exports = [
  {
    id: 'CASE-001',

    customer: {
      nino: 'QQ123456A',
      name: 'Maria Fernandez',
      phone: '+34 612 345 678',
      address: {
        line1: 'Calle Mayor 45',
        line2: null,
        townOrCity: 'Madrid',
        county: null,
        postcode: '28013',
        country: 'Spain',
      },
    },

    scannedCustomer: {
      name: 'Maria Fernandaz',
      phone: '+34 612 345 678',
      freeText: 'Recently moved house.',
      address: {
        line1: 'Calle Mayor 45',
        line2: null,
        townOrCity: 'Madrid',
        county: null,
        postcode: '28013',
        country: 'Spain',
      },
    },

    witness: {
      name: 'Carlos Ruiz',
      jobTitle: 'Doctor',
      phone: '+34 911 223 344',
      address: {
        organisation: 'Hospital Central',
        line1: 'Department of General Medicine',
        line2: null,
        townOrCity: 'Madrid',
        county: null,
        postcode: '28040',
        country: 'Spain',
      },
    },

    scannedWitness: {
      name: 'Carlos Ruiz',
      jobTitle: 'Doctor',
      phone: '+34 911 223 344',
      address: {
        organisation: 'Hospital Central',
        line1: 'Dept of General Medicine',
        line2: null,
        townOrCity: 'Madrid',
        county: null,
        postcode: '28040',
        country: 'Spain',
      },
    },

    checks: {
      nameMatch: false,
      addressMatch: true,
      phoneMatch: true, // ✅ added
      signatureMatch: null,
      witnessValid: true,
    },

    evidence: {
      received: true,
      needsReview: true,
    },

    notes: [
      {
        text: 'Name mismatch identified between scanned form and existing record.',
        datetime: '12 May 2026 at 14:10',
        by: 'System',
        type: 'system-flag',
      },
      {
        text: 'Checked scanned form and confirmed mismatch requires manual verification.',
        datetime: '12 May 2026 at 14:18',
        by: 'Support agent',
        type: 'note',
      },
      {
        text: 'Signature comparison pending review.',
        datetime: '12 May 2026 at 14:22',
        by: 'Support agent',
        type: 'note',
      },
    ],

    timeline: [
      {
        title: 'Life certificate received',
        byline: 'System',
        date: '10 May 2026 at 9:15am',
        description: { text: 'Form received and logged.' },
      },
      {
        title: 'Documents scanned',
        byline: 'Scanning team',
        date: '11 May 2026 at 11:30am',
        description: { text: 'Scanned copies stored in the system.' },
      },
      {
        title: 'Flagged for review',
        byline: 'System',
        date: '12 May 2026 at 2:05pm',
        description: { text: 'Name mismatch requires manual verification.' },
      },
    ],

    status: 'Needs review',
    statusTagClass: 'govuk-tag--yellow',
  },

  {
    id: 'CASE-002',

    customer: {
      nino: 'QQ987654B',
      name: 'Lukas Schneider',
      phone: '+49 151 2345678',
      address: {
        line1: 'Hauptstrasse 10',
        line2: 'Apt 5B',
        townOrCity: 'Berlin',
        county: null,
        postcode: '10115',
        country: 'Germany',
      },
    },

    scannedCustomer: {
      name: 'Lukas Schneider',
      phone: '+49 151 2345678',
      freeText: '',
      address: {
        line1: 'Hauptstraße 10',
        line2: 'Apartment 5B',
        townOrCity: 'Berlin',
        county: 'Berlin',
        postcode: '10115',
        country: 'Germany',
      },
    },

    witness: {
      name: 'Anna Becker',
      jobTitle: 'Lawyer',
      phone: '+49 30 123456',
      address: {
        organisation: 'Becker Legal Services',
        line1: 'Unter den Linden 5',
        line2: null,
        townOrCity: 'Berlin',
        county: null,
        postcode: '10117',
        country: 'Germany',
      },
    },

    scannedWitness: {
      name: 'Anna Becker',
      jobTitle: 'Lawyer',
      phone: '+49 30 123456',
      address: {
        organisation: 'Becker Legal Services',
        line1: 'Unter den Linden 5',
        line2: null,
        townOrCity: 'Berlin',
        county: null,
        postcode: '10117',
        country: 'Germany',
      },
    },

    checks: {
      nameMatch: true,
      addressMatch: true,
      phoneMatch: true, // ✅ added
      signatureMatch: true,
      witnessValid: true,
    },

    evidence: {
      received: true,
      needsReview: false,
    },

    notes: [
      {
        text: 'All scanned details matched existing customer record.',
        datetime: '10 May 2026 at 09:04',
        by: 'System',
        type: 'system-check',
      },
      {
        text: 'Witness details verified and acceptable.',
        datetime: '10 May 2026 at 09:05',
        by: 'Support agent',
        type: 'note',
      },
      {
        text: 'Case marked as complete.',
        datetime: '10 May 2026 at 09:06',
        by: 'Support agent',
        type: 'decision',
      },
    ],

    timeline: [
      {
        title: 'Life certificate received',
        byline: 'System',
        date: '8 May 2026 at 8:50am',
        description: { text: 'Form received and logged.' },
      },
      {
        title: 'Documents scanned',
        byline: 'Scanning team',
        date: '9 May 2026 at 10:10am',
        description: { text: 'Documents digitised.' },
      },
      {
        title: 'Automatically approved',
        byline: 'System',
        date: '10 May 2026 at 9:05am',
        description: { text: 'All checks matched existing records.' },
      },
    ],

    status: 'Complete',
    statusTagClass: 'govuk-tag--green',
  },

  {
    id: 'CASE-004',

    customer: {
      nino: 'QQ445566D',
      name: 'Chen Wei',
      phone: '+86 138 0000 0000',
      address: {
        line1: 'Pudong District',
        line2: null,
        townOrCity: 'Shanghai',
        county: null,
        postcode: '200120',
        country: 'China',
      },
    },

    scannedCustomer: {
      name: 'Chen Wei',
      phone: '+86 138 0000 0000',
      freeText: '',
      address: {
        line1: 'Pudong',
        line2: null,
        townOrCity: 'Shanghai',
        county: null,
        postcode: '200120',
        country: 'China',
      },
    },

    witness: {
      name: 'Li Zhang',
      jobTitle: 'Accountant',
      phone: '+86 21 1234 5678',
      address: {
        organisation: 'Finance Centre',
        line1: 'Pudong District',
        line2: null,
        townOrCity: 'Shanghai',
        county: null,
        postcode: '200000',
        country: 'China',
      },
    },

    scannedWitness: {
      name: 'Li Zhang',
      jobTitle: 'Accountant',
      phone: '+86 21 1234 5678',
      address: {
        organisation: 'Finance Centre',
        line1: 'Pudong District',
        line2: null,
        townOrCity: 'Shanghai',
        county: null,
        postcode: '200000',
        country: 'China',
      },
    },

    checks: {
      nameMatch: true,
      addressMatch: true,
      phoneMatch: true, // ✅ added
      signatureMatch: true,
      witnessValid: true,
    },

    evidence: { received: true, needsReview: false },

    notes: [
      {
        text: 'All customer details verified against existing records.',
        datetime: '12 May 2026 at 10:20',
        by: 'Support agent',
        type: 'note',
      },
      {
        text: 'Witness organisation and role confirmed as valid.',
        datetime: '12 May 2026 at 10:24',
        by: 'Support agent',
        type: 'note',
      },
      {
        text: 'No discrepancies identified. Case completed.',
        datetime: '12 May 2026 at 10:25',
        by: 'Support agent',
        type: 'decision',
      },
    ],

    timeline: [
      {
        title: 'Life certificate received',
        byline: 'System',
        date: '10 May 2026 at 9:15am',
        description: { text: 'Form received and logged.' },
      },
      {
        title: 'Documents scanned',
        byline: 'Scanning team',
        date: '11 May 2026 at 11:30am',
        description: { text: 'Scanned copies stored in the system.' },
      },
      {
        title: 'Case completed',
        byline: 'Support agent',
        date: '12 May 2026 at 10:25am',
        description: { text: 'No discrepancies identified.' },
      },
    ],

    status: 'Complete',
    statusTagClass: 'govuk-tag--green',
  },

  {
    id: 'CASE-005',

    customer: {
      nino: 'QQ556677E',
      name: 'Elena Rossi',
      phone: '+39 345 678 9012',
      address: {
        line1: 'Via Roma 12',
        line2: null,
        townOrCity: 'Milan',
        county: null,
        postcode: '20100',
        country: 'Italy',
      },
    },

    scannedCustomer: {
      name: 'Elena Rossi',
      phone: '+39 345 678 9012',
      freeText: '',
      address: {
        line1: 'Via Roma 12',
        line2: null,
        townOrCity: 'Milano',
        county: null,
        postcode: '20100',
        country: 'Italy',
      },
    },

    witness: {
      name: 'Marco Bianchi',
      jobTitle: 'Engineer',
      phone: '+39 02 1234567',
      address: {
        organisation: 'Engineering Group',
        line1: 'Via Roberto 9',
        line2: null,
        townOrCity: 'Milan',
        county: null,
        postcode: '20121',
        country: 'Italy',
      },
    },

    scannedWitness: {
      name: 'Marco Bianchi',
      jobTitle: 'Engineer',
      phone: '+39 02 1234567',
      address: {
        organisation: 'Engineering Group',
        line1: 'Via Roberto 9',
        line2: null,
        townOrCity: 'Milan',
        county: null,
        postcode: '20121',
        country: 'Italy',
      },
    },

    checks: {
      nameMatch: true,
      addressMatch: false,
      phoneMatch: true, // ✅ added
      signatureMatch: null,
      witnessValid: true,
    },

    evidence: { received: true, needsReview: true },

    notes: [
      {
        text: "Address mismatch identified between 'Milan' and 'Milano'.",
        datetime: '12 May 2026 at 13:05',
        by: 'System',
        type: 'system-flag',
      },
      {
        text: 'Reviewed address variation — likely localisation issue.',
        datetime: '12 May 2026 at 13:18',
        by: 'Support agent',
        type: 'note',
      },
      {
        text: 'Awaiting confirmation whether address change is valid.',
        datetime: '12 May 2026 at 13:35',
        by: 'Support agent',
        type: 'note',
      },
    ],

    timeline: [
      {
        title: 'Life certificate received',
        byline: 'System',
        date: '10 May 2026 at 9:15am',
        description: { text: 'Form received and logged.' },
      },
      {
        title: 'Documents scanned',
        byline: 'Scanning team',
        date: '11 May 2026 at 11:30am',
        description: { text: 'Scanned copies stored in the system.' },
      },
      {
        title: 'Flagged for review',
        byline: 'System',
        date: '12 May 2026 at 2:05pm',
        description: { text: 'Address mismatch requires review.' },
      },
    ],

    status: 'Needs review',
    statusTagClass: 'govuk-tag--yellow',
  },
]
