const User = `
  type User {
    _id: ID!
    username: String!
    email: String
    phone: String
    roleId: String!
    Role: UserRole
    status: String!
    pictureUrl: String
    lastLoginAt: String
    #
    defaultPassword: String
    passwordUpdatedAt: String
    #
    Alumni: Alumni
    _createdAt: String!
    _updatedAt: String!
  }

  type UserRole {
    _id: ID!
    name: String!
    privileges: [String!]!
    countUsers: Int!
    _createdAt: String!
    _updatedAt: String!
  }

  type UserSession {
    _id: ID!
    User: User!
    token: String!
    expiresIn: String
    _createdAt: String!
    _updatedAt: String!
  }
`;

exports.customTypes = [User];
exports.rootTypes = `
  type Query {
    allUsers: [User!]!
    allUserRoles: [UserRole!]!
    currentUser: User
  }

  type Mutation {
    registerUser (
      username: String!
      password: String!
      roleId: String!
      email: String
      phone: String
      status: String!
    ): User!
    deleteUser (_id: ID!): String
    deactivateUser (_id: ID!): String
    activateUser (_id: ID!): String
    updateUser (
      _id: ID!
      username: String!
      email: String
      phone: String
      pictureUrl: String
    ): String
    updateRoleForUser (
      _id: ID!
      roleId: String!
    ): String
    updateUserPassword (
      _id: ID!
      oldPassword: String!
      newPassword: String!
    ): String
    resetUserPassword (
      _id: ID!
      newPassword: String!
    ): String

    createUserRole (
      name: String!
      privileges: [String!]!  
    ): UserRole!
    updateUserRole (
      _id: ID!
      name: String!
      privileges: [String!]!
    ): String
    deleteUserRole (_id: ID!): String

    logIn (
      username: String!
      password: String!
    ): UserSession!
    logOut: String
  }
`;
