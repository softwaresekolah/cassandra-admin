import React, { Component } from "react";
import { handleError } from "../libs/errors";
import { ApolloConsumer, Mutation } from "react-apollo";
import gql from "graphql-tag";
import cookie from "cookie";
import {
  addNotification,
  clearNotifications,
  showLoadingSpinner,
  hideLoadingSpinner
} from "../components/App";
import appConfig from "../app.json";
import redirect from "../libs/redirect";

import Link from "next/link";

class LoginBox extends Component {
  state = {
    username: "",
    password: ""
  };

  handleInput = key => e => {
    this.setState({
      [key]: e.target.value
    });
  };

  handleLogin = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      clearNotifications();
      const result = await this.props.logIn({
        variables: {
          ...this.state
        }
      });
      const { token } = result.data.logIn;
      document.cookie = cookie.serialize("token", token, {
        maxAge: 1 * 24 * 60 * 60 // 1 days
      });
      addNotification({
        message: "Login berhasil, menuju halaman dashboard...",
        level: "success"
      });
      await this.props.client.cache.reset();
      redirect({}, "/dashboard");
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  render() {
    return (
      <div className="col col-login mx-auto">
        <div className="text-center mt-2">
          <img
            src={appConfig.appWelcomeLogo}
            className="img img-fluid"
            style={{ maxWidth: 200 }}
            alt=""
          />
        </div>
        <div className="text-center mb-6 mt-4">
          <h3>{appConfig.appName}</h3>
        </div>
        <form className="card mb-2" onSubmit={this.handleLogin}>
          <div className="card-body pt-6 pl-6 pr-6 pb-5">
            <div className="card-title">Login Menggunakan Akun Anda</div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                value={this.state.username}
                onChange={this.handleInput("username")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Password
                {/* <a
                href="/lupa_password"
                className="float-right small"
              >
                Lupa Password
              </a> */}
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={this.state.password}
                onChange={this.handleInput("password")}
              />
            </div>
            {/* <div className="form-group">
            <label className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
              />
              <span className="custom-control-label">
                Ingat saya di browser ini
              </span>
            </label>
          </div> */}
            <div className="form-footer">
              <button type="submit" className="btn btn-danger btn-block">
                <i className="fa fa-user-shield" /> Login
              </button>
              {/* 
              <br />
              <Link href="/register">
                <a className="btn btn-primary btn-rounded btn-block">
                  <i className="fa fa-user" /> Pendaftaran
                </a>
              </Link> */}
            </div>
          </div>
          <br />
        </form>
        <div className="text-right">Versi Aplikasi {appConfig.appVersion}</div>
        {/* <div className="text-center text-muted">
        Don't have account yet?{" "}
        <a href="./register.html">Sign up</a>
      </div> */}
      </div>
    );
  }
}

const LOGIN = gql`
  mutation logIn($username: String!, $password: String!) {
    logIn(username: $username, password: $password) {
      _id
      User {
        _id
        username
        Role {
          _id
          name
          privileges
        }
        status
      }
      token
      expiresIn
    }
  }
`;

export default props => (
  <ApolloConsumer>
    {client => (
      <Mutation mutation={LOGIN}>
        {logIn => <LoginBox {...props} client={client} logIn={logIn} />}
      </Mutation>
    )}
  </ApolloConsumer>
);
