import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import Head from "next/head";
import appConfig from "../app.json";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";
import Router, { withRouter } from "next/router";
import { handleError } from "../libs/errors";
import { FormModal } from "../components/Modal";
import {
  showLoadingSpinner,
  hideLoadingSpinner,
  addNotification
} from "../components/App";
import RichTextEditor from "../components/RichTextEditor";
import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2
} from "react-html-parser";
import { format } from "date-fns";

const ActivityForm = ({ formData, handleInput }) => (
  <div>
    <div className="form-group">
      <label>Nama Aktivitas *</label>
      <input
        type="text"
        className="form-control"
        value={formData.name}
        onChange={handleInput("name")}
        required
      />
    </div>
    <div className="form-group">
      <label>Tanggal *</label>
      <input
        type="date"
        className="form-control"
        value={formData.date}
        onChange={handleInput("date")}
        required
      />
    </div>
    <div className="form-group">
      <label>Gambar Cover *</label>
      <input
        type="file"
        className="form-control-file"
        onChange={handleInput("imageUrl")}
      />
      <img
        src={formData.imageUrl}
        className="img img-responsive img-fluid img-thumbnail"
      />
    </div>
    <div className="form-group">
      <label>Deskripsi *</label>
      <RichTextEditor
        value={formData.description}
        onChange={handleInput("description")}
      />
    </div>
  </div>
);

class Aktivitas extends Component {
  redirectDetail = id => e => {
    Router.replace({
      pathname: "/dokumentasi",
      query: {
        activityId: id
      }
    });
  };

  state = {
    activity: {
      name: "",
      description: "",
      date: "",
      imageUrl: ""
    },
    activityAddVisible: false,
    activityUpdateVisible: false
  };

  openAddActivity = e => {
    this.setState({
      activityAddVisible: !this.state.activityAddVisible,
      activity: {
        name: "",
        description: "",
        date: format(new Date(), "YYYY-MM-DD"),
        imageUrl: ""
      }
    });
  };
  closeAddActivity = e => {
    this.setState({
      activityAddVisible: !this.state.activityAddVisible
    });
  };

  openUpdateActivity = activity => e => {
    this.setState({
      activity: {
        ...activity
      },
      activityUpdateVisible: !this.state.activityUpdateVisible
    });
  };

  closeUpdateActivity = e => {
    this.setState({
      activityUpdateVisible: !this.state.activityUpdateVisible
    });
  };

