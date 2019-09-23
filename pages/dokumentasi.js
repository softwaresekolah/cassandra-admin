import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import Head from "next/head";
import appConfig from "../app.json";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";
import { Route, withRouter } from "next/router";
import DataTable from "../components/DataTable";
import { handleError } from "../libs/errors";
import { FormModal } from "../components/Modal";
import {
  showLoadingSpinner,
  hideLoadingSpinner,
  addNotification
} from "../components/App";
import uuidV4 from "uuid/v4";

let num = 0;
const DocumentationForm = ({
  formData,
  handleInput,
  counter,
  thumbnails,
  handleAddImage
}) => (
  <div className="row">
    <div className="col">
      <span style={{ display: "none" }}>{(num = 0)}</span>
      {thumbnails.map(thumbnail => (
        <div className="form-group" key={thumbnail}>
          <label>Gambar {++num}</label>
          <img
            src={thumbnail}
            className="img img-responsive img-fluid img-thumbnail"
          />
        </div>
      ))}
      {counter < 5 ? (
        <div className="form-group">
          <label>Tambah Gambar</label>
          <input
            type="file"
            name="attachedImage"
            accept="image/*"
            className="form-control-file"
            onChange={handleInput("thumbnail")}
          />
          <img
            src={""}
            className="img img-responsive img-fluid img-thumbnail"
          />
        </div>
      ) : (
        ""
      )}
    </div>
  </div>
);

class Dokumentasi extends Component {
  state = {
    thumbnails: [],
    visible: "",
    documentation: {
      thumbnail1: "",
      thumbnail2: "",
      thumbnail3: "",
      thumbnail4: "",
      thumbnail5: ""
    },
    counter: 0,
    documentationAddVisible: false,
    documentationUpdateVisible: false
  };
  componentDidMount() {
    this.setState({
      thumbnails:
        this.props.allDocumentation && this.props.allDocumentation.thumbnails
          ? this.props.allDocumentation.thumbnails
          : [],
      counter: this.props.allDocumentation.thumbnails
        ? this.props.allDocumentation.thumbnails.length
        : 0
    });
  }
  openAddDocumentation = e => {
    this.setState({
      documentationAddVisible: !this.state.documentationAddVisible,
      thumbnails: this.props.allDocumentation
        ? this.props.allDocumentation.thumbnails
        : []
    });
  };
  closeAddDocumentation = e => {
    this.setState({
      documentationAddVisible: !this.state.documentationAddVisible,
      counter: this.props.allDocumentation.thumbnails
        ? this.props.allDocumentation.thumbnails.length
        : 0
    });
  };

  openUpdateDocumentation = documentation => e => {
    this.setState({
      documentationUpdateVisible: !this.state.documentationUpdateVisible,
      documentation: {
        ...documentation
      }
    });
  };

