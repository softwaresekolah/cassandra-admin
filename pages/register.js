import React, { Component } from "react";
import Head from "next/head";
import appConfig from "../app.json";
import App, { addNotification } from "../components/App";
import redirect from "../libs/redirect";
import checkLoggedIn from "../libs/checkLoggedIn";
import { ApolloConsumer, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";
import { handleError } from "../libs/errors";
import Router from "next/router";
import { setTimeout } from "timers";

class RegisterAlumniPage extends Component {
  static async getInitialProps(context) {
    const { loggedInUser } = await checkLoggedIn(context.apolloClient);
    // console.log({
    //   currentUser: loggedInUser.currentUser,
    //   undefined: typeof loggedInUser.currentUser === "undefined",
    //   null: loggedInUser.currentUser === null
    // });
    if (loggedInUser.currentUser) {
      redirect(context, "/dashboard");
    } else if (typeof loggedInUser.currentUser === "undefined") {
      return { errorCode: 500 };
    }
    return {};
  }

  state = {
    alumni: {
      name: "",
      email: "",
      phoneNumber: "",
      whatsappNumber: "",

      isStrata1: "",
      entryYearForStrata1: new Date().getFullYear(),
      isStrata2: "",
      entryYearForStrata2: new Date().getFullYear(),
      isStrata3: "",
      entryYearForStrata3: new Date().getFullYear(),

      officeAddress: "",
      address: "",
      comment: ""
    }
  };

  handleInput = key => e => {
    if (key === "entryYearForStrata1") {
      this.setState({
        alumni: {
          ...this.state.alumni,
          entryYearForStrata1: parseInt(e.target.value)
        }
      });
    } else if (key === "entryYearForStrata2") {
      this.setState({
        alumni: {
          ...this.state.alumni,
          entryYearForStrata2: parseInt(e.target.value)
        }
      });
    } else if (key === "entryYearForStrata3") {
      this.setState({
        alumni: {
          ...this.state.alumni,
          entryYearForStrata3: parseInt(e.target.value)
        }
      });
    } else if (key === "phoneNumber") {
      this.setState({
        alumni: {
          ...this.state.alumni,
          phoneNumber: e.target.value.replace(/\D/g, "")
        }
      });
    } else if (key === "whatsappNumber") {
      this.setState({
        alumni: {
          ...this.state.alumni,
          whatsappNumber: e.target.value.replace(/\D/g, "")
        }
      });
    } else {
      this.setState({
        alumni: {
          ...this.state.alumni,
          [key]: e.target.value
        }
      });
    }
  };

  render() {
    const { alumni } = this.state;
    return (
      <App>
        <Head>
          <title>Registrasi Alumni | {appConfig.appName}</title>
        </Head>
        <div className="container">
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
              <h3>{appConfig.appRegisterPage}</h3>
            </div>
          </div>

          <form onSubmit={this.handleRegister}>
            <section
              className="card"
              style={{ borderColor: "red", padding: 10 }}
            >
              <div className="card-block">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Nama Alumni *</label>
                      <input
                        className="form-control"
                        required
                        value={alumni.name}
                        onChange={this.handleInput("name")}
                      />
                    </div>
                    <div className="form-group">
                      <label>Alamat Email *</label>
                      <input
                        className="form-control"
                        required
                        type="email"
                        value={alumni.email}
                        onChange={this.handleInput("email")}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nomor Telepon / HP</label>
                      <input
                        className="form-control"
                        value={alumni.phoneNumber}
                        onChange={this.handleInput("phoneNumber")}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nomor Whatsapp</label>
                      <input
                        className="form-control"
                        value={alumni.whatsappNumber}
                        onChange={this.handleInput("whatsappNumber")}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h5>Pendidikan di Fakultas Hukum Unair</h5>
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Menempuh Strata 1?</label>
                          <select
                            className="form-control"
                            value={alumni.isStrata1}
                            onChange={this.handleInput("isStrata1")}
                          >
                            <option value="YA">Ya</option>
                            <option value="">Tidak</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Menempuh Strata 2?</label>
                          <select
                            className="form-control"
                            value={alumni.isStrata2}
                            onChange={this.handleInput("isStrata2")}
                          >
                            <option value="YA">Ya</option>
                            <option value="">Tidak</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Menempuh Strata 3?</label>
                          <select
                            className="form-control"
                            value={alumni.isStrata3}
                            onChange={this.handleInput("isStrata3")}
                          >
                            <option value="YA">Ya</option>
                            <option value="">Tidak</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Tahun Masuk S1</label>
                          <input
                            className="form-control"
                            disabled={alumni.isStrata1 !== "YA"}
                            required={!!alumni.isStrata1}
                            type="number"
                            min="1900"
                            value={
                              alumni.isStrata1 === "YA" &&
                              alumni.entryYearForStrata1 !== null
                                ? alumni.entryYearForStrata1
                                : ""
                            }
                            value={alumni.entryYearForStrata1}
                            onChange={this.handleInput("entryYearForStrata1")}
                          />
                        </div>
                        <div className="form-group">
                          <label>Tahun Masuk S2</label>
                          <input
                            className="form-control"
                            type="number"
                            disabled={alumni.isStrata2 !== "YA"}
                            required={!!alumni.isStrata2}
                            min="1900"
                            value={
                              alumni.isStrata2 === "YA" &&
                              alumni.entryYearForStrata2 !== null
                                ? alumni.entryYearForStrata2
                                : ""
                            }
                            value={alumni.entryYearForStrata2}
                            onChange={this.handleInput("entryYearForStrata2")}
                          />
                        </div>
                        <div className="form-group">
                          <label>Tahun Masuk S3</label>
                          <input
                            className="form-control"
                            disabled={alumni.isStrata3 !== "YA"}
                            required={!!alumni.isStrata3}
                            type="number"
                            min="1900"
                            value={
                              alumni.isStrata3 === "YA" &&
                              alumni.entryYearForStrata3 !== null
                                ? alumni.entryYearForStrata3
                                : ""
                            }
                            value={alumni.entryYearForStrata3}
                            onChange={this.handleInput("entryYearForStrata3")}
                          />
                        </div>
                      </div>
                    </div>

                    <hr className="my-2" />

                    <div className="form-group">
                      <label>Alamat Kantor </label>
                      <input
                        className="form-control"
                        value={alumni.officeAddress}
                        onChange={this.handleInput("officeAddress")}
                      />
                    </div>
                    <div className="form-group">
                      <label>Alamat Rumah</label>
                      <input
                        className="form-control"
                        value={alumni.address}
                        onChange={this.handleInput("address")}
                      />
                    </div>
                    <div className="form-group">
                      <label>Komentar</label>
                      <textarea
                        className="form-control"
                        value={alumni.comment}
                        onChange={this.handleInput("comment")}
                      />
                    </div>
                  </div>
                </div>
                <br />

                <div className="text-right float-right">
                  <Link href="/index">
                    <a>
                      <button className="btn btn-success btn-md">
                        <i className="fa fa-arrow-left" /> Kembali
                      </button>
                    </a>
                  </Link>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <button className="btn btn-primary btn-md" type="submit">
                    <i className="fa fa-user-plus" /> Registrasi
                  </button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </App>
    );
  }

  handleRegister = async e => {
    if (e) e.preventDefault();
    try {
      await this.props.registerAlumni({
        variables: {
          ...this.state.alumni
        }
      });
      addNotification({
        message: "Registrasi berhasil dilakukan",
        level: "success"
      });

      Router.replace({
        pathname: "/index"
      })
    } catch (err) {
      handleError(err);
    }
  };
}

const REGISTER = gql`
  mutation registerAlumni(
    $name: String!
    $email: String!
    $phoneNumber: String
    $whatsappNumber: String
    $isStrata1: String
    $entryYearForStrata1: Int
    $isStrata2: String
    $entryYearForStrata2: Int
    $isStrata3: String
    $entryYearForStrata3: Int
    $officeAddress: String
    $address: String
    $comment: String
  ) {
    registerAlumni(
      input: {
        name: $name
        email: $email
        phoneNumber: $phoneNumber
        whatsappNumber: $whatsappNumber
        isStrata1: $isStrata1
        entryYearForStrata1: $entryYearForStrata1
        isStrata2: $isStrata2
        entryYearForStrata2: $entryYearForStrata2
        isStrata3: $isStrata3
        entryYearForStrata3: $entryYearForStrata3
        officeAddress: $officeAddress
        address: $address
        comment: $comment
      }
    ) {
      _id
    }
  }
`;

export default props => (
  <ApolloConsumer>
    {client => (
      <Mutation mutation={REGISTER}>
        {registerAlumni => (
          <RegisterAlumniPage
            {...props}
            client={client}
            registerAlumni={registerAlumni}
          />
        )}
      </Mutation>
    )}
  </ApolloConsumer>
);
