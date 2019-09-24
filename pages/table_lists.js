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

class TableLists extends Component {
  state = {
    allTables: []
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

  render() {
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Dashboard | {appConfig.appName}</title>
        </Head>
        <div>
          <div className="row">
            <div className="col-md-6">
              <div className="text-left float-left">
                <a href="/dashboard">
                  <i className="fa fa-arrow-left" /> All Keyspaces
                </a>
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

export default withRouter(props => (
  <ApolloConsumer>
    {client => (
      <Query
        query={QUERY}
        variables={{ keyspace_name: props.router.query.keyspace_name }}
      >
        {({ error, loading, data }) => (
          <TableLists
            {...props}
            client={client}
            loading={loading}
            allTables={
              data && data.allTablesByKeyspace
                ? orderBy(data.allTablesByKeyspace, ["table_name"], ["asc"])
                : []
            }
          />
        )}
      </Query>
    )}
  </ApolloConsumer>
));
