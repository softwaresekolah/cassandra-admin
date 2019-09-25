import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import Link from "next/link";
import Head from "next/head";
import Router from "next/router";
import appConfig from "../app.json";
import { FormModal } from "../components/Modal";
import { handleError } from "../libs/errors";
import gql from "graphql-tag";
import orderBy from "lodash/orderBy";
import { addNotification } from "../components/App";

const FormKeyspaceModal = ({ handleInput, keyspace }) => (
  <div>
    <div className="form-group">
      <label>Keyspace Name</label>
      <input
        className="form-control"
        value={keyspace.keyspace_name}
        disabled={keyspace.editStatus ? true : false}
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
        <option value="NetworkTopologyStrategy" disabled>
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
        <div className="radio">
          <label>
            <input
              type="radio"
              onChange={handleInput("durable_writes_no")}
              checked={keyspace.durable_writes === false}
              style={{ marginRight: 10 }}
            />{" "}
            No
          </label>
        </div>
        <div className="radio" style={{ marginLeft: 20 }}>
          <label>
            <input
              type="radio"
              onChange={handleInput("durable_writes_yes")}
              checked={keyspace.durable_writes === true}
              style={{ marginRight: 10 }}
            />{" "}
            Yes
          </label>
        </div>
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
    alter_keyspace: {
      keyspace_name: "",
      replication_factor: 1,
      class: "",
      durable_writes: false
    },
    info: "",
    addNewKeyspaceVisible: false,
    alterKeyspaceVisible: false
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
    } else if (key === "replication_factor") {
      this.setState({
        new_keyspace: {
          ...this.state.new_keyspace,
          replication_factor: parseInt(e.target.value)
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

  handleInputAlterKeyspace = key => e => {
    if (key === "durable_writes_no") {
      this.setState({
        alter_keyspace: {
          ...this.state.alter_keyspace,
          durable_writes: false
        }
      });
    } else if (key === "durable_writes_yes") {
      this.setState({
        alter_keyspace: {
          ...this.state.alter_keyspace,
          durable_writes: true
        }
      });
    } else if (key === "replication_factor") {
      this.setState({
        alter_keyspace: {
          ...this.state.alter_keyspace,
          replication_factor: parseInt(e.target.value)
        }
      });
    } else {
      this.setState({
        alter_keyspace: {
          ...this.state.alter_keyspace,
          [key]: e.target.value
        }
      });
    }
  };

  closeAlterKeyspace = () => {
    this.setState({
      alterKeyspaceVisible: false
    });
  };

  handleSubmitNewKeypsace = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await this.props.createKeyspace({
        variables: {
          ...this.state.new_keyspace
        }
      });

      addNotification({
        message: "Keyspace created success",
        level: "success"
      });

      await this.props.refetch();
      this.closeNewKeyspace();
    } catch (err) {
      handleError(err);
    }
  };

  handleSelectKeyspace = selectedKeyspace => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // console.log("handleSelectKeyspace", { selectedKeyspace });

    Router.push({
      pathname: "/table_lists",
      query: {
        ...selectedKeyspace
      }
    });
  };

  openAlterKeyspace = selectedKeyspace => e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // console.log("openAlterKeyspace", { selectedKeyspace });

    const replication = JSON.parse(selectedKeyspace.replication);
    this.setState({
      alter_keyspace: {
        keyspace_name: selectedKeyspace.keyspace_name,
        replication_factor: parseInt(replication.replication_factor),
        class: replication.class,
        durable_writes: selectedKeyspace.durable_writes,
        editStatus: true
      },
      alterKeyspaceVisible: true
    });
  };

  handleSubmitAlterKeys = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      await this.props.alterKeyspace({
        variables: {
          ...this.state.alter_keyspace
        }
      });

      addNotification({
        message: "Alter keyspace success",
        level: "success"
      });

      await this.props.refetch();
    } catch (err) {
      handleError(err);
    }
  };

  handleDropKeyspace = selectedKeyspace => async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // console.log("handleDropKeyspace", { selectedKeyspace });

    if (
      confirm(
        `Are you sure to drop keyspace: ${selectedKeyspace.keyspace_name} ? `
      )
    ) {
      try {
        await this.props.dropKeyspace({
          variables: {
            keyspace_name: selectedKeyspace.keyspace_name
          }
        });

        addNotification({
          message: "Keyspace drop success",
          level: "success"
        });
        await this.props.refetch();
        this.closeAlterKeyspace();
      } catch (err) {
        handleError(err);
      }
    }
  };

  render() {
    let info = this.props.info;
    return (
      <AdminArea>
        <Head>
          <title>Dashboard | {appConfig.appName}</title>
        </Head>

        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <img
                    className="img img-fluid mb-3"
                    src="/static/images/logo-small.png"
                    style={{ maxWidth: 100 }}
                  />
                  <h4>
                    <i className="fa fa-tools" /> {appConfig.appName}
                  </h4>
                </div>
                <div className="card-footer text-right">
                  <small>
                    <i className="fa fa-info-circle" /> App Version{" "}
                    {appConfig.appVersion}
                  </small>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-body">
                  <h4 className="fa-pull-left">
                    <i className="fa fa-info-circle" /> Node Information
                  </h4>
                  <div className="clearfix" />
                  <hr className="mt-2" />
                  <div className="row">
                    {Object.keys(info).map(key => (
                      <div className="col-md-6" key={key}>
                        <div key={key} className="form-group">
                          <label>{key}</label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={info[key]}
                          />
                        </div>
                      </div>
                    ))}
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
      countTables
    }
    info
  }
`;

const CREATE_KEYSPACE = gql`
  mutation createKeyspace(
    $keyspace_name: String!
    $durable_writes: Boolean!
    $class: String!
    $replication_factor: Int!
  ) {
    createKeyspace(
      keyspace_name: $keyspace_name
      durable_writes: $durable_writes
      class: $class
      replication_factor: $replication_factor
    )
  }
`;

const ALTER_KEYSPACE = gql`
  mutation alterKeyspace(
    $keyspace_name: String!
    $durable_writes: Boolean!
    $class: String!
    $replication_factor: Int!
  ) {
    alterKeyspace(
      keyspace_name: $keyspace_name
      durable_writes: $durable_writes
      class: $class
      replication_factor: $replication_factor
    )
  }
`;

const DROP_KEYSPACE = gql`
  mutation dropKeyspace($keyspace_name: String!) {
    dropKeyspace(keyspace_name: $keyspace_name)
  }
`;

export default props => (
  <ApolloConsumer>
    {client => (
      <Mutation mutation={ALTER_KEYSPACE}>
        {alterKeyspace => (
          <Mutation mutation={DROP_KEYSPACE}>
            {dropKeyspace => (
              <Mutation mutation={CREATE_KEYSPACE}>
                {createKeyspace => (
                  <Query query={KEYSPACE_QUERIES}>
                    {({ error, loading, data, refetch }) => (
                      <DashboardPage
                        {...props}
                        client={client}
                        error={error}
                        loading={loading}
                        allKeyspaces={
                          data && data.allKeyspaces
                            ? orderBy(
                                data.allKeyspaces,
                                ["keyspace_name"],
                                ["asc"]
                              )
                            : []
                        }
                        info={data && data.info ? JSON.parse(data.info) : ""}
                        refetch={refetch}
                        createKeyspace={createKeyspace}
                        dropKeyspace={dropKeyspace}
                        alterKeyspace={alterKeyspace}
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
  </ApolloConsumer>
);
