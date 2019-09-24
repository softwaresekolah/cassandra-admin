const resolvers = {
  Query: {
    allRowsByTableAndKeyspace: async (self, params, context) => {
      const results = await context.cassandra.execute(
        `SELECT * FROM ${params.keyspace_name}.${params.table_name} LIMIT 100;`,
        [],
        {
          keyspace: params.keyspace_name
        }
      );
      return results.rows.map(result => JSON.stringify(result));
    },
    countRowsByTableAndKeyspace: async (self, params, context) => {
      const results = await context.cassandra.execute(
        `SELECT COUNT(*) FROM ${params.keyspace_name}.${params.table_name};`,
        [],
        {
          keyspace: params.keyspace_name
        }
      );
      return parseInt(results.rows[0].count);
    }
  }
};

exports.resolvers = resolvers;
