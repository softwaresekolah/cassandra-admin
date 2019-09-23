import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import { ApolloConsumer } from "react-apollo";
import Link from "next/link";
import Head from "next/head";
import appConfig from "../app.json";

class DashboardPage extends Component {
  render() {
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Dashboard | {appConfig.appName}</title>
        </Head>
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
                  <Link href="/daftar_alumni">
                    <a
                      className="btn btn-success btn-block pt-4"
                      style={{ fontSize: "120%" }}
                    >
                      <i className="fa fa-users" style={{ fontSize: "150%" }} />
                      <br />
                      Daftar Alumni
                    </a>
                  </Link>
                  <Link href="/pengaturan/user">
                    <a
                      className="btn btn-primary btn-block pt-4"
                      style={{ fontSize: "120%" }}
                    >
                      <i className="fa fa-users" style={{ fontSize: "150%" }} />
                      <br />
                      Daftar User
                    </a>
                  </Link>
                  <Link href="/pengaturan/peran">
                    <a
                      className="btn btn-info btn-block pt-4"
                      style={{ fontSize: "120%" }}
                    >
                      <i className="fa fa-star" style={{ fontSize: "150%" }} />
                      <br />
                      Role User
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
                    <i className="fa fa-user-shield" />
                    <br />
                    Administrator Area
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

export default protectAdminArea(props => (
  <ApolloConsumer>
    {client => <DashboardPage {...props} client={client} />}
  </ApolloConsumer>
));
