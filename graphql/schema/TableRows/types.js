const Row = `
`;

exports.customTypes = [Row];
exports.rootTypes = `
  type Query {
    allRowsByTableAndKeyspace(keyspace_name: String!, table_name: String!): [String!]!
    countRowsByTableAndKeyspace(keyspace_name: String!, table_name: String!): Int!
  }
`;
