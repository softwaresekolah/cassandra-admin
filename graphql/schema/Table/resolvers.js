const fs = require("fs");
const shelljs = require("shelljs");
const mime = require("mime");
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
        },`;
      }

      stringQuery = stringQuery.split(" ,").join(",");

      stringQuery = stringQuery.substring(0, stringQuery.length - 1);
      // console.log(stringQuery);
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

        if (fs.existsSync("static/exportDB")) {
          shelljs.exec("rm -rf static/exportDB");
        }

        shelljs.exec("mkdir static/exportDB");

        fs.writeFileSync(
          `${params.table_name}.row.json`,
          JSON.stringify(rowData)
        );
        fs.writeFileSync(
          `${params.table_name}.column.json`,
          JSON.stringify(colData)
        );

        shelljs.exec(`mv ${params.table_name}.row.json static/exportDB`);
        shelljs.exec(`mv ${params.table_name}.column.json static/exportDB`);

        shelljs.exec(
          `tar --use-compress-program zstd -cf static/exportDB/table-${params.table_name}.tar.zst static/exportDB`
        );

        // shelljs.exec(`mv *.zst static/exportDB`);
        // shelljs.exec(`rm static/exportDB/*.json`);

        return `/static/exportDB/table-${params.table_name}.tar.zst`;
      } catch (err) {
        return err;
      }
    },

    importTable: async (self, params, context) => {
      try {
        const filename = `tmp-import-table.tar.zst`;
        const buf = Buffer.from(
          params.importedFile.split("base64,")[1],
          "base64"
        );
        const type = params.importedFile.split(";")[0].split("/")[1];

        // if (fs.existsSync("static/importDB")) {
        //   shelljs.exec("rm -rf static/importDB");
        // }

        shelljs.exec("mkdir static/importDB");

        fs.writeFileSync("static/importDB" + "/" + filename, buf);

        const dir = `static/importDB/tmp-import-table.tar`;

        shelljs.exec(`unzstd static/importDB/${filename}`);
        shelljs.exec(
          `tar -xzf static/importDB/tmp-import-table.tar --strip-components 2 -C static/importDB`
        );

        shelljs.exec(`rm static/importDB/*.tar`);
        shelljs.exec(`rm static/importDB/*.zst`);

        const fileNames = fs
          .readdirSync("static/importDB")
          .filter(name => name.endsWith(".json"));
        // console.log("Got", files.length, "json");

        // =========== CREATE COLUMN =========== ======= //
        const columns = fs.readFileSync("static/importDB" + "/" + fileNames[0]);
        let columnsData = JSON.parse(columns);

        let destination = await context.cassandra.execute(
          `SELECT column_name, type, kind FROM system_schema.columns WHERE keyspace_name = '${params.keyspace_name}' AND table_name='${params.table_name}'`
        );

        let counter = 0;

        for (const c of columnsData) {
          const indexName = destination.rows
            .map(des => des.column_name)
            .indexOf(c.column_name);

          if (indexName === -1) {
            await context.cassandra.execute(
              `ALTER TABLE ${params.keyspace_name}.${params.table_name} ADD ${c.column_name} ${c.type}`
            );
          }
          if (indexName > -1) {
            if (c.type !== destination.rows[indexName].type) {
              throw new Error(
                `Column (${c.column_name}) type supposed to be ${c.type} not ${destination.rows[indexName].type}`
              );
            }

            if (c.kind !== destination.rows[indexName].kind) {
              throw new Error(
                `Column (${c.column_name}) kind supposed to be ${c.kind} not ${destination.rows[indexName].kind}`
              );
            }
          }
        }

        // =========================================== //

        //================== INSERT DATA  ===============//

        const rows = fs.readFileSync("static/importDB" + "/" + fileNames[1]);
        const rowsData = JSON.parse(rows);

        for (const data of rowsData) {
          let d = JSON.stringify(data);
          await context.cassandra.execute(
            `INSERT INTO ${params.keyspace_name}.${params.table_name} JSON '${d}'`
          );
        }

        shelljs.exec("rm -rf static/importDB");
      } catch (err) {
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

const base64MimeType = encoded => {
  var result = null;

  if (typeof encoded !== "string") {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
};
