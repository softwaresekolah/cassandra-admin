const resolvers = {
  Query: {
    allKeyspaces: async (self, params, context) => {
      let results = await context.cassandra.execute(
        "SELECT * FROM system_schema.keyspaces"
      );

      return results.rows.map(res => ({
        ...res,
        replication: JSON.stringify(res.replication)
      }));
    }
  },

  Mutation: {
    createKeyspace: async (self, params, context) => {
      await context.cassandra.execute(
        `CREATE KEYSPACE IF NOT EXISTS ${params.keyspace_name} WITH replication = { 'class': '${params.replication.class}', 'replication_factor': '${params.replication.replication_factor}'} AND durable_writes = '${params.durable_writes}';`
      );

      return "ok";
    },

    dropKeyspace: async (self, params, context) => {
      await context.cassandra.execute(
        `DROP KEYSPACE IF EXISTS ${params.keyspace_name};`
      );

      return "ok";
    }
  }
};

exports.resolvers = resolvers;