  handleInput = key => e => {
    if (key === "imageUrl") {
      const files = e.target ? e.target.files : e;
      if (files[0].size < 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result;
          this.setState({
            activity: {
              ...this.state.activity,
              imageUrl: base64
            }
          });
        };
        reader.readAsDataURL(files[0]);
      } else {
        handleError({
          message: "Cover image size must not exceed 1 MB"
        });
      }
    } else if (key === "description") {
      this.setState({
        activity: {
          ...this.state.activity,
          [key]: e
        }
      });
    } else {
      this.setState({
        activity: {
          ...this.state.activity,
          [key]: e.target.value
        }
      });
    }
  };
  render() {
    const activities = this.props.allActivities;
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Aktivitas | {appConfig.appName}</title>
        </Head>
        <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> Tambah Aktivitas
            </span>
          }
          size="lg"
          visible={this.state.activityAddVisible}
          onClose={this.closeAddActivity}
          onSubmit={this.handleAddActivity}
        >
          <ActivityForm
            formData={this.state.activity}
            handleInput={this.handleInput}
          />
        </FormModal>
        <FormModal
          title={
            <span>
              <i className="fa fa-plus-edit" /> Update Aktivitas
            </span>
          }
          size="md"
          visible={this.state.activityUpdateVisible}
          onClose={this.closeUpdateActivity}
          onSubmit={this.handleUpdateActivity}
        >
          <ActivityForm
            formData={this.state.activity}
            handleInput={this.handleInput}
          />
        </FormModal>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-8">
              <h3 style={{ color: "#777" }}>
                <i className="fa fa-image" /> Total ada {activities.length}{" "}
                aktivitas
              </h3>
            </div>
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-success float-right"
                onClick={this.openAddActivity}
              >
                <i className="fa fa-plus-circle" /> &nbsp;Tambah Aktivitas
              </button>
            </div>
          </div>
          <br />
          <div className="row">
            {activities.length ? (
              activities.map(activity => (
                <div className="col-md-4 mb-5" key={activity._id}>
                  <div className="card h-100">
                    <img src={activity.imageUrl} className="img-fluid" />
                    <div className="card-body">
                      <h3>{activity.name}</h3>
                      <div className="desc-activity">
                        {activity.description
                          ? 
                          activity.description.length < 150 ? ReactHtmlParser(
                            activity.description
                          ) :
                          ReactHtmlParser(
                              activity.description.substr(0, 150).concat(`...`)
                            )
                          : "Tidak ada deskripsi"}
                      </div>
                      <b>
                        Terdapat{" "}
                        {activity.ActivityDocumentation &&
                        activity.ActivityDocumentation.thumbnails
                          ? activity.ActivityDocumentation.thumbnails.length
                          : 0}{" "}
                        Dokumentasi
                      </b>
                    </div>
                    <div
                      className="card-footer text-center"
                      style={{ padding: "0.5rem" }}
                    >
                      <div className="row">
                        <div className="col">
                          <button
                            onClick={this.handleDeleteActivity(activity._id)}
                            className="btn btn-danger mr-2 mb-2"
                          >
                            <i className="fa fa-trash" />{" "}
                            <span className="d-none d-sm-block">Hapus</span>
                          </button>
                          <button
                            onClick={this.openUpdateActivity(activity)}
                            className="btn btn-warning mr-2 mb-2"
                          >
                            <i className="fa fa-edit" />{" "}
                            <span className="d-none d-sm-block">Update</span>
                          </button>
                          <button
                            onClick={this.redirectDetail(activity._id)}
                            className="btn btn-info mb-2 mr-2"
                          >
                            <i className="fa fa-search-plus" />{" "}
                            <span className="d-none d-sm-block">Detail</span>
                          </button>
                        </div>
                      </div>
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
                  Tidak ada Aktivitas
                </h3>
              </div>
            )}
          </div>
        </div>
      </AdminArea>
    );
  }

  handleAddActivity = async e => {
    if (e) e.preventDefault();

    showLoadingSpinner();

    try {
      await this.props.createActivity({
        variables: {
          ...this.state.activity
        }
      });

      await this.props.refetch();
      addNotification({
        message: `Aktivitas berhasil ditambahkan`,
        level: "success"
      });

      this.closeAddActivity();
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };
  handleUpdateActivity = async e => {
    e.preventDefault();
    showLoadingSpinner();

    try {
      await this.props.updateActivity({
        variables: {
          _id: this.state.activity._id,
          ...this.state.activity
        }
      });
      await this.props.refetch();
      addNotification({
        message: `Aktivitas berhasil diupdate`,
        level: "success"
      });
      // this.closeUpdateActivity();
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };
  handleDeleteActivity = _id => async e => {
    if (e) e.preventDefault();

    showLoadingSpinner();

    try {
      await this.props.deleteActivity({
        variables: {
          _id: _id
        }
      });
      await this.props.refetch();
      addNotification({
        message: `Aktivitas berhasil dihapus`,
        level: "success"
      });
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };
}

const ALL_ACTIVITY = gql`
  query allActivities {
    allActivities {
      _id
      name
      description
      imageUrl
      date
      activityDocumentationIds
      ActivityDocumentation {
        thumbnails
      }
      _createdAt
    }
  }
`;

const CREATE_ACTIVITY = gql`
  mutation createActivity(
    $name: String!
    $description: String!
    $date: String!
    $imageUrl: String!
  ) {
    createActivity(
      input: {
        name: $name
        description: $description
        date: $date
        imageUrl: $imageUrl
      }
    )
  }
`;

const UPDATE_ACTIVITY = gql`
  mutation updateActivity(
    $_id: ID!
    $name: String
    $description: String
    $imageUrl: String
    $date: String
  ) {
    updateActivity(
      _id: $_id
      input: {
        name: $name
        description: $description
        imageUrl: $imageUrl
        date: $date
      }
    )
  }
`;

const DELETE_ACTIVITY = gql`
  mutation deleteActivity($_id: ID!) {
    deleteActivity(_id: $_id)
  }
`;

export default protectAdminArea(
  withRouter(props => (
    <ApolloConsumer>
      {client => (
        <Mutation mutation={DELETE_ACTIVITY}>
          {deleteActivity => (
            <Mutation mutation={UPDATE_ACTIVITY}>
              {updateActivity => (
                <Mutation mutation={CREATE_ACTIVITY}>
                  {createActivity => (
                    <Query query={ALL_ACTIVITY}>
                      {({ error, loading, data, refetch }) => (
                        <Aktivitas
                          {...props}
                          client={client}
                          error={error}
                          loading={loading}
                          allActivities={
                            data && data.allActivities ? data.allActivities : []
                          }
                          createActivity={createActivity}
                          updateActivity={updateActivity}
                          deleteActivity={deleteActivity}
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
  Aktivitas
);
