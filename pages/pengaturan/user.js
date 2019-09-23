import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../../components/AdminArea";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Head from "next/head";
import { withRouter } from "next/router";
import appConfig from "../../app.json";
import DataTable from "../../components/DataTable";
import { handleError } from "../../libs/errors";
import { FormModal } from "../../components/Modal";
import {
  showLoadingSpinner,
  hideLoadingSpinner,
  addNotification,
  clearNotifications
} from "../../components/App";
import dayjs from "dayjs";
import Link from "next/link";

const UserForm = ({ formData, handleInput, allUserRoles }) => (
  <div>
    <div className="form-group">
      <label>Username (digunakan untuk login) *</label>
      <input
        className="form-control"
        required
        value={formData.username}
        onChange={handleInput("username")}
      />
    </div>
    <div className="form-group">
      <label>Password *</label>
      <input
        type="password"
        className="form-control"
        value={formData.password}
        onChange={handleInput("password")}
      />
    </div>
    <div className="form-group">
      <label>Konfirmasi Password *</label>
      <input
        type="password"
        className="form-control"
        value={formData.passwordConfirmation}
        onChange={handleInput("passwordConfirmation")}
      />
    </div>
    <div className="form-group">
      <label>Peran</label>
      <select
        className="form-control"
        required
        value={formData.roleId}
        onChange={handleInput("roleId")}
      >
        <option value="" disabled>
          Pilih peran user
        </option>
        {allUserRoles
          ? allUserRoles.map(role => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))
          : null}
      </select>
    </div>
    <hr className="mb-2 mt-2" />
    <div className="form-group">
      <label>Email (opsional)</label>
      <input
        type="email"
        className="form-control"
        value={formData.email}
        onChange={handleInput("email")}
      />
    </div>
    <div className="form-group">
      <label>Nomor HP (opsional)</label>
      <input
        className="form-control"
        value={formData.phone}
        onChange={handleInput("phone")}
      />
    </div>
  </div>
);

const UserRoleForm = ({ formData, handleInput, allUserRoles }) => (
  <div>
    <div className="form-group">
      <label>Username (digunakan untuk login) *</label>
      <input
        className="form-control"
        required
        disabled
        value={formData.username}
        onChange={handleInput("username")}
      />
    </div>
    <div className="form-group">
      <label>Peran</label>
      <select
        className="form-control"
        required
        value={formData.roleId}
        onChange={handleInput("roleId")}
      >
        <option value="" disabled>
          Pilih peran user
        </option>
        {allUserRoles
          ? allUserRoles.map(role => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))
          : null}
      </select>
    </div>
  </div>
);

const UserPasswordForm = ({ formData, handleInput }) => (
  <div>
    <div className="form-group">
      <label>Username (digunakan untuk login) *</label>
      <input
        className="form-control"
        required
        disabled
        value={formData.username}
        onChange={handleInput("username")}
      />
    </div>
    <div className="form-group">
      <label>Password *</label>
      <input
        type="password"
        className="form-control"
        value={formData.newPassword}
        onChange={handleInput("newPassword")}
      />
    </div>
    <div className="form-group">
      <label>Konfirmasi Password *</label>
      <input
        type="password"
        className="form-control"
        value={formData.passwordConfirmation}
        onChange={handleInput("passwordConfirmation")}
      />
    </div>
  </div>
);

