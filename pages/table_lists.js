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
  addColumn
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
      />
    </div>
    <hr className="my-2" />
    <label>
      <b>Table Columns *</b>
    </label>
    {tableObject.columns.map(column => (
      <div
        className="card card-shadow hoverable on-hover-shadow mb-3"
        key={column._id}
        style={{ borderRadius: 0 }}
      >
        <div className="card-body py-1 px-3">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group m-0">
                <label className="m-0">
                  <small>Column Name</small>
                </label>
                <input
                  required
                  className="form-control"
                  value={column.column_name}
                  onChange={handleInputColumn("column_name", column)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="m-0">
                  <small>Type</small>
                </label>
                <select
                  required
                  className="form-control"
                  onChange={handleInputColumn("type", column)}
                  value={column.type}
                >
                  {DATA_TYPES.map(type => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="m-0">
                  <small>Kind</small>
                </label>
                <select
                  required
                  className="form-control"
                  onChange={handleInputColumn("kind", column)}
                  value={column.kind}
                >
                  <option value="partition_key">Partition Key</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
    <div className="text-right">
      <button
        className="btn btn-primary btn-sm"
        type="button"
        onClick={addColumn}
      >
        <i className="fa fa-plus" /> Add Column
      </button>
    </div>
  </div>
);

class TableLists extends Component {
  state = {
    allTables: [],
    tableObject: {
      name: "",
      columns: []
    },
    newTableVisible: false
  };

  openNewKeyspace = () => {
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

    const newColumn = {
      _id: uuidV4(),
      kind: "regular",
      type: "text",
      column_name: ""
    };
    this.setState({
      tableObject: {
        ...this.setState.tableObject,
        name: this.state.tableObject.name,
        columns: [...this.state.tableObject.columns, newColumn]
      }
    });
  };

  handleInput = e => {
    this.setState({
      tableObject: {
        ...this.state.tableObject,
        name: e.target.value
      }
    });
  };

  handleInputColumn = (key, column) => e => {
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
      // tableObject: {
      //   ...this.state.tableObject,
      //   columns: this.state.tableObject.columns.map(col =>
      //     col._id !== column._id
      //       ? col
      //       : {
      //           ...column,
      //           [key]: e.target.value
      //         }
      //   )
      // }
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

  handleDropTable = selectedTable => async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      if (confirm(`Are you sure drop ${selectedTable.table_name} table ?`)) {
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

  render() {
    return (
      <AdminArea withoutFooter>
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
          />
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
                onClick={this.openNewKeyspace}
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
                          &nbsp;&nbsp;
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
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

const DROP_TABLE = gql`
  mutation dropTable($keyspace_name: String!, $table_name: String!) {
    dropTable(keyspace_name: $keyspace_name, table_name: $table_name)
  }
`;

export default withRouter(props => (
  <ApolloConsumer>
    {client => (
      <Mutation mutation={DROP_TABLE}>
        {dropTable => (
          <Mutation mutation={CREATE_TABLE}>
            {createTable => (
              <Query
                query={QUERY}
                variables={{ keyspace_name: props.router.query.keyspace_name }}
              >
                {({ error, loading, data, refetch }) => (
                  <TableLists
                    {...props}
                    client={client}
                    loading={loading}
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
                    refetch={refetch}
                  />
                )}
              </Query>
            )}
          </Mutation>
        )}
      </Mutation>
    )}
  </ApolloConsumer>
));
