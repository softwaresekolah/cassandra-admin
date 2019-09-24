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
    createTable: async (self, params, context) => {
      // console.log(params.column)

      let stringQuery = "";
      for (const c of params.column) {
        stringQuery += `${c.column_name} ${c.type} ${
          c.kind === "partition_key" ? "PRIMARY KEY" : ""
        }, `;
      }

      stringQuery = stringQuery.split(" ,").join("");
      // console.log(stringQuery);

      try {
        // await context.cassandra.execute(`USE ${params.keyspace_name}`);

        await context.cassandra.execute(
          `CREATE TABLE IF NOT EXISTS ${params.keyspace_name}.${params.table_name}(${stringQuery})`
          // [],
          // { keyspace: params.keyspace_name }
        );
      } catch (err) {
        throw new Error("Error, Keyspace not found: ", err);
        return err;
      }
      return "ok";
    },

    alterAddColumn: async (self, params, context) => {
      let stringQuery = "";
      for (const c of params.column) {
        stringQuery += `${c.column_name} ${c.type} ${
          c.kind === "partition_key" ? "PRIMARY KEY" : ""
        }, `;
      }

      stringQuery = stringQuery.split(" ,").join("");

      try {
        await context.cassandra.execute(
          `ALTER TABLE ${params.keyspace_name}.${params.table_name} ADD (${stringQuery})`
        );
      } catch (err) {
        throw new Error("Error, Keyspace not found: ", err);
        return err;
      }

      return "ok";
    },

    dropTable: async (self, params, context) => {
      try {
        await context.cassandra.execute(`USE ${params.keyspace_name}`);

        await context.cassandra.execute(
          `DROP TABLE IF EXISTS ${params.table_name}`
        );
      } catch (err) {
        throw new Error("Error, Keyspace not found: ", err);
        return err;
      }
      return "ok";
    }
  },

  Table: {
    Columns: async (self, params, context) => {
      // console.log(self);
      const results = await context.cassandra.execute(`
      SELECT * FROM system_schema.columns WHERE keyspace_name = '${self.keyspace_name}' AND table_name = '${self.table_name}';
      `);

      return results;
    }
  }
};

exports.resolvers = resolvers;