class UserPage extends Component {
  columns = [
    {
      Header: "Username",
      accessor: "username",
      // maxWidth: 200,
      Cell: props => (
        <div>
          <i className="fa fa-user" /> {props.value}
          <hr className="mb-1 mt-1" />
          <i className="fa fa-phone-square" />{" "}
          {props.original.phone ? props.original.phone : "N/A"}
          <br />
          <i className="fa fa-envelope" />{" "}
          {props.original.email ? props.original.email : "N/A"}
        </div>
      )
    },
    {
      Header: "Alumni",
      accessor: "Alumni.name",
      style: { textAlign: "center" },
      Cell: props =>
        props.value ? (
          <div>
            <Link
              href={{
                pathname: "/daftar_alumni",
                query: { alumniId: props.original.Alumni._id }
              }}
            >
              <a>
                {props.value} <i className="fa fa-external-link-square-alt" />
              </a>
            </Link>
          </div>
        ) : (
          "N/A"
        )
    },
    {
      Header: "Password Update",
      accessor: "passwordUpdatedAt",
      style: { textAlign: "center" },
      width: 125,
      Cell: props =>
        props.value ? dayjs(props.value).format("DD-MM-YYYY HH:mm") : "N/A"
    },
    {
      Header: "Default Password",
      accessor: "defaultPassword",
      style: { textAlign: "center" },
      width: 125,
      Cell: props =>
        !props.original.passwordUpdatedAt && props.value ? props.value : "N/A"
    },
    {
      Header: "Peran",
      accessor: "Role.name",
      width: 150,
      style: { textAlign: "center" },
      Cell: props => (
        <div>
          {props.value}
          {props.original.lastLoginAt ? (
            <span>
              <hr className="mb-1 mt-1" />
              Terakhir Login
              <br />
              {dayjs(props.original.lastLoginAt).format("DD-MM-YYYY HH:mm")}
            </span>
          ) : null}
        </div>
      )
    },
    {
      Header: "Status",
      accessor: "status",
      style: { textAlign: "center" },
      width: 75
    },
    {
      Header: "",
      filterable: false,
      sortable: false,
      accessor: "_id",
      width: 150,
      Cell: props => (
        <div className="text-center">
          {props.original.status === "Aktif" ? (
            <button
              className="btn btn-warning btn-sm btn-block"
              type="button"
              onClick={this.handleDeactivateUser(props.original)}
            >
              <i className="fa fa-circle" /> Set Tidak Aktif
            </button>
          ) : (
            <button
              className="btn btn-info btn-sm btn-block"
              type="button"
              onClick={this.handleActivateUser(props.original)}
            >
              <i className="fa fa-check-circle" /> Set Aktif
            </button>
          )}
          <button
            className="btn btn-primary btn-sm btn-block mt-2"
            type="button"
            onClick={this.openUpdateRoleForUser(props.original)}
            disabled={!!props.original.Alumni}
          >
            <i className="fa fa-pencil-alt" /> Edit Peran
          </button>
          <button
            className="btn btn-danger btn-sm btn-block mt-2"
            type="button"
            onClick={this.openResetPassword(props.original)}
          >
            <i className="fa fa-key" /> Reset Password
          </button>
        </div>
      )
    }
  ];

  state = {
    formData: {
      username: "",
      password: "",
      roleId: "",
      email: "",
      phone: "",
      status: "Aktif",
      passwordConfirmation: ""
    },
    addUserVisible: false,
    editUserRoleVisible: false,
    resetPasswordVisible: false
  };

