module.exports = {
  identityDocument: {
    type: 'Driver license',

    extractedDetails: {
      fullName: 'Maria Fernandez',
      dateOfBirth: '5 January 1978',

      address: {
        line1: 'Calle Mayor 45',
        line2: '',
        town: 'Madrid',
        county: '',
        postcode: '28013',
        country: 'Spain'
      }
    }
  },

  paymentDetails: {
    nameOnTheAccount: 'Mrs Maria Fernandez',
    sortCode: '11-22-33',
    accountNumber: '12345678',
    rollNumber: 'A1B2C3D4'
  },

  contactDetails: {
    address: {
      line1: 'Calle Mayor 45',
      line2: '',
      town: 'Madrid',
      county: '',
      postcode: '28013',
      country: 'Spain'
    },
    emailAddress: 'maria.fernandez78@example.com',
    phone: {
      countryCode: '34',
      nationalNumber: '7900 900123',
      isMobile: true
    },
    contactPreference: 'Post'
  },

  powerOfAttorney: {
    hasLPA: true,

    registeredLPAs: [
      {
        representative: 'Jan Attornisson',
        registeredDate: '10 May 2022'
      },
      {
        representative: 'John Smith',
        registeredDate: '1 June 2023'
      }
    ]
  },

  doctor: {
    fullName: 'Dr Watson',

    practice: {
      name: 'Doctors Inc.',
      address: {
        line1: '999 Letsby Avenue',
        line2: 'Suburbia',
        town: 'City of Town',
        county: 'Countyshireford',
        postcode: 'PO57 3DE',
        country: 'United Kingdom'
      }
    },

    emailAddress: 'dr.watson@medicalpractice.com',
    phoneNumber: '+44 7900 123900',

    letter: {
      fileName: 'letter-from-doctor.pdf'
    }

  }
}
