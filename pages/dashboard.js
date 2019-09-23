import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import Link from "next/link";
import Head from "next/head";
import appConfig from "../app.json";
import { FormModal } from "../components/Modal";
import gql from "graphql-tag";
import orderBy from "lodash/orderBy";

const FormKeyspaceModal = ({ handleInput, keyspace }) => (
  <div>
    <div className="form-group">
      <label>Keyspace Name</label>
      <input
        className="form-control"
        value={keyspace.keyspace_name}
        onChange={handleInput("keyspace_name")}
      />
    </div>
    <div className="form-group">
      <label>Class</label>
      <select
        className="form-control"
        value={keyspace.class}
        onChange={handleInput("class")}
      >
        <option value="SimpleStrategy">Simple Strategy</option>
        <option value="NetworkTopologyStrategy">
          Network Topology Strategy
        </option>
      </select>
    </div>
    <div className="form-group">
      <label>Replication Factor</label>
      <input
        className="form-control"
        type="number"
        min="1"
        value={keyspace.replication_factor}
        onChange={handleInput("replication_factor")}
      />
    </div>

    <div className="form-group">
      <label>Durable Writes</label>
      <div className="form-inline">
        <input
          className="form-control"
          type="radio"
          style={{ marginRight: 10 }}
        />{" "}
        No
        <input
          className="form-control"
          type="radio"
          style={{ marginLeft: 20, marginRight: 10 }}
        />{" "}
        Yes
      </div>
    </div>
  </div>
);

class DashboardPage extends Component {
  state = {
    new_keyspace: {
      keyspace_name: "",
      replication_factor: 1,
      class: "",
      durable_writes: false
    },
    addNewKeyspaceVisible: false
  };

  openNewKeyspace = () => {
    this.setState({
      new_keyspace: {
        keyspace_name: "",
        replication_factor: 1,
        class: "SimpleStrategy",
        durable_writes: false
      },
      addNewKeyspaceVisible: true
    });
  };

  closeNewKeyspace = () => {
    this.setState({
      addNewKeyspaceVisible: false
    });
  };

  handleInputNewKeyspace = key => e => {
    if (key === "durable_writes_no") {
      this.setState({
        new_keyspace: {
          ...this.state.new_keyspace,
          durable_writes: false
        }
      });
    } else if (key === "durable_writes_yes") {
      this.setState({
        new_keyspace: {
          ...this.state.new_keyspace,
          durable_writes: true
        }
      });
    } else {
      this.setState({
        new_keyspace: {
          ...this.state.new_keyspace,
          [key]: e.target.value
        }
      });
    }
  };

  handleSelectKeyspace = selectedKeyspace => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("handleSelectKeyspace", { selectedKeyspace });
  };

  handleAlterKeyspace = selectedKeyspace => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("handleAlterKeyspace", { selectedKeyspace });
  };

  handleDropKeyspace = selectedKeyspace => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("handleDropKeyspace", { selectedKeyspace });
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
              <i className="fa fa-plus-circle" /> New Keyspace
            </span>
          }
          visible={this.state.addNewKeyspaceVisible}
          onClose={this.closeNewKeyspace}
        >
          <FormKeyspaceModal
            keyspace={this.state.new_keyspace}
            handleInput={this.handleInputNewKeyspace}
          />
        </FormModal>

        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h3 className="fa-pull-left">
                <i className="fa fa-info-circle" /> All Keyspaces
              </h3>
              <div className="fa-pull-right hoverable on-hover-shadow">
                <button
                  className="btn btn-success btn-block"
                  onClick={this.openNewKeyspace}
                >
                  <i className="fa fa-plus-circle" /> Add New Keyspace
                </button>
              </div>
              <div className="clearfix" />
              <hr className="mt-2" />
            </div>

            {this.props.allKeyspaces.map(ks => {
              if (ks.keyspace_name.includes("system")) {
                return (
                  <div
                    className="col-md-4"
                    key={ks.keyspace_name}
                    onClick={this.handleSelectKeyspace(ks)}
                  >
                    <div className="card hoverable on-hover-shadow">
                      <div className="card-status bg-primary" />
                      <div className="card-body">
                        <h4>
                          <i className="fa fa-database" /> {ks.keyspace_name}{" "}
                          <button className="btn btn-secondary btn-sm on-hover-shown">
                            <i className="fa fa-mouse-pointer" /> SELECT
                          </button>
                        </h4>
                        <div className="fa-pull-left text-secondary">
                          <span>
                            <i className="fa fa-exclamation-circle" /> System
                            Keyspace
                          </span>
                        </div>
                        <div className="fa-pull-right on-hover-shown">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={this.handleAlterKeyspace(ks)}
                          >
                            ALTER
                          </button>
                          &nbsp;&nbsp;
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled
                          >
                            DROP
                          </button>
                        </div>
                        <div className="clearfix"></div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    className="col-md-4"
                    key={ks.keyspace_name}
                    onClick={this.handleSelectKeyspace(ks)}
                  >
                    <div className="card hoverable on-hover-shadow">
                      <div className="card-status bg-success" />
                      <div className="card-body">
                        <h4>
                          <i className="fa fa-database" /> {ks.keyspace_name}{" "}
                          <button className="btn btn-secondary btn-sm on-hover-shown">
                            <i className="fa fa-mouse-pointer" /> SELECT
                          </button>
                        </h4>
                        <div className="fa-pull-left text-secondary">
                          <span>
                            <i className="fa fa-check-circle" /> User Keyspace
                          </span>
                        </div>
                        <div className="fa-pull-right on-hover-shown">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={this.handleAlterKeyspace(ks)}
                          >
                            ALTER
                          </button>
                          &nbsp;&nbsp;
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={this.handleDropKeyspace(ks)}
                          >
                            DROP
                          </button>
                        </div>
                        <div className="clearfix"></div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </AdminArea>
    );
  }
}
const KEYSPACE_QUERIES = gql`
  query keyspaces {
    allKeyspaces {
      keyspace_name
      durable_writes
      replication
    }
  }
`;

export default props => (
  <ApolloConsumer>
    {client => (
      <Query query={KEYSPACE_QUERIES}>
        {({ error, loading, data, refetch }) => (
          <DashboardPage
            {...props}
            client={client}
            error={error}
            loading={loading}
            allKeyspaces={
              data && data.allKeyspaces
                ? orderBy(data.allKeyspaces, ["keyspace_name"], ["asc"])
                : []
            }
            refetch={refetch}
          />
        )}
      </Query>
    )}
  </ApolloConsumer>
);
