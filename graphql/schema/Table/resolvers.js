const resolvers = {
  Query: {
    allTablesByKeyspace: async (self, params, context) => {
      const results = await context.cassandra.execute(
        `SELECT * FROM system_schema.tables WHERE keyspace_name = '${params.keyspace_name}'`
      );

      return results.rows;
    }
  },

  Mutation: {
    createTable: async (self, params, context) => {}
  },

  Table: {
    Columns: async (self, params, context) => {
      // console.log(self);
      const results = await context.cassandra.execute(`
      SELECT * FROM system_schema.columns WHERE keyspace_name = '${self.keyspace_name}' AND table_name = '${self.table_name}';
      `);

      console.log(results);

      return results;
    }
  }
};

exports.resolvers = resolvers;
