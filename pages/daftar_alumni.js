import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Head from "next/head";
import Link from "next/link";
import { withRouter } from "next/router";
import appConfig from "../app.json";
import DataTable from "../components/DataTable";
import { handleError } from "../libs/errors";
import { FormModal } from "../components/Modal";
import {
  showLoadingSpinner,
  hideLoadingSpinner,
  addNotification
} from "../components/App";

const AlumniForm = ({ formData, handleInput, handleChangeProfileImage }) => (
  <div className="row">
    <div className="col-md-6">
      <div className="form-group">
        <label>Nama Alumni *</label>
        <input
          className="form-control"
          required
          value={formData.name}
          onChange={handleInput("name")}
        />
      </div>
      <div className="form-group">
        <label>Alamat Email *</label>
        <input
          className="form-control"
          required
          value={formData.email}
          onChange={handleInput("email")}
        />
      </div>
      <div className="form-group">
        <label>NIM</label>
        <input
          className="form-control"
          value={formData.regNumber}
          onChange={handleInput("regNumber")}
        />
      </div>
      <div className="form-group">
        <label>Nomor Telepon / HP</label>
        <input
          className="form-control"
          value={formData.phoneNumber}
          onChange={handleInput("phoneNumber")}
        />
      </div>
      <div className="form-group">
        <label>Nomor Whatsapp</label>
        <input
          className="form-control"
          value={formData.whatsappNumber}
          onChange={handleInput("whatsappNumber")}
        />
      </div>
      <div className="form-group">
        <label>Tempat Lahir</label>
        <input
          className="form-control"
          value={formData.birthOfPlace}
          onChange={handleInput("birthOfPlace")}
        />
      </div>
      <div className="form-group">
        <label>Tanggal Lahir</label>
        <input
          type="date"
          className="form-control"
          value={formData.dateOfBirth}
          onChange={handleInput("dateOfBirth")}
        />
      </div>
      <div className="form-group">
        <label>Pekerjaan</label>
        <input
          className="form-control"
          value={formData.job}
          onChange={handleInput("job")}
        />
      </div>
      <div className="form-group">
        <label>Tahun Masuk Kerja</label>
        <input
          className="form-control"
          type="number"
          min="1900"
          disabled={formData.job === "" ? true : false}
          value={formData.entryYearForJob}
          onChange={handleInput("entryYearForJob")}
        />
      </div>
      <div className="form-group">
        <label>Foto Alumni</label>
        <br />
        <input
          style={{ margin: 0, padding: 0, fontSize: 12 }}
          className=""
          type="file"
          name="attachedImage"
          accept="image/*"
          onChange={handleChangeProfileImage}
        />
        <img
          src={formData.profileImageUrl}
          className="img img-responsive img-fluid img-thumbnail"
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
              value={formData.isStrata1}
              onChange={handleInput("isStrata1")}
            >
              <option value="YA">Ya</option>
              <option value="">Tidak</option>
            </select>
          </div>
          <div className="form-group">
            <label>Menempuh Strata 2?</label>
            <select
              className="form-control"
              value={formData.isStrata2}
              onChange={handleInput("isStrata2")}
            >
              <option value="YA">Ya</option>
              <option value="">Tidak</option>
            </select>
          </div>
          <div className="form-group">
            <label>Menempuh Strata 3?</label>
            <select
              className="form-control"
              value={formData.isStrata3}
              onChange={handleInput("isStrata3")}
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
              disabled={formData.isStrata1 !== "YA"}
              required={!!formData.isStrata1}
              type="number"
              min="1900"
              value={
                formData.isStrata1 === "YA" &&
                formData.entryYearForStrata1 !== null
                  ? formData.entryYearForStrata1
                  : ""
              }
              // value={formData.entryYearForStrata1}
              onChange={handleInput("entryYearForStrata1")}
            />
          </div>
          <div className="form-group">
            <label>Tahun Masuk S2</label>
            <input
              className="form-control"
              type="number"
              disabled={formData.isStrata2 !== "YA"}
              required={!!formData.isStrata2}
              min="1900"
              value={
                formData.isStrata2 === "YA" &&
                formData.entryYearForStrata2 !== null
                  ? formData.entryYearForStrata2
                  : ""
              }
              // value={formData.entryYearForStrata2}
              onChange={handleInput("entryYearForStrata2")}
            />
          </div>
          <div className="form-group">
            <label>Tahun Masuk S3</label>
            <input
              className="form-control"
              disabled={formData.isStrata3 !== "YA"}
              required={!!formData.isStrata3}
              type="number"
              min="1900"
              value={
                formData.isStrata3 === "YA" &&
                formData.entryYearForStrata3 !== null
                  ? formData.entryYearForStrata3
                  : ""
              }
              // value={formData.entryYearForStrata3}
              onChange={handleInput("entryYearForStrata3")}
            />
          </div>
        </div>
      </div>

      <hr className="my-2" />
      
      <div className="form-group">
        <label>Skor TOEFL </label>
        <input
          className="form-control"
          value={formData.toefl}
          onChange={handleInput("toefl")}
        />
      </div>
      <div className="form-group">
        <label>Alamat Kantor </label>
        <input
          className="form-control"
          value={formData.officeAddress}
          onChange={handleInput("officeAddress")}
        />
      </div>
      <div className="form-group">
        <label>Alamat Rumah Tinggal</label>
        <input
          className="form-control"
          value={formData.address}
          onChange={handleInput("address")}
        />
      </div>
      <div className="form-group">
        <label>Kota Tempat Tinggal</label>
        <input
          className="form-control"
          value={formData.city}
          onChange={handleInput("city")}
        />
      </div>
      <div className="form-group">
        <label>Provinsi Tempat Tinggal</label>
        <input
          className="form-control"
          value={formData.province}
          onChange={handleInput("province")}
        />
      </div>
      <div className="form-group">
        <label>Komentar</label>
        <textarea
          className="form-control"
          value={formData.comment}
          onChange={handleInput("comment")}
        />
      </div>
    </div>
  </div>
);

