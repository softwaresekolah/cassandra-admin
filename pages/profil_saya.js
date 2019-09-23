import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Head from "next/head";
import appConfig from "../app.json";
import { handleError } from "../libs/errors";
import {
  showLoadingSpinner,
  hideLoadingSpinner,
  addNotification
} from "../components/App";
import { getBase64 } from "../libs/base64";

class ProfilSayaPage extends Component {
  state = {
    username: "",
    email: "",
    phone: "",
    pictureUrl: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  };

  componentDidMount = () => {
    this.componentWillReceiveProps(this.props);
  };

  componentWillReceiveProps = nextProps => {
    if (nextProps.currentUser && nextProps.currentUser.username) {
      this.setState({
        ...this.state,
        ...nextProps.currentUser
      });
    }
  };

  handleInput = key => e => {
    this.setState({
      [key]: e.target.value
    });
  };

  handleInputPicture = async e => {
    const file = e.target.files[0];
    // console.log({ file });
    try {
      if (file.size >= 512 * 1024) {
        throw {
          message: "Ukuran file maksimum yang diijinkan adalah 512KB"
        };
      }
      const base64 = await getBase64(file);
      this.setState({
        ...this.state,
        pictureUrl: base64
      });
    } catch (err) {
      handleError(err);
    }
  };

  handleUpdateProfile = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      await this.props.updateUser({
        variables: {
          username: "",
          email: "",
          phone: "",
          pictureUrl: "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
          ...this.state
        }
      });
      await this.props.refetch();
      addNotification({
        message: `Profil Anda berhasil diperbarui`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  handleUpdatePassword = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      if (this.state.newPassword !== this.state.confirmPassword) {
        throw {
          message: `Konfirmasi password tidak cocok!`
        };
      }
      await this.props.updatePassword({
        variables: {
          ...this.state
        }
      });
      addNotification({
        message: `Password Anda berhasil diperbarui`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  render() {
    return (
      <AdminArea>
        <Head>
          <title>Bantuan | {appConfig.appName}</title>
        </Head>
        <form onSubmit={this.handleUpdateProfile}>
          <div className="row">
            <div className="col-4">
              <div className="card">
                <div className="card-body text-center">
                  <img
                    className="img img-fluid img-responsive img-thumbnail"
                    src={
                      this.state.pictureUrl
                        ? this.state.pictureUrl
                        : "/static/images/user-dummy.jpg"
                    }
                  />
                  <div className="form-group">
                    <input
                      accept="image/*"
                      type="file"
                      className="form-control"
                      onChange={this.handleInputPicture}
                    />
                  </div>
                  <br />
                  <button type="submit" className="btn btn-success btn-block">
                    <i className="fa fa-check-circle" /> Perbarui Profil Saya
                  </button>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card">
                <div className="card-header">
                  <i className="fa fa-user-cog" /> &nbsp;Profil Saya
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      required
                      type="text"
                      className="form-control"
                      value={this.state.username}
                      onChange={this.handleInput("username")}
                    />
                  </div>
                  <div className="form-group">
                    <label>Alamat Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={this.state.email}
                      onChange={this.handleInput("email")}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nomor Telepon</label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.phone}
                      onChange={this.handleInput("phone")}
                    />
                  </div>
                  <br />
                  <button type="submit" className="btn btn-success btn-block">
                    <i className="fa fa-check-circle" /> Perbarui Profil Saya
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <form onSubmit={this.handleUpdatePassword}>
          <div className="row">
            <div className="col-4" />
            <div className="col-6">
              <div className="card">
                <div className="card-header">
                  <i className="fa fa-user-shield" /> &nbsp;Password
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Password Lama *</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      value={this.state.oldPassword}
                      onChange={this.handleInput("oldPassword")}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password Baru *</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      value={this.state.newPassword}
                      onChange={this.handleInput("newPassword")}
                    />
                  </div>
                  <div className="form-group">
                    <label>Konfirmasi Password Baru *</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      value={this.state.confirmPassword}
                      onChange={this.handleInput("confirmPassword")}
                    />
                  </div>
                  <br />
                  <button type="submit" className="btn btn-block btn-orange">
                    <i className="fa fa-lock" /> Perbarui Password Saya
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </AdminArea>
    );
  }
}

const QUERY = gql`
  query currentUser {
    currentUser {
      _id
      username
      email
      phone
      Role {
        _id
        name
        privileges
      }
      status
      pictureUrl
    }
  }
`;

const UPDATE = gql`
  mutation updateUser(
    $_id: ID!
    $username: String!
    $email: String
    $phone: String
    $pictureUrl: String
  ) {
    updateUser(
      _id: $_id
      username: $username
      email: $email
      phone: $phone
      pictureUrl: $pictureUrl
    )
  }
`;

const UPDATE_PASSWORD = gql`
  mutation updateUserPassword(
    $_id: ID!
    $oldPassword: String!
    $newPassword: String!
  ) {
    updateUserPassword(
      _id: $_id
      oldPassword: $oldPassword
      newPassword: $newPassword
    )
  }
`;

export default protectAdminArea(props => (
  <ApolloConsumer>
    {client => (
      <Mutation mutation={UPDATE}>
        {updateUser => (
          <Mutation mutation={UPDATE_PASSWORD}>
            {updatePassword => (
              <Query query={QUERY}>
                {({ error, loading, data, refetch }) => (
                  <ProfilSayaPage
                    {...props}
                    client={client}
                    error={error}
                    loading={loading}
                    currentUser={
                      data && data.currentUser ? data.currentUser : {}
                    }
                    updateUser={updateUser}
                    updatePassword={updatePassword}
                    refetch={refetch}
                  />
                )}
              </Query>
            )}
          </Mutation>
        )}
      </Mutation>
    )}
  </ApolloConsumer>
));
