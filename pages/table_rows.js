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
const ProjectionColumnsModal = ({
  columns,
  handleToggleColumn,
  toggledColumns
}) =>
  columns.map(col => (
    <section
      className="card hoverable on-hover-shadow my-1"
      onClick={handleToggleColumn(col)}
      style={{
        color: toggledColumns.includes(col) ? "#000" : "#ccc"
      }}
      key={col}
    >
      <div className="card-block py-2 px-4">
        <b>
          {" "}
          {toggledColumns.includes(col) ? null : (
            <i className="fa fa-eye-slash" />
          )}{" "}
          {col}
        </b>
      </div>
    </section>
  ));

class TableRows extends Component {
  state = {
    columns: [],
    showProjectionVisible: false,
    projectionColumn: [],

    toggledColumns: []
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

  componentDidMount = async () => {
    projectionFromLocalForage = await localforage.getItem(
      `${this.props.router.query.keyspace_name}.${this.props.router.query.table_name}`
    );

    console.log(projectionFromLocalForage)

    Router.replace({
      pathname: "/table_rows",
      query: {
        ...this.props.router.query,
        projectionFromLocalForage
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
    if (this.state.toggledColumns.includes(column)) {
      this.setState({
        toggledColumns: this.state.toggledColumns.filter(c => c !== column)
      });
    } else {
      this.setState({
        toggledColumns: [...this.state.toggledColumns, column]
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

  render() {
    const allColumns = this.props.allColumns;
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
              className="btn btn-sm btn-success"
              onClick={this.openProjectionModal(allColumns)}
            >
              Projection
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

export default withRouter(props => {
  return (
    <ApolloConsumer>
      {client => (
        <Query
          query={QUERY}
          variables={{
            keyspace_name: props.router.query.keyspace_name,
            table_name: props.router.query.table_name,
            column_projections: props.router.query.projectionFromLocalForage
              ? props.router.query.projectionFromLocalForage
              : []
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
                    ? data.allRowsByTableAndKeyspace.map(row => JSON.parse(row))
                    : []
                }
                allColumns={
                  data && data.allColumnsByTableAndKeyspace
                    ? data.allColumnsByTableAndKeyspace.map(col =>
                        JSON.parse(col)
                      )
                    : []
                }
              />
            </div>
          )}
        </Query>
      )}
    </ApolloConsumer>
  );
});
