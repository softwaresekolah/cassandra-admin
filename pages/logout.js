import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import Head from "next/head";
import appConfig from "../app.json";
import cookie from "cookie";

class LogOutPage extends Component {
  componentDidMount = () => {
    setTimeout(() => {
      document.cookie = cookie.serialize("token", "", {
        maxAge: -1 // Expire the cookie immediately
      });
      window.location = "/";
    }, 800);
  };

  render() {
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Log Out | {appConfig.appName}</title>
        </Head>
        <div className="row">
          <div className="col-12">
            <div className="card">
              {/* <div className="card-header">
                <i className="fa fa-question-circle" /> &nbsp;Bantuan
              </div> */}
              <div className="card-body text-center">
                <i className="fa fa-info-circle" style={{ fontSize: "200%" }} />
                <h3>Anda Berhasil Log Out</h3>
              </div>
            </div>
          </div>
        </div>
      </AdminArea>
    );
  }
}

export default protectAdminArea(LogOutPage);
