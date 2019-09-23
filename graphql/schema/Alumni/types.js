const Alumni = `
    type Alumni {
        _id: ID!
        name: String!
        email: String!
        phoneNumber: String
        whatsappNumber: String
        birthOfPlace: String
        dateOfBirth: String
        gender: String
        toefl: Int

        isStrata1: String
        entryYearForStrata1: Int
        isStrata2: String
        entryYearForStrata2: Int
        isStrata3: String
        entryYearForStrata3: Int
      
        officeAddress: String
        address: String
        comment: String

        regNumber: String
        job: String
        entryYearForJob: Int
        province: String
        city: String
        profileImageUrl: String

        _createdAt: String!
        _updatedAt: String!
    }
`;

const AlumniCreatePayload = `
    input AlumniCreatePayload {
        name: String!
        email: String!
        phoneNumber: String
        whatsappNumber: String
        birthOfPlace: String
        dateOfBirth: String
        gender: String
        toefl: Int

        isStrata1: String
        entryYearForStrata1: Int
        isStrata2: String
        entryYearForStrata2: Int
        isStrata3: String
        entryYearForStrata3: Int
      
        officeAddress: String
        address: String
        comment: String

        regNumber: String
        job: String
        entryYearForJob: Int
        province: String
        city: String
        profileImageUrl: String

    }
`;

const AlumniRegisterPayload = `
    input AlumniRegisterPayload {
        name: String!
        email: String!
        phoneNumber: String
        whatsappNumber: String

        isStrata1: String
        entryYearForStrata1: Int
        isStrata2: String
        entryYearForStrata2: Int
        isStrata3: String
        entryYearForStrata3: Int
      
        officeAddress: String
        address: String
        comment: String
    }
`;

const AlumniUpdatePayload = `
    input AlumniUpdatePayload {
        name: String
        email: String
        phoneNumber: String
        whatsappNumber: String
        birthOfPlace: String
        dateOfBirth: String
        toefl: Int

        isStrata1: String
        entryYearForStrata1: Int
        isStrata2: String
        entryYearForStrata2: Int
        isStrata3: String
        entryYearForStrata3: Int
      
        officeAddress: String
        address: String
        comment: String
                
        regNumber: String
        job: String
        entryYearForJob: Int
        province: String
        city: String
        profileImageUrl: String

    }
`;

const SearchAlumniCriteria = `
    input SearchAlumniCriteria{
        key: String!
        keyword: String!
        check: Boolean!
        label: String!
    }
`;

exports.customTypes = [
  Alumni,
  AlumniCreatePayload,
  AlumniUpdatePayload,
  AlumniRegisterPayload,
  SearchAlumniCriteria
];

exports.rootTypes = `
    type Query {
        allAlumni: [Alumni!]!
        alumniById(_id: ID!): Alumni
    }

    type Mutation {
        createAlumni(input: AlumniCreatePayload): Alumni
        updateAlumni(_id: ID!, input: AlumniUpdatePayload): String!
        deleteAlumni(_id: ID!): String!
        registerAlumni(input: AlumniRegisterPayload): Alumni        

        importAlumniFromExcel (excelBase64: String!): [ImportAlumniFromExcelResult!]!
        exportAlumniToExcel (criteria: [SearchAlumniCriteria]): String!

        searchAlumni (criteria: [SearchAlumniCriteria]): [Alumni!]!
    }

    type ImportAlumniFromExcelResult {
        _id: ID!
        status: String!
        message: [String!]!
        rawJsonRowData: String!
    }
`;
