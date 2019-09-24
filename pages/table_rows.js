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

class TableRows extends Component {
  state = {
    columns: []
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

  render() {
    return (
      <AdminArea withoutFooter fluid>
        <Head>
          <title>Dashboard | {appConfig.appName}</title>
        </Head>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="text-left float-left">
                <a
                  href={
                    "/table_lists?keyspace_name=" +
                    this.props.router.query.keyspace_name
                  }
                >
                  <i className="fa fa-arrow-left" /> All tables under `
                  {this.props.router.query.keyspace_name}` keyspace
                </a>
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

          <div className="row">
            <div className="col-md-12">
              <div className="card">
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
                          <i className="fa fa-info-circle" /> All Rows
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
  query allRowsByTableAndKeyspace(
    $keyspace_name: String!
    $table_name: String!
  ) {
    allRowsByTableAndKeyspace(
      keyspace_name: $keyspace_name
      table_name: $table_name
    )
  }
`;

export default withRouter(props => (
  <ApolloConsumer>
    {client => (
      <Query
        query={QUERY}
        variables={{
          keyspace_name: props.router.query.keyspace_name,
          table_name: props.router.query.table_name
        }}
      >
        {({ error, loading, data }) => (
          <TableRows
            {...props}
            client={client}
            loading={loading}
            error={error}
            allRows={
              data && data.allRowsByTableAndKeyspace
                ? data.allRowsByTableAndKeyspace.map(row => JSON.parse(row))
                : []
            }
          />
        )}
      </Query>
    )}
  </ApolloConsumer>
));