class AlumniList extends Component {
  state = {
    alumni: {
      name: "",
      email: "",
      phoneNumber: "",
      whatsappNumber: "",
      birthOfPlace:"",
      dateOfBirth:"",
      toefl:0,

      isStrata1: "",
      entryYearForStrata1: new Date().getFullYear(),
      isStrata2: "",
      entryYearForStrata2: new Date().getFullYear(),
      isStrata3: "",
      entryYearForStrata3: new Date().getFullYear(),

      officeAddress: "",
      address: "",
      comment: "",

      regNumber: "",
      job: "",
      entryYearForJob: new Date().getFullYear(),
      province: "",
      city: "",
      profileImageUrl: ""
    },

    alumniAddFormVisible: false,
    alumniEditFormVisible: false
  };

  columns = [
    {
      Header: "Foto",
      accessor: "profileImageUrl",
      filterable: false,
      Cell: props =>
        props.value ? (
          <img
            src="img img-fluid"
            style={{ width: 70, height: "auto" }}
            src={props.value}
          />
        ) : null,
      maxWidth: 80
    },
    {
      Header: "Nama",
      accessor: "name",
      style: { whiteSpace: "unset" }
    },
    {
      Header: "Email",
      accessor: "email",
      style: { whiteSpace: "unset" }
    },
    {
      Header: "No. Telp",
      accessor: "phoneNumber",
      maxWidth: 110,
      style: { whiteSpace: "unset" },
      Cell: props => {
        let numbers = [];
        if (props.original.phoneNumber) {
          numbers.push(props.original.phoneNumber);
        }
        if (props.original.whatsappNumber) {
          numbers.push(`WA: ${props.original.whatsappNumber}`);
        }
        return numbers.join(", ");
      }
    },
    {
      Header: "Strata Pendidikan",
      id: "entryYearForStrata1",
      accessor: e => {
        let educations = [];
        if (e.isStrata1 && e.isStrata1 === "YA") {
          educations.push(`S1 Tahun Masuk ${e.entryYearForStrata1}`);
        }
        if (e.isStrata2 && e.isStrata2 === "YA") {
          educations.push(`S2 Tahun Masuk ${e.entryYearForStrata2}`);
        }
        if (e.isStrata3 && e.isStrata3 === "YA") {
          educations.push(`S3 Tahun Masuk ${e.entryYearForStrata3}`);
        }
        return educations.join(", ");
      },
      style: { whiteSpace: "unset" },
      Cell: props => {
        let educations = [];
        if (props.original.isStrata1 && props.original.isStrata1 === "YA") {
          educations.push(
            `S1 Tahun Masuk ${props.original.entryYearForStrata1}`
          );
        }
        if (props.original.isStrata2 && props.original.isStrata2 === "YA") {
          educations.push(
            `S2 Tahun Masuk ${props.original.entryYearForStrata2}`
          );
        }
        if (props.original.isStrata3 && props.original.isStrata3 === "YA") {
          educations.push(
            `S3 Tahun Masuk ${props.original.entryYearForStrata3}`
          );
        }
        return educations.join(", ");
      }
    },
    // {
    //   Header: "Tahun Masuk",
    //   accessor: ""
    // },
    {
      Header: "Alamat Rumah",
      accessor: "address"
    },
    {
      Header: "Alamat Kantor",
      accessor: "officeAddress"
    },
    {
      Header: "Komentar",
      accessor: "comment",
      style: { whiteSpace: "unset" }
    }
    // {
    //   Header: "Timestamp",
    //   accessor: "_createdAt"
    // }
  ];

