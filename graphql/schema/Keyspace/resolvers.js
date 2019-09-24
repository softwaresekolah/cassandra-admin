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
    },
    info: async (self, params, context) => {
      // const results = await context.cassandra.execute(
      //   `SELECT * FROM system.local`
      // );
      // return results.rows.map(result => JSON.stringify(result));
      const results = await context.cassandra.execute(
        `SELECT * FROM system.local`
      );
      if(results && results.rows[0]){
        return JSON.stringify(results.rows[0]);
      }
    }
  },

  Mutation: {
    createKeyspace: async (self, params, context) => {
      await context.cassandra.execute(
        `CREATE KEYSPACE IF NOT EXISTS ${params.keyspace_name} WITH replication = { 'class': '${params.class}', 'replication_factor': '${params.replication_factor}'} AND durable_writes = '${params.durable_writes}';`
      );

      return "ok";
    },

    alterKeyspace: async (self, params, context) => {
      await context.cassandra.execute(
        `ALTER KEYSPACE ${params.keyspace_name} WITH replication = {'class': '${params.class}', 'replication_factor': '${params.replication_factor}'} AND durable_writes = '${params.durable_writes}'`
      );

      return "ok";
    },

    dropKeyspace: async (self, params, context) => {
      await context.cassandra.execute(
        `DROP KEYSPACE IF EXISTS ${params.keyspace_name};`
      );

      return "ok";
    }
  },
  Keyspace: {
    countTables: async (self, params, context) => {
      const results = await context.cassandra.execute(
        `SELECT COUNT(*) FROM system_schema.tables WHERE keyspace_name='${self.keyspace_name}'`
      );
      return parseInt(results.rows[0].count);
    }
  }
};

exports.resolvers = resolvers;
