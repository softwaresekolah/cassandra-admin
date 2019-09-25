const resolvers = {
  Query: {
    allRowsByTableAndKeyspace: async (self, params, context) => {
      // const results = await context.cassandra.execute(
      //   `SELECT * FROM ${params.keyspace_name}.${params.table_name} LIMIT 100;`,
      //   [],
      //   {
      //     keyspace: params.keyspace_name
      //   }
      // );

      // console.log(results)
      // return results.rows.map(result => JSON.stringify(result));

      let selectedProjections =
        params.column_projections.length === 0
          ? "*"
          : String(params.column_projections);

      const results = await context.cassandra.execute(
        `SELECT ${selectedProjections} FROM ${params.keyspace_name}.${params.table_name} LIMIT 100;`,
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
    },

    allColumnsByTableAndKeyspace: async (self, params, context) => {
      const results = await context.cassandra.execute(
        `SELECT * FROM ${params.keyspace_name}.${params.table_name} LIMIT 100;`,
        [],
        {
          keyspace: params.keyspace_name
        }
      );
      return results.columns.map(result => JSON.stringify(result.name));
    }
  }
};

exports.resolvers = resolvers;
