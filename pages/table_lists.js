import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import Link from "next/link";
import Head from "next/head";
import Router, { withRouter } from "next/router";
import appConfig from "../app.json";
import { FormModal } from "../components/Modal";
import { handleError } from "../libs/errors";
import gql from "graphql-tag";
import orderBy from "lodash/orderBy";
import { addNotification } from "../components/App";
import uuidV4 from "uuid/v4";

import Dropzone from "react-dropzone";
import localforage from "localforage";

const DATA_TYPES = [
  "text",
  "int",
  "varchar",
  "boolean",
  "varint",
  "uuid",
  "tinyint",
  "timeuuid",
  "timestamp",
  "time",
  "smallint",
  "float",
  "inet",
  "duration",
  "double",
  "decimal",
  "counter",
  "boolean",
  "blob",
  "bigint",
  "ascii"
];

const FormTableModal = ({
  handleInput,
  tableObject,
  handleInputColumn,
  addColumn,
  alterColumn,
  handleAlterDropColumn
}) => (
  <div>
    <div className="form-group">
      <label>
        <b>Table Name *</b>
      </label>
      <input
        className="form-control"
        value={tableObject.name}
        onChange={handleInput}
        disabled={tableObject.editStatus === true}
      />
    </div>

    {tableObject.editStatus === true ? (
      <div>
        {tableObject.columns.map(column => (
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">Column Name</label>
                <input
                  className="form-control form-control-sm"
                  value={column.column_name}
                  onChange={handleInputColumn(column, "column_name")}
                  disabled
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">Type</label>
                <select
                  className="form-control form-control-sm"
                  onChange={handleInputColumn(column, "type")}
                  value={column.type}
                  disabled
                >
                  {DATA_TYPES.map(type => (
                    <option value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">
                  Kind
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <font color="red">
                    <a onClick={handleAlterDropColumn(column)}>
                      <i className="fa fa-times-circle" />
                    </a>
                  </font>
                </label>
                <select
                  className="form-control form-control-sm"
                  onChange={handleInputColumn(column, "kind")}
                  value={column.kind}
                  disabled
                >
                  <option value="partition_key">Partition Key</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <hr style={{ margin: 0 }} />
        <br />

        {alterColumn.map(column => (
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">Column Name</label>
                <input
                  className="form-control form-control-sm"
                  value={column.column_name}
                  onChange={handleInputColumn(column, "column_name")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">Type</label>
                <select
                  className="form-control form-control-sm"
                  onChange={handleInputColumn(column, "type")}
                  value={column.type}
                >
                  {DATA_TYPES.map(type => (
                    <option value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">Kind</label>
                <select
                  className="form-control form-control-sm"
                  onChange={handleInputColumn(column, "kind")}
                  value={column.kind}
                >
                  <option value="partition_key">Partition Key</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn-success" onClick={addColumn}>
          <i className="fa fa-plus-circle" /> New Column
        </button>
      </div>
    ) : (
      <div>
        {tableObject.columns.map(column => (
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">Column Name</label>
                <input
                  className="form-control form-control-sm"
                  value={column.column_name}
                  onChange={handleInputColumn(column, "column_name")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">Type</label>
                <select
                  className="form-control form-control-sm"
                  onChange={handleInputColumn(column, "type")}
                  value={column.type}
                >
                  {DATA_TYPES.map(type => (
                    <option value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="small">Kind</label>
                <select
                  className="form-control form-control-sm"
                  onChange={handleInputColumn(column, "kind")}
                  value={column.kind}
                >
                  <option value="partition_key">Partition Key</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <br />
        <button className="btn btn-success" onClick={addColumn}>
          <i className="fa fa-plus-circle" /> New Column
        </button>
      </div>
    )}
  </div>
);

class TableLists extends Component {
  state = {
    allTables: [],
    tableObject: {
      name: "",
      columns: []
    },
    newTableVisible: false,
    alterTableVisible: false,
    alterColumn: [],
    exportLink: "",
    importTableVisible: false,
    destinatonTable: ""
  };

  openNewTable = () => {
    this.setState({
      newTableVisible: true,
      tableObject: {
        name: "",
        columns: []
      }
    });
  };

  closeNewTable = () => {
    this.setState({
      newTableVisible: false
    });
  };

  addColumn = e => {
    e.preventDefault();
    if (this.state.tableObject.columns.find(c => !c.column_name)) {
      return handleError({
        message: `There is one or more column with no name. Please check your input!`
      });
    }

    if (
      !this.state.tableObject.editStatus ||
      this.state.tableObject.editStatus === false
    ) {
      const newColumn = {
        _id: uuidV4(),
        kind: "regular",
        type: "text",
        column_name: ""
      };
      this.setState({
        tableObject: {
          ...this.state.tableObject,
          columns: [...this.state.tableObject.columns, newColumn]
        }
      });
    } else {
      const newColumn = {
        _id: uuidV4(),
        kind: "regular",
        type: "text",
        column_name: ""
      };
      this.setState({
        alterColumn: [...this.state.alterColumn, newColumn]
      });
    }
  };

  handleInput = e => {
    this.setState({
      tableObject: {
        ...this.state.tableObject,
        name: e.target.value
      }
    });
  };

  handleInputColumn = (column, key) => e => {
    this.setState({
      tableObject: {
        ...this.state.tableObject,
        columns: this.state.tableObject.columns.map(col =>
          col._id !== column._id
            ? col
            : {
                ...column,
                // grades: this.state.grades,
                [key]: e.target.value
              }
        )
      }
    });
  };

  openAlterTable = selectedTable => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let sortedColumns = selectedTable.Columns;

    // for(const col of selec)
    sortedColumns.forEach((item, i) => {
      if (item.kind === "partition_key") {
        selectedTable.Columns.splice(i, 1);
        selectedTable.Columns.unshift(item);
      }
    });

    this.setState({
      tableObject: {
        name: selectedTable.table_name,
        columns: sortedColumns.map(col => {
          return {
            _id: uuidV4(),
            ...col
          };
        }),
        editStatus: true
      },
      alterTableVisible: true,
      alterColumn: []
    });
  };

  closeAlterTable = () => {
    this.setState({
      alterTableVisible: false
    });
  };

  handleAlterInput = e => {
    this.setState({
      tableObject: {
        ...this.state.tableObject,
        name: e.target.value
      }
    });
  };

  handleAlterInputColumn = (column, key) => e => {
    this.setState({
      alterColumn: this.state.alterColumn.map(col =>
        col._id !== column._id
          ? col
          : {
              ...column,
              // grades: this.state.grades,
              [key]: e.target.value
            }
      )
    });
  };

  handleSelectTable = selectedTable => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    Router.push({
      pathname: "/table_rows",
      query: {
        keyspace_name: this.props.router.query.keyspace_name,
        table_name: selectedTable.table_name
      }
    });
  };

  handleSubmitNewTable = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // console.log(this.props.router.query);

      let { tableObject } = this.state;

      const containPartitionKeys = tableObject.columns.filter(
        col => col.kind === "partition_key"
      );

      if (containPartitionKeys.length > 1) {
        throw {
          message: "Error, partition key more than 1"
        };
      }
      await this.props.createTable({
        variables: {
          keyspace_name: this.props.router.query.keyspace_name,
          table_name: tableObject.name,
          column: tableObject.columns.map(column => {
            const { _id, ...d } = column;
            return d;
          })
        }
      });

      addNotification({
        message: "Create table success",
        level: "success"
      });

      await this.props.refetch();
      this.closeNewTable();
    } catch (err) {
      handleError(err);
    }
  };

  handleAlterAddColumn = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const selectedTable = this.props.allTables.find(
        t => t.table_name === this.state.tableObject.name
      );

      for (const c of this.state.alterColumn) {
        if (c.column_name === "") {
          throw {
            message: "Error, Column does not have a name"
          };
        }
      }

      if (this.state.alterColumn.length > 0) {
        await this.props.alterAddColumn({
          variables: {
            keyspace_name: this.props.router.query.keyspace_name,
            table_name: this.state.tableObject.name,
            column: this.state.alterColumn.map(col => {
              const { _id, ...d } = col;
              return d;
            })
          }
        });

        addNotification({
          message: "Alter add column success",
          level: "success"
        });
        await this.props.refetch();
      }

      this.setState({
        alterColumn: []
      });
      this.closeAlterTable();
    } catch (err) {
      handleError(err);
    }
  };

  handleAlterDropColumn = selectColumn => async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      let res = [];

      if (confirm(`Are you sure to drop ${selectColumn.column_name} ?`)) {
        const res = this.state.tableObject.columns.filter(
          c => c.column_name !== selectColumn.column_name
        );
        await this.props.alterDropColumn({
          variables: {
            keyspace_name: this.props.router.query.keyspace_name,
            table_name: this.state.tableObject.name,
            column_name: selectColumn.column_name
          }
        });

        addNotification({
          message: "Drop column success",
          level: "success"
        });

        await this.props.refetch();
        this.setState({
          tableObject: {
            ...this.state.tableObject,
            columns: res
          }
        });
      }
    } catch (err) {
      handleError(err);
    }
  };

  handleDropTable = selectedTable => async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      if (confirm(`Are you sure drop ${selectedTable.table_name} table ?`)) {
        await localforage.removeItem(
          `${this.props.router.query.keyspace_name}.${selectedTable.table_name}`
        );
        await this.props.dropTable({
          variables: {
            keyspace_name: this.props.router.query.keyspace_name,
            table_name: selectedTable.table_name
          }
        });

        addNotification({
          message: "Drop table success",
          level: "success"
        });

        await this.props.refetch();
      }
    } catch (err) {
      handleError(err);
    }
  };

  exportTable = selectedTable => async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const res = await this.props.exportTable({
        variables: {
          keyspace_name: this.props.router.query.keyspace_name,
          table_name: selectedTable.table_name
        }
      });

      window.location.href = res.data.exportTable;
    } catch (err) {
      handleError(err);
    }
  };

  openImportModal = table => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState({
      importTableVisible: true,
      destinatonTable: table
    });
  };

  closeImportTable = () => {
    this.setState({
      importTableVisible: false
    });
  };

  onDrop = files => {
    let file = files[0].name.split(".").pop();

    if (file !== "zst") {
      throw {
        message: "File is not zstd/zst (zee standard) extension"
      };
    }
    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = async () => {
      // showLoadingSpinner();
      try {
        // console.log(reader)
        let res = await this.props.importTable({
          variables: {
            keyspace_name: this.props.router.query.keyspace_name,
            table_name: this.state.destinatonTable.table_name,
            importedFile: reader.result
          }
        });

        await this.props.refetch();

        setTimeout(() => {
          window.location.reload();
        }, 1000);
        addNotification({
          message: "Import database success",
          level: "success"
        });
      } catch (err) {
        handleError(err);
      }
      this.closeImportTable();
      // hideLoadingSpinner();
    };
    reader.onerror = error => {
      handleError(error);
    };
  };

  render() {
    return (
      <AdminArea>
        <Head>
          <title>Dashboard | {appConfig.appName}</title>
        </Head>

        <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> New Table
            </span>
          }
          visible={this.state.newTableVisible}
          onClose={this.closeNewTable}
          onSubmit={this.handleSubmitNewTable}
          // size="lg"
        >
          <FormTableModal
            tableObject={this.state.tableObject}
            handleInput={this.handleInput}
            handleInputColumn={this.handleInputColumn}
            addColumn={this.addColumn}
            alterColumn={this.state.alterColumn}
            handleAlterDropColumn={this.handleAlterDropColumn}
          />
        </FormModal>

        <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> Alter Table
            </span>
          }
          visible={this.state.alterTableVisible}
          onClose={this.closeAlterTable}
          onSubmit={this.handleAlterAddColumn}
        >
          <FormTableModal
            tableObject={this.state.tableObject}
            handleInput={this.handleAlterInput}
            handleInputColumn={this.handleAlterInputColumn}
            addColumn={this.addColumn}
            alterColumn={this.state.alterColumn}
            handleAlterDropColumn={this.handleAlterDropColumn}
          />
        </FormModal>

        <FormModal
          title={
            <span>
              <i className="fa fa-database" /> Import Database
            </span>
          }
          visible={this.state.importTableVisible}
          onClose={this.closeImportTable}
        >
          <Dropzone
            onDrop={this.onDrop}
            // accept="application/zstd"
            style={{
              position: "relative",
              border: "2px solid red",
              padding: "30px 20px"
            }}
            multiple={false}
          >
            <div className="text-center">
              <h2>
                <i className="fa fa-file" />
              </h2>
              Drop The File Here / Click For Upload
            </div>
          </Dropzone>
        </FormModal>

        <div>
          <div className="row">
            <div className="col-md-6">
              <div className="text-left float-left">
                <Link href="/keyspaces">
                  <a>
                    <i className="fa fa-arrow-left" /> All Keyspaces
                  </a>
                </Link>
              </div>
            </div>
          </div>
          <br />

          <h4 className="float-left mt-2">
            <i className="fa fa-database" />
            &nbsp; Tables under <i>
              `{this.props.router.query.keyspace_name}`
            </i>{" "}
            keyspace
          </h4>
          {this.props.router.query.keyspace_name.includes("system") ? null : (
            <div className="float-right hoverable on-hover-shadow">
              <button
                className="btn btn-success btn-sm btn-block px-4 py-2"
                onClick={this.openNewTable}
              >
                <i className="fa fa-plus-circle" /> Add New Table
              </button>
            </div>
          )}
          <div className="clearfix" />
          <hr className="mt-2 mb-4" />

          <div className="row">
            {this.props.loading ? (
              <div className="col-md-12 text-center my-4">
                <div className="text-secondary">
                  <i className="fa fa-spinner fa-3x fa-spin m-3" />
                  <br />
                  Loading, please wait ...
                </div>
              </div>
            ) : this.props.allTables.length === 0 ? (
              <div className="col-md-12 text-center my-4">
                <div className="text-secondary">
                  <i className="fa fa-exclamation-circle fa-5x mb-3" />
                  <br />
                  No table at the moment!
                </div>
                <button
                  type="button"
                  className="btn btn-success mt-4"
                  style={{ minWidth: 240 }}
                  onClick={this.openNewKeyspace}
                >
                  <i className="fa fa-plus-circle" /> Add New Table Now
                </button>
              </div>
            ) : null}
            {this.props.allTables.map(table => (
              <div className="col-md-12 pl-6" key={table.table_name}>
                <div
                  className="card hoverable on-hover-shadow mb-3"
                  onClick={this.handleSelectTable(table)}
                >
                  {this.props.router.query.keyspace_name.includes("system") ? (
                    <div
                      className={"card-status bg-primary card-status-left"}
                    />
                  ) : (
                    <div
                      className={"card-status bg-success card-status-left"}
                    />
                  )}
                  <div className="card-body py-4">
                    <div className="float-left">
                      <h5 className="mb-0">
                        <i className="fa fa-list" />
                        &nbsp; {table.table_name}
                      </h5>
                      <Query
                        query={COUNT}
                        variables={{
                          keyspace_name: this.props.router.query.keyspace_name,
                          table_name: table.table_name
                        }}
                      >
                        {({ error, loading, data }) =>
                          loading ? (
                            <div className="text-secondary ml-5">
                              <i className="fa fa-spinner fa-spin" /> Counting
                              rows...
                            </div>
                          ) : error ? (
                            <div className="text-danger ml-5">
                              <i className="fa fa-exclamation-triangle" /> Could
                              not get row count at the moment ({error.message}).
                            </div>
                          ) : (
                            <div className="text-secondary ml-5 mt-1">
                              This table has{" "}
                              <b>{data.countRowsByTableAndKeyspace} row(s).</b>
                            </div>
                          )
                        }
                      </Query>
                      {table.Columns.length === 0 ? (
                        <div className="text-secondary ml-5">
                          Have no column(s).
                        </div>
                      ) : (
                        <div className="text-secondary ml-5">
                          There are column `{table.Columns[0].column_name}` and{" "}
                          {table.Columns.length - 1} others.
                        </div>
                      )}
                    </div>
                    <div className="float-right on-hover-shown">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={this.handleSelectTable(table)}
                      >
                        <i className="fa fa-search" /> VIEW
                      </button>

                      {this.props.router.query.keyspace_name.includes(
                        "system"
                      ) ? null : (
                        <span>
                          <button
                            type="button"
                            className="btn btn-link btn-sm"
                            onClick={this.exportTable(table)}
                          >
                            <i className="fa fa-file-export" /> EXPORT
                          </button>
                          <button
                            type="button"
                            className="btn btn-link btn-sm"
                            onClick={this.openImportModal(table)}
                          >
                            <i className="fa fa-file-import" /> IMPORT
                          </button>
                          &nbsp;&nbsp;
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={this.openAlterTable(table)}
                          >
                            ALTER
                          </button>
                          &nbsp;&nbsp;
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={this.handleDropTable(table)}
                          >
                            DROP
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="clearfix" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminArea>
    );
  }
}

const QUERY = gql`
  query allTablesByKeyspace($keyspace_name: String!) {
    allTablesByKeyspace(keyspace_name: $keyspace_name) {
      table_name
      Columns {
        column_name
        type
        kind
      }
    }
  }
`;

const COUNT = gql`
  query countRowsByTableAndKeyspace(
    $keyspace_name: String!
    $table_name: String!
  ) {
    countRowsByTableAndKeyspace(
      keyspace_name: $keyspace_name
      table_name: $table_name
    )
  }
`;

const CREATE_TABLE = gql`
  mutation createTable(
    $keyspace_name: String!
    $table_name: String!
    $column: [ColumnPayload]
  ) {
    createTable(
      keyspace_name: $keyspace_name
      table_name: $table_name
      column: $column
    )
  }
`;

const ALTER_ADD_COLUMN = gql`
  mutation alterAddColumn(
    $keyspace_name: String!
    $table_name: String!
    $column: [ColumnPayload]
  ) {
    alterAddColumn(
      keyspace_name: $keyspace_name
      table_name: $table_name
      column: $column
    )
  }
`;

const ALTER_DROP_COLUMN = gql`
  mutation alterDropColumn(
    $keyspace_name: String!
    $table_name: String!
    $column_name: String!
  ) {
    alterDropColumn(
      keyspace_name: $keyspace_name
      table_name: $table_name
      column_name: $column_name
    )
  }
`;
const DROP_TABLE = gql`
  mutation dropTable($keyspace_name: String!, $table_name: String!) {
    dropTable(keyspace_name: $keyspace_name, table_name: $table_name)
  }
`;
const EXPORT_TABLE = gql`
  mutation exportTable($keyspace_name: String!, $table_name: String!) {
    exportTable(keyspace_name: $keyspace_name, table_name: $table_name)
  }
`;
const IMPORT_TABLE = gql`
  mutation importTable(
    $keyspace_name: String!
    $table_name: String!
    $importedFile: String!
  ) {
    importTable(
      keyspace_name: $keyspace_name
      table_name: $table_name
      importedFile: $importedFile
    )
  }
`;

export default withRouter(props => (
  <ApolloConsumer>
    {client => (
      <Mutation mutation={IMPORT_TABLE}>
        {importTable => (
          <Mutation mutation={EXPORT_TABLE}>
            {exportTable => (
              <Mutation mutation={ALTER_DROP_COLUMN}>
                {alterDropColumn => (
                  <Mutation mutation={ALTER_ADD_COLUMN}>
                    {alterAddColumn => (
                      <Mutation mutation={DROP_TABLE}>
                        {dropTable => (
                          <Mutation mutation={CREATE_TABLE}>
                            {createTable => (
                              <Query
                                query={QUERY}
                                variables={{
                                  keyspace_name:
                                    props.router.query.keyspace_name
                                }}
                              >
                                {({ error, loading, data, refetch }) => (
                                  <TableLists
                                    {...props}
                                    client={client}
                                    loading={loading}
                                    refetch={refetch}
                                    allTables={
                                      data && data.allTablesByKeyspace
                                        ? orderBy(
                                            data.allTablesByKeyspace,
                                            ["table_name"],
                                            ["asc"]
                                          )
                                        : []
                                    }
                                    createTable={createTable}
                                    dropTable={dropTable}
                                    alterAddColumn={alterAddColumn}
                                    alterDropColumn={alterDropColumn}
                                    exportTable={exportTable}
                                    importTable={importTable}
                                  />
                                )}
                              </Query>
                            )}
                          </Mutation>
                        )}
                      </Mutation>
                    )}
                  </Mutation>
                )}
              </Mutation>
            )}
          </Mutation>
        )}
      </Mutation>
    )}
  </ApolloConsumer>
));