  handleActivateUser = user => async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      await this.props.activateUser({
        variables: {
          _id: user._id
        }
      });
      await this.props.refetch();
      clearNotifications();
      addNotification({
        message: `User ${user.username} saat ini tidak aktif`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  handleDeactivateUser = user => async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      await this.props.deactivateUser({
        variables: {
          _id: user._id
        }
      });
      await this.props.refetch();
      clearNotifications();
      addNotification({
        message: `User ${user.username} saat ini aktif`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  openUpdateRoleForUser = user => async e => {
    if (e) e.preventDefault();
    const role = this.props.allUserRoles.find(r => r._id === user.roleId);
    // console.log({ user })
    this.setState({
      editUserRoleVisible: true,
      formData: {
        username: "",
        password: "",
        roleId: "",
        email: "",
        phone: "",
        status: "Aktif",
        passwordConfirmation: "",
        ...user,
        roleId: role ? role._id : ""
      }
    });
  };

  closeEditUserRole = e => {
    if (e) e.preventDefault();
    this.setState({
      editUserRoleVisible: false
    });
  };

  handleUpdateRoleForUser = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      await this.props.updateRoleForUser({
        variables: {
          ...this.state.formData
        }
      });
      await this.props.refetch();
      const role = this.props.allUserRoles.find(
        r => r._id === this.state.formData.roleId
      );
      // console.log(role, this.props.allUserRoles, this.state.formData);
      clearNotifications();
      addNotification({
        message: `User ${
          this.state.formData.username
        } sekarang memiliki peran ${role.name}`,
        level: "success"
      });
      this.closeEditUserRole();
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  openResetPassword = user => e => {
    if (e) e.preventDefault();
    this.setState({
      resetPasswordVisible: true,
      formData: {
        newPassword: "",
        passwordConfirmation: "",
        ...user
      }
    });
  };

  closeResetPassword = e => {
    if (e) e.preventDefault();
    this.setState({
      resetPasswordVisible: false
    });
  };

  handleResetPassword = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      const { newPassword, passwordConfirmation } = this.state.formData;
      if (newPassword !== passwordConfirmation) {
        throw {
          message: "Konfirmasi password tidak cocok!"
        };
      }
      await this.props.resetUserPassword({
        variables: {
          ...this.state.formData
        }
      });
      await this.props.refetch();
      clearNotifications();
      addNotification({
        message: `Password untuk user ${
          this.state.formData.username
        } berhasil dirubah`,
        level: "success"
      });
      this.closeResetPassword();
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  handleInput = key => e => {
    this.setState({
      formData: {
        ...this.state.formData,
        [key]: e.target.value
      }
    });
  };

  openAddUser = e => {
    if (e) e.preventDefault();
    this.setState({
      addUserVisible: true,
      formData: {
        username: "",
        password: "",
        roleId: "",
        email: "",
        phone: "",
        status: "Aktif",
        passwordConfirmation: "",
        prefixValue: null
      }
    });
  };

  closeAddUser = e => {
    if (e) e.preventDefault();
    this.setState({
      addUserVisible: false
    });
  };

  handleAddUser = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      const { password, passwordConfirmation } = this.state.formData;
      if (password !== passwordConfirmation) {
        throw {
          message: `Konfirmasi password tidak cocok!`
        };
      }
      await this.props.registerUser({
        variables: {
          ...this.state.formData
        }
      });
      await this.props.refetch();
      this.closeAddUser();
      addNotification({
        message: `User ${this.state.formData.username} berhasil ditambahkan`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  handleDeleteUser = async ({ rows, keys }) => {
    try {
      if (rows.find(row => !!row.Alumni)) {
        throw {
          message: `Salah satu user memiliki data alumni. Menghapus user tidak diijinkan!`
        };
      }
      if (confirm(`Apakah Anda yakin untuk menghapus ${keys.length} User?`)) {
        showLoadingSpinner();
        for (const _id of keys) {
          await this.props.deleteUser({
            variables: {
              _id
            }
          });
        }
        await this.props.refetch();
        addNotification({
          message: `User berhasil dihapus`,
          level: "success"
        });
      }
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  render() {
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>User | {appConfig.appName}</title>
        </Head>

        <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> Tambah User
            </span>
          }
          visible={this.state.addUserVisible}
          onClose={this.closeAddUser}
          onSubmit={this.handleAddUser}
        >
          <UserForm
            formData={this.state.formData}
            handleInput={this.handleInput}
            allUserRoles={this.props.allUserRoles}
          />
        </FormModal>

        <FormModal
          title={
            <span>
              <i className="fa fa-pencil-alt" /> Edit Peran User
            </span>
          }
          visible={this.state.editUserRoleVisible}
          onClose={this.closeEditUserRole}
          onSubmit={this.handleUpdateRoleForUser}
        >
          <UserRoleForm
            formData={this.state.formData}
            handleInput={this.handleInput}
            allUserRoles={this.props.allUserRoles}
          />
        </FormModal>

        <FormModal
          title={
            <span>
              <i className="fa fa-key" /> Reset Password
            </span>
          }
          visible={this.state.resetPasswordVisible}
          onClose={this.closeResetPassword}
          onSubmit={this.handleResetPassword}
        >
          <UserPasswordForm
            formData={this.state.formData}
            handleInput={this.handleInput}
          />
        </FormModal>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <DataTable
                  title={
                    <span>
                      <i className="fa fa-user-shield" /> &nbsp;User
                    </span>
                  }
                  withoutCard
                  loading={this.props.loading}
                  columns={this.columns}
                  data={this.props.allUsers}
                  onAddData={this.openAddUser}
                  onDeleteData={this.handleDeleteUser}
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
    allUsers {
      _id
      username
      email
      phone
      roleId
      Role {
        _id
        name
      }
      status
      lastLoginAt
      passwordUpdatedAt
      defaultPassword
      Alumni {
        _id
        name
      }
    }
    allUserRoles {
      _id
      name
    }
  }
`;

const REGISTER = gql`
  mutation registerUser(
    $username: String!
    $password: String!
    $roleId: String!
    $email: String
    $phone: String
    $status: String!
  ) {
    registerUser(
      username: $username
      password: $password
      roleId: $roleId
      email: $email
      phone: $phone
      status: $status
    ) {
      _id
      username
      email
      phone
      roleId
      Role {
        _id
        name
      }
      status
      passwordUpdatedAt
      defaultPassword
    }
  }
`;

const UPDATE_ROLE = gql`
  mutation updateRoleForUser($_id: ID!, $roleId: String!) {
    updateRoleForUser(_id: $_id, roleId: $roleId)
  }
`;

const RESET = gql`
  mutation resetUserPassword($_id: ID!, $newPassword: String!) {
    resetUserPassword(_id: $_id, newPassword: $newPassword)
  }
`;

const ACTIVATE = gql`
  mutation activateUser($_id: ID!) {
    activateUser(_id: $_id)
  }
`;

const DEACTIVATE = gql`
  mutation deactivateUser($_id: ID!) {
    deactivateUser(_id: $_id)
  }
`;

const DELETE = gql`
  mutation deleteUser($_id: ID!) {
    deleteUser(_id: $_id)
  }
`;

export default protectAdminArea(
  withRouter(props => (
    <ApolloConsumer>
      {client => (
        <Mutation mutation={RESET}>
          {resetUserPassword => (
            <Mutation mutation={ACTIVATE}>
              {activateUser => (
                <Mutation mutation={DEACTIVATE}>
                  {deactivateUser => (
                    <Mutation mutation={REGISTER}>
                      {registerUser => (
                        <Mutation mutation={UPDATE_ROLE}>
                          {updateRoleForUser => (
                            <Mutation mutation={DELETE}>
                              {deleteUser => (
                                <Query query={QUERY}>
                                  {({ error, loading, data, refetch }) => (
                                    <UserPage
                                      {...props}
                                      client={client}
                                      error={error}
                                      loading={loading}
                                      allUsers={
                                        data && data.allUsers
                                          ? data.allUsers
                                          : []
                                      }
                                      allUserRoles={
                                        data && data.allUserRoles
                                          ? data.allUserRoles
                                          : []
                                      }
                                      refetch={refetch}
                                      //
                                      registerUser={registerUser}
                                      updateRoleForUser={updateRoleForUser}
                                      deleteUser={deleteUser}
                                      activateUser={activateUser}
                                      deactivateUser={deactivateUser}
                                      resetUserPassword={resetUserPassword}
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
                </Mutation>
              )}
            </Mutation>
          )}
        </Mutation>
      )}
    </ApolloConsumer>
  ))
);
