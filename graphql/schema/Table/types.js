const Table = `
  type Table {
    table_name: String
    Columns: [Column]
  }

  type Column {
    column_name: String
    type: String
    kind: String
  }

  input ColumnPayload {
    isPrimaryKey: Boolean
    isStatic: Boolean
    type: String
    column_name: String
  }
`;

exports.customTypes = [Table];
exports.rootTypes = `
  type Query {
    allTablesByKeyspace(keyspace_name: String!): [Table]
  }

  type Mutation {
    createTable(table_name: String!, column: [ColumnPayload]): String!
  }
`;
