const User = `
  type User {
    _id: ID!
    username: String!
    email: String
    phone: String
    roleId: String!
    status: String!
    pictureUrl: String
    lastLoginAt: String
    #
    defaultPassword: String
    passwordUpdatedAt: String
    #
    _createdAt: String!
    _updatedAt: String!
  }`;
exports.customTypes = [User];
exports.rootTypes = `
  type Query {
    allUsers: [User!]!
    currentUser: User
  }

  type Mutation {
    logIn (
      username: String!
      password: String!
    ): String!
    logOut: String
  }
`;
