const Table = `
  enum ColumnType {
    text
    int
    varchar
    boolean
    varint
    uuid
    tinyint
    timeuuid
    timestamp
    time
    smallint
    float
    inet
    duration
    double
    decimal
    counter
    blob
    bigint
    ascii

  }
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
    kind: String
    #isStatic: Boolean
    type: ColumnType
    column_name: String
  }
`;

exports.customTypes = [Table];
exports.rootTypes = `
  type Query {
    allTablesByKeyspace(keyspace_name: String!): [Table]
  }

  type Mutation {
    createTable(keyspace_name: String!, table_name: String!, column: [ColumnPayload]): String!
    dropTable(keyspace_name: String!, table_name: String!): String!
    alterAddColumn(keyspace_name: String!, table_name: String!, column: [ColumnPayload]): String!
    alterDropColumn(keyspace_name: String!, table_name: String!, column_name: String!): String!
  } 
`;
