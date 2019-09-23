import React, { Component } from "react";
import Head from "next/head";
import Link from "next/link";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import DataTable from "../components/DataTable";
import { withRouter } from "next/router";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import {
  addNotification,
  showLoadingSpinner,
  hideLoadingSpinner
} from "../components/App";
import { handleError } from "../libs/errors";
import appConfig from "../app.json";
// import Dropzone from "react-dropzone";
import dynamic from "next/dynamic";
const Dropzone = dynamic(() => import("react-dropzone"), {
  loading: () => <div />,
  ssr: false
});

class ImporDataAlumniPage extends Component {
  state = {
    results: null,
    errors: []
  };

  onDrop = files => {
    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = async () => {
      showLoadingSpinner();
      try {
        // console.log("reader.result", reader.result);
        let res = await this.props.importAlumniFromExcel({
          variables: {
            excelBase64: reader.result
          }
        });
        // console.log("result", res.data.importAlumniFromExcel);
        const rows = res.data.importAlumniFromExcel.map(row => ({
          ...row,
          data: JSON.parse(row.rawJsonRowData)
        }));
        this.setState({
          results: rows,
          errors: rows.filter(r => r.message.length > 0)
        });
      } catch (err) {
        handleError(err);
      }
      hideLoadingSpinner();
    };
    reader.onerror = error => {
      handleError(error);
    };
  };

  render() {
    const { results, errors } = this.state;
    // console.log(results, errors);

    if (results) {
      return (
        <AdminArea>
          <Head>
            <title>Daftar Data Alumni | {appConfig.appName}</title>
          </Head>

          <div className="row">
            <div className="col-md-12">
              <div className="fa-pull-left">
                <a href="/daftar_alumni">
                  <i className="fa fa-arrow-left" /> Kembali
                </a>
              </div>
              <div className="fa-pull-right">
                <h5>
                  <i className="fa fa-file-excel" /> Impor Data Alumni dari File
                  Excel
                </h5>
              </div>
              <div className="clearfix" />
            </div>

            <div className="col-md-12">
              <div className="card card-success">
                <div className="card-body">
                  {errors.length === 0 ? (
                    <div
                      className="alert alert-success text-center"
                      style={{ padding: 20 }}
                    >
                      <h1>
                        <i className="fa fa-check-circle" />
                      </h1>
                      {results.length} Alumni telah berhasil diimpor ke dalam
                      database.
                    </div>
                  ) : (
                    <div>
                      <Dropzone
                        onDrop={this.onDrop}
                        accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        style={{
                          position: "relative",
                          border: "2px solid red",
                          padding: "30px 20px"
                        }}
                        multiple={false}
                      >
                        <div className="text-center text-danger">
                          <h2>
                            <i className="fa fa-file-excel" />
                          </h2>
                          Letakkan file di sini, atau klik untuk upload
                          perbaikan
                        </div>
                      </Dropzone>
                      <br />
                      <b className="text-danger">
                        Oops! Sepertinya ada error di dalam file impor Anda.
                      </b>
                      <br />
                      Terdapat kesalahan pada {errors.length} data Alumni.
                      <br />
                      <br />
                      {results.map((res, index) => {
                        if (res.message.length === 0) return null;
                        return (
                          <div className="alert alert-danger" key={res._id}>
                            Alumni #{index + 1} &nbsp;&middot;&nbsp;{" "}
                            {res.data["NAMA LENGKAP"]} (NIS. {res.data["NIS"]})
                            &nbsp;&middot;&nbsp;{" "}
                            <b>{res.message.length} error</b>
                            <hr style={{ margin: "10px 0" }} />
                            <ul>
                              {res.message.map(m => (
                                <li key={m}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <hr />
                  <div style={{ marginBottom: 5 }}>
                    <i className="fa fa-info-circle" /> Perhatian! Format file
                    excel untuk impor harus sesuai dengan template yang telah
                    disediakan.
                  </div>
                  <a
                    className="btn btn-info"
                    href="/static/templates/TEMPLATE_IMPOR.xlsx"
                  >
                    <i className="fa fa-arrow-down" /> Download Template Upload
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AdminArea>
      );
    } else {
      return (
        <AdminArea>
          <Head>
            <title>Daftar Data Alumni | {appConfig.appName}</title>
          </Head>

          <div className="row">
            <div className="col-12">
              <div className="fa-pull-left">
                <Link href="/daftar_alumni">
                  <a href="/daftar_alumni">
                    <i className="fa fa-arrow-left" /> Kembali
                  </a>
                </Link>
              </div>
              <div className="fa-pull-right">
                <h5>
                  <i className="fa fa-file-excel" /> Impor Data Alumni dari File
                  Excel
                </h5>
              </div>
              <div className="clearfix" />
            </div>

            <div className="col-12">
              <div className="card card-success">
                <div className="card-body">
                  <Dropzone
                    onDrop={this.onDrop}
                    accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    style={{
                      position: "relative",
                      border: "2px solid black",
                      padding: "40px 20px"
                    }}
                    multiple={false}
                  >
                    <div className="text-center">
                      <h1>
                        <i className="fa fa-file-excel" />
                      </h1>
                      Letakkan file di sini, atau klik untuk upload
                    </div>
                  </Dropzone>
                  <br />
                  <div style={{ marginBottom: 5 }}>
                    <i className="fa fa-info-circle" /> Perhatian! Format file
                    excel untuk impor harus sesuai dengan template yang telah
                    disediakan.
                  </div>
                  <a
                    className="btn btn-info"
                    href="/static/templates/TEMPLATE_IMPOR.xlsx"
                  >
                    <i className="fa fa-arrow-down" /> Download Template Upload
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AdminArea>
      );
    }
  }
}

const IMPORT_FROM_EXCEL = gql`
  mutation importAlumniFromExcel($excelBase64: String!) {
    importAlumniFromExcel(excelBase64: $excelBase64) {
      _id
      status
      message
      rawJsonRowData
    }
  }
`;

export default protectAdminArea(
  withRouter(props => (
    <ApolloConsumer>
      {client => (
        <Mutation mutation={IMPORT_FROM_EXCEL}>
          {importAlumniFromExcel => (
            <ImporDataAlumniPage
              {...props}
              client={client}
              importAlumniFromExcel={importAlumniFromExcel}
            />
          )}
        </Mutation>
      )}
    </ApolloConsumer>
  ))
);
