import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import Head from "next/head";
import appConfig from "../app.json";

class BantuanPage extends Component {
  render() {
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Bantuan | {appConfig.appName}</title>
        </Head>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <i className="fa fa-question-circle" /> &nbsp;Bantuan
              </div>
              <div className="card-body">
                Pertanyaan dan saran dapat disampaikan melalui email ke{" "}
                <a href="mailto:admin@email.com">mailto:admin@email.com</a>
              </div>
            </div>
          </div>
        </div>
      </AdminArea>
    );
  }
}

export default protectAdminArea(BantuanPage);
