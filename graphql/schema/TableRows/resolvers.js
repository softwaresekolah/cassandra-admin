const resolvers = {
  Query: {
    allRowsByTableAndKeyspace: async (self, params, context) => {
      await context.cassandra.execute(`USE ${params.keyspace_name};`);
      const results = await context.cassandra.execute(
        `SELECT * FROM ${params.table_name} LIMIT 100;`
      );
      return results.rows.map(result => JSON.stringify(result));
    },
    countRowsByTableAndKeyspace: async (self, params, context) => {
      await context.cassandra.execute(`USE ${params.keyspace_name};`);
      const results = await context.cassandra.execute(
        `SELECT COUNT(*) FROM ${params.table_name};`
      );
      // console.log(results.rows, results.rowLength);
      return parseInt(results.rows[0].count);
    }
  }
};

exports.resolvers = resolvers;
