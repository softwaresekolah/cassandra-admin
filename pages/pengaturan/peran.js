import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../../components/AdminArea";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Head from "next/head";
import appConfig from "../../app.json";
import DataTable from "../../components/DataTable";
import { handleError } from "../../libs/errors";
import { FormModal } from "../../components/Modal";
import {
  showLoadingSpinner,
  hideLoadingSpinner,
  addNotification
} from "../../components/App";
import rolePrivileges from "../../graphql/role-privileges";
// console.log({ rolePrivileges });

const UserRoleForm = ({ formData, handleInput, selectAll, deselectAll }) => (
  <div>
    <div className="form-group">
      <label>Nama Peran *</label>
      <input
        className="form-control"
        required
        value={formData.name}
        onChange={handleInput("name")}
      />
    </div>
    <div className="fa-pull-left">
      <label>Privileges *</label>
    </div>
    <div className="fa-pull-right">
      <button
        className="btn btn-success btn-rounded btn-sm"
        type="button"
        onClick={selectAll}
      >
        <i className="fa fa-check-circle" /> Select All
      </button>
      &nbsp;&nbsp;
      <button
        className="btn btn-orange btn-rounded btn-sm"
        type="button"
        onClick={deselectAll}
      >
        <i className="fa fa-circle" /> Deselect All
      </button>
    </div>
    <div className="clearfix" />
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Fitur</th>
          <th>Create</th>
          <th>Read</th>
          <th>Update</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {rolePrivileges.map(privilege => (
          <tr key={privilege.name}>
            <th>
              <b>{privilege.name}</b>
            </th>
            {["Create", "Read", "Update", "Delete"].map(access => (
              <td key={privilege.name + ":" + access}>
                {privilege.access.includes(access) ? (
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={privilege.name + ":" + access}
                      checked={
                        !formData.privileges
                          ? false
                          : formData.privileges.includes(
                              privilege.name + ":" + access
                            )
                      }
                      onChange={handleInput("privileges")}
                      id={privilege.name + ":" + access}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={privilege.name + ":" + access}
                    >
                      {access}
                    </label>
                  </div>
                ) : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

class PeranPage extends Component {
  columns = [
    {
      Header: "Nama Peran",
      accessor: "name",
      width: 150
    },
    {
      Header: "Hak Akses",
      accessor: "privileges",
      style: { whiteSpace: "unset" },
      Cell: props =>
        props.value.map(privilege => {
          const splitted = privilege.split(":");
          return (
            <span className="badge badge-success mr-2" key={privilege}>
              {splitted[1]} {splitted[0]}
            </span>
          );
        })
    }
  ];

  state = {
    formData: {
      name: "",
      privileges: []
    },
    addUserRoleVisible: false,
    editUserRoleVisible: false
  };

  handleInput = key => e => {
    if (key === "privileges") {
      // console.log(e.target.value, e.target.checked);
      let { privileges } = this.state.formData;
      privileges = privileges.filter(p => p !== e.target.value);
      if (e.target.checked) {
        privileges.push(e.target.value);
      }
      // console.log(privileges)
      this.setState({
        formData: {
          ...this.state.formData,
          privileges
        }
      });
    } else {
      this.setState({
        formData: {
          ...this.state.formData,
          [key]: e.target.value
        }
      });
    }
  };

  handleSelectAll = e => {
    this.setState({
      formData: {
        ...this.state.formData,
        privileges: rolePrivileges.reduce((all, privilege) => {
          for (const access of privilege.access) {
            all.push(privilege.name + ":" + access);
          }
          return all;
        }, [])
      }
    });
  };

  handleDeselectAll = e => {
    this.setState({
      formData: {
        ...this.state.formData,
        privileges: []
      }
    });
  };

  openAddUserRole = e => {
    if (e) e.preventDefault();
    this.setState({
      addUserRoleVisible: true,
      formData: {
        name: "",
        privileges: []
      }
    });
  };

  closeAddUserRole = e => {
    if (e) e.preventDefault();
    this.setState({
      addUserRoleVisible: false
    });
  };

  handleAddUserRole = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      await this.props.createUserRole({
        variables: {
          ...this.state.formData
        }
      });
      await this.props.refetch();
      this.closeAddUserRole();
      addNotification({
        message: `Peran ${this.state.formData.name} berhasil ditambahkan`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  openEditUserRole = ({ row }) => {
    this.setState({
      editUserRoleVisible: true,
      formData: {
        name: "",
        privileges: [],
        ...row
      }
    });
  };

  closeEditUserRole = e => {
    if (e) e.preventDefault();
    this.setState({
      editUserRoleVisible: false
    });
  };

  handleEditUserRole = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      await this.props.updateUserRole({
        variables: {
          ...this.state.formData
        }
      });
      await this.props.refetch();
      this.closeEditUserRole();
      addNotification({
        message: `Peran ${this.state.formData.name} berhasil diperbarui`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  handleDeleteUserRole = async ({ rows, keys }) => {
    try {
      if (confirm(`Apakah Anda yakin untuk menghapus ${keys.length} Peran?`)) {
        showLoadingSpinner();
        for (const _id of keys) {
          await this.props.deleteUserRole({
            variables: {
              _id
            }
          });
        }
        await this.props.refetch();
        addNotification({
          message: `Peran berhasil dihapus`,
          level: "success"
        });
      }
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  render() {
    console.log();
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Peran | {appConfig.appName}</title>
        </Head>

        <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> Tambah Peran
            </span>
          }
          size="lg"
          visible={this.state.addUserRoleVisible}
          onClose={this.closeAddUserRole}
          onSubmit={this.handleAddUserRole}
        >
          <UserRoleForm
            formData={this.state.formData}
            handleInput={this.handleInput}
            selectAll={this.handleSelectAll}
            deselectAll={this.handleDeselectAll}
          />
        </FormModal>

        <FormModal
          title={
            <span>
              <i className="fa fa-pencil-alt" /> Edit Peran
            </span>
          }
          size="lg"
          visible={this.state.editUserRoleVisible}
          onClose={this.closeEditUserRole}
          onSubmit={this.handleEditUserRole}
        >
          <UserRoleForm
            formData={this.state.formData}
            handleInput={this.handleInput}
            selectAll={this.handleSelectAll}
            deselectAll={this.handleDeselectAll}
          />
        </FormModal>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <DataTable
                  title={
                    <span>
                      <i className="fa fa-star" /> &nbsp;Peran
                    </span>
                  }
                  withoutCard
                  loading={this.props.loading}
                  columns={this.columns}
                  data={this.props.allUserRoles}
                  onAddData={this.openAddUserRole}
                  onEditData={this.openEditUserRole}
                  onDeleteData={this.handleDeleteUserRole}
                />
              </div>
            </div>
          </div>
        </div>
      </AdminArea>
    );
  }
}

const QUERY = gql`
  query A {
    allUserRoles {
      _id
      name
      privileges
      countUsers
    }
  }
`;

const CREATE = gql`
  mutation createUserRole($name: String!, $privileges: [String!]!) {
    createUserRole(name: $name, privileges: $privileges) {
      _id
      name
      privileges
      countUsers
    }
  }
`;

const UPDATE = gql`
  mutation updateUserRole($_id: ID!, $name: String!, $privileges: [String!]!) {
    updateUserRole(_id: $_id, name: $name, privileges: $privileges)
  }
`;

const DELETE = gql`
  mutation deleteUserRole($_id: ID!) {
    deleteUserRole(_id: $_id)
  }
`;

export default protectAdminArea(props => (
  <ApolloConsumer>
    {client => (
      <Mutation mutation={CREATE}>
        {createUserRole => (
          <Mutation mutation={UPDATE}>
            {updateUserRole => (
              <Mutation mutation={DELETE}>
                {deleteUserRole => (
                  <Query query={QUERY}>
                    {({ error, loading, data, refetch }) => (
                      <PeranPage
                        {...props}
                        client={client}
                        error={error}
                        loading={loading}
                        allUserRoles={
                          data && data.allUserRoles ? data.allUserRoles : []
                        }
                        refetch={refetch}
                        //
                        createUserRole={createUserRole}
                        updateUserRole={updateUserRole}
                        deleteUserRole={deleteUserRole}
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
));
