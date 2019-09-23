import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import Link from "next/link";
import Head from "next/head";
import appConfig from "../app.json";
import { FormModal } from "../components/Modal";
import gql from "graphql-tag";

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

  render() {
    const { allKeyspaces } = this.props;

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
          size="lg"
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
            <div className="col-md-3">
              <div className="card">
                <div className="card-status bg-primary" />
                <div className="card-header">
                  <div className="card-title">
                    <i className="fa fa-link" /> Link Cepat
                  </div>
                </div>
                <div className="card-body">
                  <Link href="#">
                    <a
                      className="btn btn-success btn-block pt-4"
                      style={{ fontSize: "120%" }}
                      onClick={this.openNewKeyspace}
                    >
                      <i
                        className="fa fa-database"
                        style={{ fontSize: "150%" }}
                      />
                      <br />
                      New Keyspace
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <div className="card">
                <div className="card-status bg-success" />
                <div className="card-header">
                  <div className="card-title">
                    <i className="fa fa-info-circle" /> {appConfig.appName}
                  </div>
                </div>
                <div className="card-body">
                  <div
                    className="card-body text-center"
                    style={{ fontSize: "200%" }}
                  >
                    <div className="row">
                      {allKeyspaces.map(ks => (
                        <div className="col-md-4">
                          <center>
                            <div className="alert alert-info">
                              {ks.keyspace_name}
                            </div>
                          </center>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="text-right">
                    Versi Aplikasi {appConfig.appVersion}
                  </div>
                </div>
              </div>
            </div>
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
            allKeyspaces={data && data.allKeyspaces ? data.allKeyspaces : []}
            refetch={refetch}
          />
        )}
      </Query>
    )}
  </ApolloConsumer>
);
