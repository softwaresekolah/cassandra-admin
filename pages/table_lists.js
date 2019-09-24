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
  render() {
    const { allTables } = this.state;
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Dashboard | {appConfig.appName}</title>
        </Head>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <div className="text-left float-left">
                <i className="fa fa-arrow-left" /> All Keyspaces
              </div>
            </div>
          </div>
          <br />

          <div className="text-left float-left">
            <h3>
              <i className="fa fa-table" />{" "}
              {this.props.router.query.keyspace_name} Keyspace
            </h3>
          </div>
          <div className="row">
            <div className="col-md-12">list table</div>
          </div>
        </div>
      </AdminArea>
    );
  }
}

export default withRouter(props => (
  <ApolloConsumer>
    {client => <TableLists {...props} client={client} />}
  </ApolloConsumer>
));
