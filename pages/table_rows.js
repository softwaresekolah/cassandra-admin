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
import DataTable from "../components/DataTable";
import localforage from "localforage";

let projectionFromLocalForage = [];

import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import uuidV4 from "uuid/v4";

const ProjectionColumnsModal = ({
  columns,
  handleToggleColumn,
  toggledColumns
}) =>
  columns.map(col => (
    <div>
      <section
        className="card hoverable on-hover-shadow my-1"
        onClick={handleToggleColumn(col)}
        style={{
          color:
            toggledColumns.findIndex(c => c.column_name === col.column_name) >
            -1
              ? "#000"
              : "#ccc"
        }}
        key={col.column_name}
      >
        <div className="card-block py-2 px-4">
          <b>
            {" "}
            {toggledColumns.findIndex(c => c.column_name === col.column_name) >
            -1 ? null : (
              <i className="fa fa-eye-slash" />
            )}{" "}
            <div className="row">
              <div className="col-md-4">{col.column_name}</div>
              <div className="col-md-4">({col.type})</div>
              <div className="col-md-4">
                {col.kind === "partition_key" ? `("PRIMARY KEY")` : null}
              </div>
            </div>
          </b>
        </div>
      </section>
    </div>
  ));

const RowDataModal = ({ columns, handleInput, data }) =>
  columns.map(col => (
    <div className="form-group" key={col.column_name}>
      <div className="row">
        <div className="col-md-4">{col.column_name}</div>
        <div className="col-md-4">{col.type}</div>
        <div className="col-md-4">
          {col.kind === "partition_key" ? `("PRIMARY KEY")` : null}
        </div>
      </div>
      <input
        className="form-control"
        onChange={handleInput(col.column_name)}
        value={data[col.column_name]}
      />
    </div>
  ));

class TableRows extends Component {
  state = {
    columns: [],
    projectionColumn: [],
    toggledColumns: [],
    newRow: {},
    editRow: {},

    jsonNewRow: {},
    jsonEditRow: {},

    showProjectionVisible: false,
    newRowDataVisible: false,
    editRowDataVisible: false,

    jsonEditRowVisible: false,
    jsonNewRowVisible: false
  };

  static getDerivedStateFromProps = (props, state) => {
    if (props.allRows && props.allRows.length > 0) {
      const columns = Object.keys(props.allRows[0]).map(column => ({
        Header: column,
        accessor: column,
        style: { textAlign: "center", fontSize: "90%" },
        Cell: props => JSON.stringify(props.value)
      }));
      return {
        columns
      };
    } else {
      return null;
    }
  };

  sortColumnsByPartitionKey = columns => {
    let sortedColumns = columns;
    sortedColumns.forEach((item, i) => {
      if (item.kind === "partition_key") {
        columns.splice(i, 1);
        columns.unshift(item);
      }
    });

    return sortedColumns;
  };

  componentDidMount = async () => {
    projectionFromLocalForage = await localforage.getItem(
      `${this.props.router.query.keyspace_name}.${this.props.router.query.table_name}`
    );

    Router.replace({
      pathname: "/table_rows",
      query: {
        ...this.props.router.query,
        projectionFromLocalForage: projectionFromLocalForage
          ? projectionFromLocalForage.map(c => c.column_name)
          : []
      }
    });
  };

