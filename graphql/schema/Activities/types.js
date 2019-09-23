const Activities = `
    type Activities{
        _id: ID!
        name: String!
        description: String!
        date: String!
        imageUrl: String!
        activityDocumentationIds: [ID]
        ActivityDocumentation: ActivityDocumentation
        _createdAt: String!
        _updatedAt: String!
    }    
    type ActivityDocumentation{
        _id: ID!        
        thumbnails: [String]
    }
`;

const createActivityPayload = `
    input createActivityPayload {
        name: String!
        description: String!
        date: String!
        imageUrl: String!                    
    }
`;

const createActivityDocumentationPayload = `
    input createActivityDocumentationPayload {        
        thumbnails: [String]
    }
`;
const updateActivityPayload = `
    input updateActivityPayload{
        name: String
        description: String
        date: String
        imageUrl: String
    }
`;

const updateActivityDocumentationPayload = `
    input updateActivityDocumentationPayload{        
        thumbnail: [String]
    }
`;

exports.customTypes = [
  Activities,
  createActivityPayload,
  createActivityDocumentationPayload,
  updateActivityPayload,
  updateActivityDocumentationPayload
];

exports.rootTypes = `
    type Query{
        allActivities: [Activities]!
        allActivityDocumentation(_id: ID!): ActivityDocumentation!
    }
    type Mutation{
        createActivity(input: createActivityPayload): String!
        createActivityDocumentation(activityGroupId: ID!,input: createActivityDocumentationPayload): String!

        updateActivity(_id: ID!,input: updateActivityPayload): String!
        updateActivityDocumentation(_id: ID!,input: updateActivityDocumentationPayload): String!
        
        deleteActivity(_id: ID!): String!
        deleteActivityDocumentation(_id: ID!,thumbnail: String!): String!
    }
    `;
