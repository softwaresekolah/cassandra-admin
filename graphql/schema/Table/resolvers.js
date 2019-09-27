const fs = require("fs");
const shelljs = require("shelljs");
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
      let stringQuery = "";
      for (const c of params.column) {
        stringQuery += `${c.column_name} ${c.type} ${
          c.kind === "partition_key" ? "PRIMARY KEY" : ""
        }, `;
      }

      stringQuery = stringQuery.split(" ,").join("");
      try {
        await context.cassandra.execute(
          `CREATE TABLE IF NOT EXISTS ${params.keyspace_name}.${params.table_name}(${stringQuery})`
          // [],
          // { keyspace: params.keyspace_name }
        );
      } catch (err) {
        return err;
      }
      return "ok";
    },

    alterAddColumn: async (self, params, context) => {
      let stringQuery = "";
      for (const c of params.column) {
        stringQuery += `${c.column_name} ${c.type} ${
          c.kind === "partition_key" ? "PRIMARY KEY" : ""
        },`;
      }

      stringQuery = stringQuery.split(" ,").join(", ");

      let q = stringQuery.substring(0, stringQuery.length - 2);

      try {
        await context.cassandra.execute(
          `ALTER TABLE ${params.keyspace_name}.${params.table_name} ADD (${q})`
        );
      } catch (err) {
        console.log(err);
        return err;
      }

      return "ok";
    },

    alterDropColumn: async (self, params, context) => {
      // console.log(stringQuery)

      try {
        await context.cassandra.execute(
          `ALTER TABLE ${params.keyspace_name}.${params.table_name} DROP ${params.column_name}`
        );
      } catch (err) {
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
      }
      return "ok";
    },

    exportTable: async (self, params, context) => {
      try {
        await context.cassandra.execute(`USE ${params.keyspace_name}`);

        const rowResults = await context.cassandra.execute(
          `SELECT * FROM ${params.table_name}`
        );

        const columnResults = await context.cassandra.execute(
          `SELECT column_name, type, kind FROM system_schema.columns WHERE keyspace_name = '${params.keyspace_name}' AND table_name='${params.table_name}'`
        );

        const rowData = rowResults.rows;
        const colData = columnResults.rows;

        const exportPath = process.cwd() + "/static/exportDB";

        if (!fs.existsSync(exportPath)) {
          fs.mkdirSync(exportPath, {
            recursive: true
          });
        }

        fs.writeFileSync(
          `${params.table_name}.row.json`,
          JSON.stringify(rowData)
        );
        fs.writeFileSync(
          `${params.table_name}.column.json`,
          JSON.stringify(colData)
        );

        shelljs.exec(`mv ${params.table_name}.row.json ${exportPath}`);
        shelljs.exec(`mv ${params.table_name}.column.json ${exportPath}`);

        shelljs.exec(
          `tar --use-compress-program zstd -cf table-${params.table_name}.tar.zst ${exportPath}`
        );

        shelljs.exec(`mv *.zst ${exportPath}`);
        shelljs.exec(`rm ${exportPath}/*.json`);

        return `/static/exportDB/table-${params.table_name}.tar.zst`;
      } catch (err) {
        return err;
      }
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
