const Keyspace = `
  type Keyspace {
    keyspace_name: String
    durable_writes: Boolean
    replication: String
  }

  input Replication {
    class: String
    replication_factor: Int
  }

  
`;
exports.customTypes = [Keyspace];
exports.rootTypes = `
  type Query {
    allKeyspaces: [Keyspace]
  }

  type Mutation {
    createKeyspace(
      keyspace_name: String
      durable_writes: Boolean
      replication: Replication
    ): String!

    dropKeyspace(
      keyspace_name: String
    ): String!
  }


`;