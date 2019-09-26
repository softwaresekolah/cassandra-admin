const Row = `
`;

exports.customTypes = [Row];
exports.rootTypes = `
  type Query {
    allRowsByTableAndKeyspace(
      keyspace_name: String!, table_name: String!, 
      column_projections: [String]
    ): [String!]!
    allColumnsByTableAndKeyspace(
      keyspace_name: String!, table_name: String!, 
    ): [String!]!
    countRowsByTableAndKeyspace(keyspace_name: String!, table_name: String!): Int!
  }

  type Mutation {
    createRow(keyspace_name: String!, table_name: String!, row_data: String!): String!
    updateRow(keyspace_name: String!, table_name: String!, row_data: String!): String!
    deleteRow(keyspace_name: String!, table_name: String!): String!

    truncateTable(keyspace_name: String!, table_name: String!): String!

  }
`;