  componentDidMount = () => {
    if (this.props.router.query && this.props.router.query.alumniId) {
      showLoadingSpinner();
      setTimeout(() => {
        const selectedAlumni = this.props.allAlumni.find(
          alumni => alumni._id === this.props.router.query.alumniId
        );
        if (selectedAlumni) {
          this.openEditAlumni({
            row: selectedAlumni,
            key: this.props.router.query.alumniId
          });
        } else {
          handleError({
            message: `Alumni tidak ditemukan!`
          });
        }
        hideLoadingSpinner();
      }, 1000);
    }
  };

  componentWillReceiveProps = nextProps => {
    if (
      nextProps.router.query &&
      nextProps.router.query.alumniId &&
      nextProps.allAlumni.length > 0 &&
      !this.state.alumniEditFormVisible
    ) {
      showLoadingSpinner();
      setTimeout(() => {
        const selectedAlumni = nextProps.allAlumni.find(
          alumni => alumni._id === nextProps.router.query.alumniId
        );
        if (selectedAlumni) {
          this.openEditAlumni({
            row: selectedAlumni,
            key: nextProps.router.query.alumniId
          });
        } else {
          handleError({
            message: `Alumni tidak ditemukan!`
          });
        }
        hideLoadingSpinner();
      }, 1000);
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
    }else if(key === "toefl"){
      this.setState({
        alumni: {
          ...this.state.alumni,
          toefl: parseInt(e.target.value.replace(/\D/g, ""))
        }
      });
    } else if (key === "whatsappNumber") {
      this.setState({
        alumni: {
          ...this.state.alumni,
          whatsappNumber: e.target.value.replace(/\D/g, "")
        }
      });
    } else if (key === "entryYearForJob") {
      this.setState({
        alumni: {
          ...this.state.alumni,
          entryYearForJob: parseInt(e.target.value)
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

  handleChangeProfileImage = e => {
    const file = e.target.files[0];
    if (file.size > 512 * 1024) {
      return handleError({
        message: "Maximum allowed image size is 512KB!"
      });
    }
    let reader = new FileReader();
    reader.onloadend = async () => {
      this.setState({
        alumni: {
          ...this.state.alumni,
          profileImageUrl: reader.result
        }
      });
    };
    reader.readAsDataURL(file);
  };

  openAddAlumni = e => {
    this.setState({
      alumniAddFormVisible: true,
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
        comment: "",
        regNumber: "",
        job: "",
        entryYearForJob: new Date().getFullYear(),
        province: "",
        city: "",
        profileImageUrl: ""
      }
    });
  };

  openEditAlumni = ({ row, key }) => {
    this.setState({
      alumniEditFormVisible: true,
      alumni: {
        ...row
      }
    });
  };

  closeEditAlumni = e => {
    this.setState({
      alumniEditFormVisible: false
    });
    this.props.router.replace({
      pathname: this.props.router.pathname,
      query: {
        alumniId: null
      }
    });
  };

  closeAddAlumni = e => {
    this.setState({
      alumniAddFormVisible: false
    });
  };

  render() {
    return (
      <AdminArea>
        <Head>
          <title>Daftar Alumni | {appConfig.appName}</title>
        </Head>

        <FormModal
          title={
            <span>
              <i className="fa fa-plus-circle" /> Tambah Alumni
            </span>
          }
          size="lg"
          visible={this.state.alumniAddFormVisible}
          onClose={this.closeAddAlumni}
          onSubmit={this.handleAddAlumni}
        >
          <AlumniForm
            formData={this.state.alumni}
            handleInput={this.handleInput}
            handleChangeProfileImage={this.handleChangeProfileImage}
          />
        </FormModal>

        <FormModal
          title={
            <span>
              <i className="fa fa-edit" /> Edit Alumni
            </span>
          }
          size="lg"
          visible={this.state.alumniEditFormVisible}
          onClose={this.closeEditAlumni}
          onSubmit={this.handleEditAlumni}
        >
          <AlumniForm
            formData={this.state.alumni}
            handleInput={this.handleInput}
            handleChangeProfileImage={this.handleChangeProfileImage}
          />
        </FormModal>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <DataTable
                  title={
                    <span>
                      <i className="fa fa-address-book" /> &nbsp;Daftar Alumni
                    </span>
                  }
                  withoutCard
                  loading={this.props.loading}
                  columns={this.columns}
                  data={this.props.allAlumni}
                  onAddData={this.openAddAlumni}
                  onEditData={this.openEditAlumni}
                  onDeleteData={this.handleDeleteAlumni}
                />
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5>
                  <i className="fa fa-cogs" /> Utilitas
                </h5>
                <Link href="/impor_excel_data_alumni">
                  <a className="btn btn-success">
                    <i className="fa fa-download" /> Impor Data Alumni Dari File
                    Excel
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AdminArea>
    );
  }

  handleAddAlumni = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      await this.props.createAlumni({
        variables: {
          ...this.state.alumni
        }
      });

      await this.props.refetch();
      addNotification({
        message: `Alumni berhasil ditambahkan`,
        level: "success"
      });

      this.closeAddAlumni();
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  handleEditAlumni = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();
    try {
      await this.props.updateAlumni({
        variables: {
          _id: this.state.alumni._id,
          ...this.state.alumni
        }
      });

      await this.props.refetch();
      addNotification({
        message: `Alumni berhasil diubah`,
        level: "success"
      });

      this.closeEditAlumni();
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  handleDeleteAlumni = async ({ rows, keys }) => {
    showLoadingSpinner();
    try {
      if (confirm(`Apakah Anda yakin untuk menghapus ${keys.length} Alumni?`)) {
        showLoadingSpinner();
        for (const _id of keys) {
          await this.props.deleteAlumni({
            variables: {
              _id
            }
          });
        }
        await this.props.refetch();
        addNotification({
          message: `Alumni berhasil dihapus`,
          level: "success"
        });
      }
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };
}

const QUERY = gql`
  query listAlumni {
    allAlumni {
      _id
      name
      email
      phoneNumber
      whatsappNumber

      isStrata1
      entryYearForStrata1
      isStrata2
      entryYearForStrata2
      isStrata3
      entryYearForStrata3

      officeAddress
      address
      comment

      regNumber
      job
      entryYearForJob
      province
      city
      profileImageUrl

      _createdAt
      _updatedAt
    }
  }
`;

const CREATE_ALUMNI = gql`
  mutation createAlumni(
    $name: String!
    $email: String!
    $phoneNumber: String
    $whatsappNumber: String
    $birthOfPlace: String
    $dateOfBirth: String
    $toefl: Int
    $isStrata1: String
    $entryYearForStrata1: Int
    $isStrata2: String
    $entryYearForStrata2: Int
    $isStrata3: String
    $entryYearForStrata3: Int
    $officeAddress: String
    $address: String
    $comment: String
    $regNumber: String
    $job: String
    $entryYearForJob: Int
    $province: String
    $city: String
    $profileImageUrl: String
  ) {
    createAlumni(
      input: {
        name: $name
        email: $email
        phoneNumber: $phoneNumber
        whatsappNumber: $whatsappNumber
        birthOfPlace: $birthOfPlace
        dateOfBirth: $dateOfBirth
        toefl: $toefl
        isStrata1: $isStrata1
        entryYearForStrata1: $entryYearForStrata1
        isStrata2: $isStrata2
        entryYearForStrata2: $entryYearForStrata2
        isStrata3: $isStrata3
        entryYearForStrata3: $entryYearForStrata3
        officeAddress: $officeAddress
        address: $address
        comment: $comment
        regNumber: $regNumber
        job: $job
        entryYearForJob: $entryYearForJob
        province: $province
        city: $city
        profileImageUrl: $profileImageUrl
      }
    ) {
      _id
    }
  }
`;

const UPDATE_ALUMNI = gql`
  mutation updateAlumni(
    $_id: ID!
    $name: String
    $email: String
    $phoneNumber: String
    $whatsappNumber: String
    $birthOfPlace: String
    $dateOfBirth: String
    $toefl: Int
    $isStrata1: String
    $entryYearForStrata1: Int
    $isStrata2: String
    $entryYearForStrata2: Int
    $isStrata3: String
    $entryYearForStrata3: Int
    $officeAddress: String
    $address: String
    $comment: String
    $regNumber: String
    $job: String
    $entryYearForJob: Int
    $province: String
    $city: String
    $profileImageUrl: String
  ) {
    updateAlumni(
      _id: $_id
      input: {
        name: $name
        email: $email
        phoneNumber: $phoneNumber
        whatsappNumber: $whatsappNumber
        birthOfPlace: $birthOfPlace
        dateOfBirth: $dateOfBirth
        toefl: $toefl
        isStrata1: $isStrata1
        entryYearForStrata1: $entryYearForStrata1
        isStrata2: $isStrata2
        entryYearForStrata2: $entryYearForStrata2
        isStrata3: $isStrata3
        entryYearForStrata3: $entryYearForStrata3
        officeAddress: $officeAddress
        address: $address
        comment: $comment
        regNumber: $regNumber
        job: $job
        entryYearForJob: $entryYearForJob
        province: $province
        city: $city
        profileImageUrl: $profileImageUrl
      }
    )
  }
`;

const DELETE_ALUMNI = gql`
  mutation deleteAlumni($_id: ID!) {
    deleteAlumni(_id: $_id)
  }
`;

export default protectAdminArea(
  withRouter(props => (
    <ApolloConsumer>
      {client => (
        <Mutation mutation={DELETE_ALUMNI}>
          {deleteAlumni => (
            <Mutation mutation={UPDATE_ALUMNI}>
              {updateAlumni => (
                <Mutation mutation={CREATE_ALUMNI}>
                  {createAlumni => (
                    <Query query={QUERY}>
                      {({ error, loading, data, refetch }) => (
                        <AlumniList
                          {...props}
                          client={client}
                          error={error}
                          loading={loading}
                          allAlumni={
                            data && data.allAlumni ? data.allAlumni : []
                          }
                          refetch={refetch}
                          createAlumni={createAlumni}
                          updateAlumni={updateAlumni}
                          deleteAlumni={deleteAlumni}
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
  ))
);