  closeUpdateDocumentation = e => {
    this.setState({
      documentationUpdateVisible: !this.state.documentationUpdateVisible
    });
  };
  // handleAddImage = e => {
  //   e.preventDefault();
  //   this.setState({
  //     thumbnails: [...this.state.thumbnails, this.state.counter + "foo"],
  //     counter: this.state.counter + 1
  //   });
  // };
  handleInput = (key, thumbnail) => e => {
    const files = e.target ? e.target.files : e;
    if (files[0].size < 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        let prevThumbnail = this.state.thumbnails;
        if (prevThumbnail.find(e => e === base64)) {
          handleError({
            message: "Gambar sudah dipilih!"
          });
        } else {
          this.setState({
            thumbnails: [...this.state.thumbnails, base64],
            counter: this.state.counter + 1
          });
        }
      };
      reader.readAsDataURL(files[0]);
    } else {
      handleError({
        message: "Documentation image size must not exceed 1 MB"
      });
    }
  };
  redirectActivity = e => {
    this.props.router.replace({
      pathname: "/aktivitas"
    });
  };
  render() {
    const allDocumentation = this.props.allDocumentation;
    const documentation = allDocumentation.thumbnails
      ? allDocumentation.thumbnails
      : [];
    const borderBottom = [
      "bg-dark",
      "bg-secondary",
      "bg-success",
      "bg-info",
      "bg-primary"
    ];
    let counter = 0;
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Dokumentasi | {appConfig.appName}</title>
        </Head>
        <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> Tambah Dokumentasi
            </span>
          }
          size="md"
          visible={this.state.documentationAddVisible}
          onClose={this.closeAddDocumentation}
          onSubmit={this.handleAddDocumentation}
        >
          <DocumentationForm
            formData={this.state.documentation}
            handleInput={this.handleInput}
            counter={this.state.counter}
            thumbnails={this.state.thumbnails}
            handleAddImage={this.handleAddImage}
            visible={this.state.visible}
            // handleChangeProfileImage={this.handleChangeProfileImage}
          />
        </FormModal>
        <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> Update Dokumentasi
            </span>
          }
          size="md"
          visible={this.state.documentationUpdateVisible}
          onClose={this.closeUpdateDocumentation}
          onSubmit={this.handleUpdateDocumentation}
        >
          <DocumentationForm
            formData={this.state.documentation}
            handleInput={this.handleInput}
            handleChangeProfileImage={this.handleChangeProfileImage}
            counter={this.state.counter}
            thumbnails={this.state.thumbnails}
            handleAddImage={this.handleAddImage}
            visible={this.state.visible}
          />
        </FormModal>
        <div className="row mb-5">
          <div className="col-8">
            <i className="fa fa-backward" />{" "}
            <Link href="/aktivitas">
              <h4 style={{ display: "inline-block", cursor: "pointer" }}>
                Kembali
              </h4>
            </Link>
          </div>
          <div className="col-4">
            {this.state.counter < 5 ? (
              <button
                onClick={this.openAddDocumentation}
                className="btn btn-success float-right"
              >
                <i className="fa fa-camera-retro" /> Tambah Dokumentasi
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="row">
          <span style={{ display: "none" }}>{num}</span>
          {documentation.length ? (
            documentation.map(thumbnail => (
              <div className="col-md-4 mb-3" key={num++}>
                <div className="card">
                  <div className={"card-status-bottom "+borderBottom[counter % borderBottom.length]} />
                  <img
                    src={thumbnail}
                    className="img-fluid"
                    style={{ height: "40vh", objectFit: "cover" }}
                  />
                  <div className="card-footer text-right text-muted">
                    <button
                      onClick={this.handleDeleteDocumentation(
                        allDocumentation._id,
                        thumbnail
                      )}
                      className="btn btn-danger mr-2"
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col text-center" style={{ margin: "5em" }}>
              <span style={{ color: "#00000066", fontSize: "150px" }}>
                {"(^_^)"}
              </span>
              <h3 style={{ color: "#00000066" }} className="display-5">
                Tidak ada Dokumentasi
              </h3>
            </div>
          )}
          {/* {
            documentation.thumbnails ? 
            documentation.thumbnails.length > 0 ? (
            documentation.thumbnails.map(thumbnail => (
              <div className="col-md-4">
                <div className="card h-100">
                  <img src={thumbnail.thumbnail} className="img-fluid" />
                  <div className="card-footer text-right text-muted">
                    <button
                      onClick={this.handleDeleteDocumentation(
                        documentation._id,
                        thumbnail._id
                      )}
                      className="btn btn-danger mr-2"
                    >
                      <i className="fa fa-trash" />
                    </button>
                    <button
                      onClick={this.openUpdateDocumentation(thumbnails)}
                      className="btn btn-info"
                    >
                      <i className="fa fa-edit" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col text-center" style={{ margin: "5em" }}>
              <span style={{ color: "#00000066", fontSize: "150px" }}>
                {"(^_^)"}
              </span>
              <h3 style={{ color: "#00000066" }} className="display-5">
                Tidak ada Dokumentasi
              </h3>
            </div>
          )
        
        : ""} */}
        </div>
      </AdminArea>
    );
  }
  handleAddDocumentation = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();

    try {
      await this.props.createDocumentation({
        variables: {
          thumbnails: this.state.thumbnails,
          activityGroupId: this.props.router.query.activityId
        }
      });

      await this.props.refetch();
      addNotification({
        message: `Dokumentasi berhasil ditambahkan`,
        level: "success"
      });

      this.closeAddDocumentation();
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };
  handleUpdateDocumentation = async e => {
    if (e) e.preventDefault();

    showLoadingSpinner();

    try {
      await this.props.updateDocumentation({
        variables: {
          _id: this.state.documentation._id,
          ...this.state.documentation
        }
      });

      await this.props.refetch();
      addNotification({
        message: `Dokumentasi berhasil diupdate`,
        level: "success"
      });

      this.closeUpdateDocumentation();
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };
  handleDeleteDocumentation = (_id, thumbnail) => async e => {
    if (e) e.preventDefault();

    showLoadingSpinner();
    try {
      await this.props.deleteDocumentation({
        variables: {
          _id: _id,
          thumbnail: thumbnail
        }
      });
      await this.props.refetch();
      this.setState({
        thumbnails: this.props.allDocumentation.thumbnails
          ? this.props.allDocumentation.thumbnails
          : []
      });
      addNotification({
        message: `Dokumentasi berhasil dihapus`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };
}

const ALL_DOCUMENTATION = gql`
  query allActivityDocumentation($_id: ID!) {
    allActivityDocumentation(_id: $_id) {
      _id
      thumbnails
    }
  }
`;

const CREATE_DOCUMENTATION = gql`
  mutation createActivityDocumentation(
    $activityGroupId: ID!
    $thumbnails: [String]
  ) {
    createActivityDocumentation(
      activityGroupId: $activityGroupId
      input: { thumbnails: $thumbnails }
    )
  }
`;

const UPDATE_DOCUMENTATION = gql`
  mutation updateActivityDocumentation($_id: ID!) {
    updateActivityDocumentation(
      _id: $_id
      input: {
        name: $name
        description: $description
        date: $date
        imageUrl: $imageUrl
      }
    )
  }
`;

const DELETE_DOCUMENTATION = gql`
  mutation deleteActivityDocumentation($_id: ID!, $thumbnail: String!) {
    deleteActivityDocumentation(_id: $_id, thumbnail: $thumbnail)
  }
`;

export default protectAdminArea(
  withRouter(props => (
    <ApolloConsumer>
      {client => (
        <Mutation mutation={DELETE_DOCUMENTATION}>
          {deleteDocumentation => (
            <Mutation mutation={UPDATE_DOCUMENTATION}>
              {updateDocumentation => (
                <Mutation mutation={CREATE_DOCUMENTATION}>
                  {createDocumentation => (
                    <Query
                      query={ALL_DOCUMENTATION}
                      variables={{
                        _id:
                          props.router && props.router.query
                            ? props.router.query.activityId
                            : ""
                      }}
                    >
                      {({ error, loading, data, refetch }) => (
                        <Dokumentasi
                          {...props}
                          client={client}
                          error={error}
                          loading={loading}
                          allDocumentation={
                            data && data.allActivityDocumentation
                              ? data.allActivityDocumentation
                              : []
                          }
                          createDocumentation={createDocumentation}
                          updateDocumentation={updateDocumentation}
                          deleteDocumentation={deleteDocumentation}
                          refetch={refetch}
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
  )),
  Dokumentasi
);