  openProjectionModal = columns => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.setState({
      showProjectionVisible: true,
      projectionColumn: columns,
      toggledColumns: projectionFromLocalForage
        ? projectionFromLocalForage
        : columns
    });
  };

  closeProjection = async e => {
    this.setState({
      showProjectionVisible: false,
      toggledColumns: []
    });
  };

  handleToggleColumn = column => e => {
    let toggledColumns = this.state.toggledColumns;
    const colIndex = toggledColumns.findIndex(
      col => col.column_name === column.column_name
    );

    if (colIndex > -1) {
      this.setState({
        toggledColumns: this.state.toggledColumns.filter(
          c => c.column_name !== column.column_name
        )
      });
    } else {
      const indexFromAllColumns = this.props.allColumns.findIndex(
        col => col.column_name === column.column_name
      );

      toggledColumns.splice(indexFromAllColumns, 0, column);

      this.setState({
        toggledColumns
      });
    }
  };

  applyProjection = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    localforage.setItem(
      `${this.props.router.query.keyspace_name}.${this.props.router.query.table_name}`,
      this.state.toggledColumns
    );

    addNotification({
      message: "Column projection applied",
      level: "success"
    });

    this.closeProjection();

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  openNewRow = () => {
    let initData = {};
    for (const col of this.props.allColumns) {
      initData[col.column_name] = "";
    }

    this.setState({
      newRowDataVisible: true,
      newRow: {
        ...initData
      }
    });
  };

  closeNewRow = () => {
    this.setState({
      newRowDataVisible: false
    });
  };

  handleInputNewRow = key => e => {
    this.setState({
      newRow: {
        ...this.state.newRow,
        [key]: e.target.value
      }
    });
  };

  handleSubmitNewRow = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      await this.props.createRow({
        variables: {
          keyspace_name: this.props.router.query.keyspace_name,
          table_name: this.props.router.query.table_name,
          row_data: JSON.stringify(this.state.newRow)
        }
      });

      addNotification({
        message: "New row added success",
        level: "success"
      });
      await this.props.refetch();
      this.closeNewRow();
    } catch (err) {
      handleError(err);
    }
  };

  openEditRow = selectedRow => {
    this.setState({
      editRowDataVisible: true,
      editRow: {
        ...selectedRow.row
      }
    });
  };

  closeEditRow = () => {
    this.setState({
      editRowDataVisible: false
    });
  };

  handleInputEditRow = key => e => {
    this.setState({
      editRow: {
        ...this.state.editRow,
        [key]: e.target.value
      }
    });
  };

  handleSubmitUpdateRow = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      let rowData = [];
      for (const c of this.props.allColumns) {
        rowData.push({
          column_name: c.column_name,
          kind: c.kind,
          value: this.state.editRow[c.column_name],
          type: c.type
        });
      }

      await this.props.updateRow({
        variables: {
          keyspace_name: this.props.router.query.keyspace_name,
          table_name: this.props.router.query.table_name,
          row_data: JSON.stringify(rowData)
        }
      });

      addNotification({
        message: "Update row success",
        level: "success"
      });
      await this.props.refetch();

      this.closeEditRow();
    } catch (err) {
      handleError(err);
    }
  };

  openNewJSONRow = () => {
    let initData = {};
    for (const col of this.props.allColumns) {
      if (col.type === "int" || col.type === "float") {
        initData[col.column_name] = 0;
      } else {
        if (col.kind === "partition_key") {
          initData[col.column_name] = uuidV4();
        } else {
          initData[col.column_name] = "";
        }
      }
    }
    this.setState({
      jsonNewRowVisible: true,
      jsonNewRow: {
        ...initData
      }
    });
  };

  handleNewJSONRow = obj => {
    this.setState({
      jsonNewRow: {
        ...obj.jsObject
      }
    });
  };

  closeNewJSONRow = () => {
    this.setState({
      jsonNewRowVisible: false
    });
  };

  submitNewJSONRow = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const { jsonNewRow } = this.state;

    try {
      await this.props.createRow({
        variables: {
          keyspace_name: this.props.router.query.keyspace_name,
          table_name: this.props.router.query.table_name,
          row_data: JSON.stringify(this.state.jsonNewRow)
        }
      });

      addNotification({
        message: "New row added success",
        level: "success"
      });
      await this.props.refetch();
      this.closeNewJSONRow();
    } catch (err) {
      handleError(err);
    }
  };

  openEditJSONRow = selectedRow => {
    // console.log(selectedRow)
    this.setState({
      jsonEditRow: {
        ...selectedRow.row
      },
      jsonEditRowVisible: true
    });
  };

  handleEditJSONRow = obj => {
    this.setState({
      jsonEditRow: {
        ...obj.jsObject
      }
    });
  };

  closeEditJSONRow = e => {
    this.setState({
      jsonEditRowVisible: false
    });
  };

  submitEditJSONRow = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const { jsonEditRow } = this.state;

      let rowData = [];
      for (const key of Object.keys(jsonEditRow)) {
        const col = this.props.allColumns.filter(c => c.column_name === key);

        if (col.length !== 0) {
          const getColumn = this.props.allColumns.find(
            c => c.column_name === key
          );
          rowData.push({
            column_name: key,
            kind: getColumn ? getColumn.kind : null,
            value: jsonEditRow[key],
            type: getColumn ? getColumn.type : null
          });
        } else {
          let type;
          const kind = "regular";

          if (typeof jsonEditRow[key] === "number") {
            if (Number.isSafeInteger(jsonEditRow[key])) {
              type = "int";
            } else {
              type = "float";
            }
          } else {
            type = "text";
          }

          rowData.push({
            column_name: key,
            kind: kind,
            value: jsonEditRow[key],
            type: type
          });
        }
      }

      await this.props.updateRow({
        variables: {
          keyspace_name: this.props.router.query.keyspace_name,
          table_name: this.props.router.query.table_name,
          row_data: JSON.stringify(rowData)
        }
      });

      addNotification({
        message: "Update row success",
        level: "success"
      });
      await this.props.refetch();
      this.closeEditJSONRow();
    } catch (err) {
      handleError(err);
    }
  };

  submitDelete = ({ rows, keys }) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
    } catch (err) {
      handleError(err);
    }
  };

  submitTruncate = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (
      confirm(
        `Are you sure to Truncate this ${this.props.router.query.table_name} table ? `
      )
    ) {
      try {
        await this.props.truncateTable({
          variables: {
            keyspace_name: this.props.router.query.keyspace_name,
            table_name: this.props.router.query.table_name
          }
        });

        addNotification({
          message: "Truncate table success",
          level: "success"
        });

        await this.props.refetch();
      } catch (err) {
        handleError(err);
      }
    }
  };

  render() {
    const sortedColumns = this.sortColumnsByPartitionKey(this.props.allColumns);
    return (
      <AdminArea fluid>
        <Head>
          <title>Dashboard | {appConfig.appName}</title>
        </Head>

        <FormModal
          title={
            <span>
              <i className="fa fa-table" /> Column Projection
            </span>
          }
          visible={this.state.showProjectionVisible}
          onClose={this.closeProjection}
          onSubmit={this.applyProjection}

          // size="lg"
        >
          <ProjectionColumnsModal
            columns={this.state.projectionColumn}
            handleToggleColumn={this.handleToggleColumn}
            toggledColumns={this.state.toggledColumns}
          />
        </FormModal>

        {/* <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> Create Row
            </span>
          }
          visible={this.state.newRowDataVisible}
          onClose={this.closeNewRow}
          onSubmit={this.handleSubmitNewRow}
          // size="lg"
        >
          <RowDataModal
            columns={sortedColumns}
            handleInput={this.handleInputNewRow}
            data={this.state.newRow}
          />
        </FormModal> */}

        {/* <FormModal
          title={
            <span>
              <i className="fa fa-edit" /> Update Row
            </span>
          }
          visible={this.state.editRowDataVisible}
          onClose={this.closeEditRow}
          onSubmit={this.handleSubmitUpdateRow}
          // size="lg"
        >
          <RowDataModal
            columns={sortedColumns}
            handleInput={this.handleInputEditRow}
            data={this.state.editRow}
          />
        </FormModal> */}
        <FormModal
          title={
            <span>
              <i className="fa fa-plus" /> New Row
            </span>
          }
          visible={this.state.jsonNewRowVisible}
          onClose={this.closeNewJSONRow}
          onSubmit={this.submitNewJSONRow}
          // size="lg"
        >
          <JSONInput
            placeholder={this.state.jsonNewRow} // data to display
            theme="dark_vscode_tribute"
            locale={locale}
            colors={{
              string: "#DAA520" // overrides theme colors with whatever color value you want
            }}
            height="550px"
            onChange={this.handleNewJSONRow}
          />
        </FormModal>
        <FormModal
          title={
            <span>
              <i className="fa fa-edit" /> Update Row
            </span>
          }
          visible={this.state.jsonEditRowVisible}
          onClose={this.closeEditJSONRow}
          onSubmit={this.submitEditJSONRow}
          // size="lg"
        >
          <JSONInput
            placeholder={this.state.jsonEditRow} // data to display
            theme="dark_vscode_tribute"
            locale={locale}
            colors={{
              string: "#DAA520" // overrides theme colors with whatever color value you want
            }}
            height="550px"
            onChange={this.handleEditJSONRow}
          />
        </FormModal>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="text-left float-left">
                <Link
                  href={
                    "/table_lists?keyspace_name=" +
                    this.props.router.query.keyspace_name
                  }
                >
                  <a>
                    <i className="fa fa-arrow-left" /> All tables under `
                    {this.props.router.query.keyspace_name}` keyspace
                  </a>
                </Link>
              </div>
            </div>
          </div>
          <br />

          <h4 className="float-left mt-2">
            <i className="fa fa-database" />
            &nbsp; Rows under{" "}
            <i>
              `{this.props.router.query.keyspace_name}`.`
              {this.props.router.query.table_name}`
            </i>{" "}
            table
          </h4>
          <div className="clearfix" />
          <hr className="mt-2 mb-4" />

          <div className="text-right float-right">
            <button
              className="btn btn-sm btn-danger mr-2"
              onClick={this.submitTruncate}
            >
              <i className="fa fa-trash-alt" /> Truncate
            </button>
            <button
              className="btn btn-sm btn-success"
              onClick={this.openProjectionModal(sortedColumns)}
            >
              <i className="fa fa-filter" /> Projection
            </button>
          </div>

          <div className="row" style={{ marginTop: 50 }}>
            <div className="col-md-12">
              <div className="card hoverable on-hover-shadow">
                <div className="card-status bg-success card-status-left" />
                <div className="card-body">
                  {this.props.error ? (
                    <div className="alert alert-danger">
                      <i className="fa fa-exclamation-circle" />{" "}
                      {this.props.error.message}
                    </div>
                  ) : (
                    <DataTable
                      title={
                        <div>
                          <i className="fa fa-info-circle" />{" "}
                          {this.props.loading ? "Loading rows..." : "All rows"}
                        </div>
                      }
                      withoutCard
                      columns={this.state.columns}
                      loading={this.props.loading}
                      data={this.props.allRows}
                      // onAddData={this.openNewRow}
                      // onEditData={this.openEditRow}

                      onAddData={this.openNewJSONRow}
                      onEditData={this.openEditJSONRow}
                      onDeleteData={this.submitDelete}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminArea>
    );
  }
}

const QUERY = gql`
  query listOfQueries(
    $keyspace_name: String!
    $table_name: String!
    $column_projections: [String]
  ) {
    allRowsByTableAndKeyspace(
      keyspace_name: $keyspace_name
      table_name: $table_name
      column_projections: $column_projections
    )
    allColumnsByTableAndKeyspace(
      keyspace_name: $keyspace_name
      table_name: $table_name
    )
  }
`;

const CREATE_ROW = gql`
  mutation createRow(
    $keyspace_name: String!
    $table_name: String!
    $row_data: String!
  ) {
    createRow(
      keyspace_name: $keyspace_name
      table_name: $table_name
      row_data: $row_data
    )
  }
`;

const UPDATE_ROW = gql`
  mutation updateRow(
    $keyspace_name: String!
    $table_name: String!
    $row_data: String!
  ) {
    updateRow(
      keyspace_name: $keyspace_name
      table_name: $table_name
      row_data: $row_data
    )
  }
`;

const DELETE_ROW = gql`
  mutation deleteRow(
    $keyspace_name: String!
    $table_name: String!
    $row_data: String!
  ) {
    deleteRow(
      keyspace_name: $keyspace_name
      table_name: $table_name
      row_data: $row_data
    )
  }
`;

const TRUNCATE_TABLE = gql`
  mutation truncateTable($keyspace_name: String!, $table_name: String!) {
    truncateTable(keyspace_name: $keyspace_name, table_name: $table_name)
  }
`;

const SELECT_ROW = gql`
  mutation selectRow(
    $keyspace_name: String!
    $table_name: String!
    $row_data: String!
  ) {
    selectRow(
      keyspace_name: $keyspace_name
      table_name: $table_name
      row_data: $row_data
    )
  }
`;

export default withRouter(props => {
  let projections = props.router.query.projectionFromLocalForage
    ? props.router.query.projectionFromLocalForage
    : [];

  return (
    <ApolloConsumer>
      {client => (
        <Mutation mutation={TRUNCATE_TABLE}>
          {truncateTable => (
            <Mutation mutation={DELETE_ROW}>
              {deleteRow => (
                <Mutation mutation={UPDATE_ROW}>
                  {updateRow => (
                    <Mutation mutation={CREATE_ROW}>
                      {createRow => (
                        <Query
                          query={QUERY}
                          variables={{
                            keyspace_name: props.router.query.keyspace_name,
                            table_name: props.router.query.table_name,
                            column_projections: projections
                          }}
                        >
                          {({ error, loading, data, refetch }) => (
                            <div>
                              <TableRows
                                {...props}
                                client={client}
                                loading={loading}
                                error={error}
                                refetch={refetch}
                                allRows={
                                  data && data.allRowsByTableAndKeyspace
                                    ? data.allRowsByTableAndKeyspace.map(row =>
                                        JSON.parse(row)
                                      )
                                    : []
                                }
                                allColumns={
                                  data && data.allColumnsByTableAndKeyspace
                                    ? data.allColumnsByTableAndKeyspace.map(
                                        col => JSON.parse(col)
                                      )
                                    : []
                                }
                                createRow={createRow}
                                deleteRow={deleteRow}
                                updateRow={updateRow}
                                truncateTable={truncateTable}
                              />
                            </div>
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
    </ApolloConsumer>
  );
});
