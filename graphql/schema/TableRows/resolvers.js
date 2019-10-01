const resolvers = {
  Query: {
    allRowsByTableAndKeyspace: async (self, params, context) => {
      let selectedProjections =
        params.column_projections.length === 0
          ? "*"
          : String(params.column_projections);

      // console.log(selectedProjections);

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
      // const results = await context.cassandra.execute(
      //   `SELECT * FROM ${params.keyspace_name}.${params.table_name} LIMIT 100;`,
      //   [],
      //   {
      //     keyspace: params.keyspace_name
      //   }
      // );
      // return results.columns.map(result => JSON.stringify(result.name));

      let results = await context.cassandra.execute(
        `SELECT column_name, type, kind from system_schema.columns where keyspace_name='${params.keyspace_name}' AND table_name='${params.table_name}'`
      );

      return results.rows.map(res => JSON.stringify(res));
    }
  },

  Mutation: {
    createRow: async (self, params, context) => {
      try {
        // const results = await context.cassandra.execute(
        //   `SELECT column_name, type, kind FROM system_schema.columns WHERE keyspace_name = '${params.keyspace_name}' AND table_name='${params.table_name}'`
        // );

        // // console.log(Object.keys(JSON.parse(params.row_data)));

        // const { row_data } = params;

        // for (const key of Object.keys(JSON.parse(row_data))) {
        //   const indexName = results.rows
        //     .map(res => res.column_name)
        //     .indexOf(key);

        //   if (indexName === -1) {
        //     const data = JSON.parse(row_data);

        //     let columnProperty = {};
        //     if (typeof data[key] === "string") {
        //       columnProperty = {
        //         column_name: data[key],
        //         type: "text"
        //       };
        //     } else if (typeof data[key] === "number") {
        //       if (Number.isSafeInteger(jsonEditRow[key])) {
        //         columnProperty = {
        //           column_name: data[key],
        //           type: "int"
        //         };
        //       } else {
        //         columnProperty = {
        //           column_name: data[key],
        //           type: "float"
        //         };
        //       }
        //     }

        //     // await context.cassandra.execute(
        //     //   `ALTER TABLE ${params.keyspace_name}.${params.table_name} ADD ${columnProperty.column_name} ${columnProperty.type}`,
        //     //   [],
        //     //   {
        //     //     keyspace: params.keyspace_name
        //     //   }
        //     // );
        //   }
        // }

        await context.cassandra.execute(
          `INSERT INTO ${params.keyspace_name}.${params.table_name} JSON '${params.row_data}'`
        );

        return "ok";
      } catch (err) {
        return err;
      }
    },

    updateRow: async (self, params, context) => {
      try {
        // console.log(params.row_data);

        const results = await context.cassandra.execute(
          `SELECT column_name, type, kind FROM system_schema.columns WHERE keyspace_name = '${params.keyspace_name}' AND table_name='${params.table_name}'`
        );

        let row_data = JSON.parse(params.row_data);

        for (const row of row_data) {
          const indexName = results.rows
            .map(res => res.column_name)
            .indexOf(row.column_name);

          if (indexName === -1) {
            // await context.cassandra.execute(
            //   `ALTER TABLE ${params.keyspace_name}.${params.table_name} ADD ${row.column_name} ${row.type}`
            // );
            console.log(indexName);
            throw new Error(`Unknown column ${row.column_name}`);
          }
        }

        let whereClause = {};
        let assignments = "";
        for (const r of row_data) {
          //check if r contain partition key and set as where clause
          if (r.kind === "partition_key") {
            whereClause = r;
          } else {
            let val;

            if (r.type === "int") {
              val = isNaN(parseInt(r.value)) ? null : parseInt(r.value);
            } else if (r.type === "float") {
              val = isNaN(parseFloat(r.value)) ? null : parseFloat(r.value);
            } else if (r.type === "double") {
              val = isNaN(parseInt(r.value)) ? null : parseInt(r.value);
            } else if (r.type === "boolean") {
              val = r.value;
            } else {
              val = `'${r.value}'`;
            }

            assignments += `${r.column_name}` + "=" + `${val},`;
          }
        }

        assignments = assignments.substring(0, assignments.length - 1);

        await context.cassandra.execute(`
          UPDATE ${params.keyspace_name}.${params.table_name} SET ${assignments} WHERE ${whereClause.column_name}='${whereClause.value}'
        `);

        return "ok";
      } catch (err) {
        return err;
      }
    },

    deleteRow: async (self, params, context) => {
      try {
        // console.log(params.row_data);

        let row_data = JSON.parse(params.row_data);
        let whereClause = {};

        for (const r of row_data) {
          //check if r contain partition key and set as where clause
          if (r.kind === "partition_key") {
            whereClause = r;
          }
        }

        await context.cassandra.execute(`
          DELETE ${params.keyspace_name}.${params.table_name} FROM ${params.table_name} WHERE ${whereClause.column_name}='${whereClause.value}'
        `);

        return "ok";
      } catch (err) {
        return err;
      }
    },

    truncateTable: async (self, params, context) => {
      try {
        // console.log(params.row_data);

        await context.cassandra.execute(`USE ${params.keyspace_name}`);
        await context.cassandra.execute(`
          TRUNCATE ${params.table_name}
        `);

        return "ok";
      } catch (err) {
        return err;
      }
    }
  }
};

exports.resolvers = resolvers;
