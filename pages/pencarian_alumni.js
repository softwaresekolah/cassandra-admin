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
import { base64toBlob } from "../libs/base64.js";
import FileSaver from "file-saver";
import {
  showLoadingSpinner,
  hideLoadingSpinner,
  addNotification
} from "../components/App";

const PROFILE_IMAGE = {
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
};

const InputGroup = ({
  label,
  onChangeCheckbox,
  valueInput,
  onChangeInput,
  valueCheckbox
}) => (
  <div style={{ paddingTop: 8 }}>
    <label className="small">{label}</label>
    <div className="input-group input-group-sm">
      <div className="input-group-prepend">
        <div className="input-group-text">
          &nbsp;&nbsp;&nbsp;
          <input
            className="form-check-input"
            type="checkbox"
            checked={valueCheckbox}
            onChange={onChangeCheckbox}
            style={{ marginLeft: 0 }}
          />
        </div>
      </div>
      <input
        type="text"
        className="form-control"
        onChange={onChangeInput}
        value={valueInput}
      />
    </div>
  </div>
);
const AlumniForm = ({ formData, handleInput }) => (
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
          required
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
        <label>Foto Alumni</label>
        <br />
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

class PencarianAlumniPage extends Component {
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
      comment: "",

      regNumber: "",
      job: "",
      entryYearForJob: new Date().getFullYear(),
      province: "",
      city: "",
      profileImageUrl: ""
    },

    alumniAddFormVisible: false,
    alumniEditFormVisible: false,
    keyword: {
      name: "",
      regNumber: "",
      entryYear: ""
    },
    foundAlumni: [],
    columns: [],
    searchCriteria: {
      name: {
        keyword: "",
        check: true,
        label: "Nama Alumni"
      },
      regNumber: {
        keyword: "",
        check: true,
        label: "NIM Alumni"
      },
      officeAddress: {
        keyword: "",
        check: true,
        label: "Alamat Kantor"
      },
      entryYearForStrata1: {
        keyword: "",
        check: true,
        label: "Tahun Masuk S1"
      },
      entryYearForStrata2: {
        keyword: "",
        check: true,
        label: "Tahun Masuk S2"
      },
      entryYearForStrata3: {
        keyword: "",
        check: true,
        label: "Tahun Masuk S3"
      }
    },
    searchResults: []
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
      accessor: "_id",
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
        comment: ""
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

  handleInputKeyword = key => e => {
    this.setState({
      keyword: {
        ...this.state.keyword,
        [key]: e.target.value
      }
    });
  };

  handleChangeCheckbox = key => e => {
    this.setState({
      searchCriteria: {
        ...this.state.searchCriteria,
        [key]: {
          ...this.state.searchCriteria[key],
          check: e.target.checked
        }
      }
    });
  };

  handleChangeInput = key => e => {
    this.setState({
      searchCriteria: {
        ...this.state.searchCriteria,
        [key]: {
          ...this.state.searchCriteria[key],
          keyword: e.target.value,
          check: !!e.target.value
        }
      }
    });
  };

  handleSearch = async e => {
    showLoadingSpinner();
    try {
      let criteria = [];
      let columns = [PROFILE_IMAGE];
      const { searchCriteria } = this.state;
      for (const key in searchCriteria) {
        if (searchCriteria[key].check) {
          criteria.push({
            key,
            ...searchCriteria[key]
          });
          columns.push({
            Header: searchCriteria[key].label,
            accessor: searchCriteria[key].dataReference
              ? searchCriteria[key].dataReference
              : key
          });
        }
      }
      console.log(criteria);
      if (criteria.length === 0) {
        throw {
          message: "Anda belum memilih kriteria pencarian"
        };
      }
      const res = await this.props.searchAlumni({
        variables: {
          criteria
        }
      });

      this.setState({
        searchResults: res.data.searchAlumni,
        columns
      });
      window.location.href = this.props.router.pathname + "#result";
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
    // showLoadingSpinner();
    // try {
    //   let { keyword } = this.state;
    //   if (!keyword.name) {
    //     delete keyword.name;
    //   }
    //   if (!keyword.regNumber) {
    //     delete keyword.regNumber;
    //   }
    //   if (!keyword.entryYear) {
    //     delete keyword.entryYear;
    //   } else {
    //     keyword.entryYear = parseInt(keyword.entryYear);
    //   }
    //   const result = await this.props.searchAlumni({
    //     variables: {
    //       ...keyword
    //     }
    //   });
    //   const foundAlumni = result.data.searchAlumni;
    //   this.setState({
    //     foundAlumni
    //   });
    // } catch (err) {
    //   handleError(err);
    // }
    // hideLoadingSpinner();
  };

  handleEksporExcel = async e => {
    if (e) e.preventDefault();
    showLoadingSpinner();

    try {
      const { searchCriteria } = this.state;
      let criteria = [];

      for (const key in searchCriteria) {
        if (searchCriteria[key].check) {
          criteria.push({ key, ...searchCriteria[key] });
        }
      }
      const res = await this.props.exportAlumniToExcel({
        variables:{
          criteria
        }
      })
      const blob = base64toBlob(
        res.data.exportAlumniToExcel,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      FileSaver.saveAs(blob, `data_alumni.xlsx`);
    } catch (err) {
      handleError(err);
    }
    hideLoadingSpinner();
  };

  render() {
    const { searchCriteria } = this.state;    
    return (
      <AdminArea>
        <Head>
          <title>Pencarian Alumni | {appConfig.appName}</title>
        </Head>

        <FormModal
          title={
            <span>
              <i className="fa fa-search" /> Data Alumni
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
          />
        </FormModal>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div>
                  <i className="fa fa-search" /> &nbsp;Cari Alumni
                  <hr className="my-3" />
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <InputGroup
                      label={searchCriteria.name.label}
                      valueInput={searchCriteria.name.keyword}
                      valueCheckbox={searchCriteria.name.check}
                      onChangeCheckbox={this.handleChangeCheckbox("name")}
                      onChangeInput={this.handleChangeInput("name")}
                    />
                    <InputGroup
                      label={searchCriteria.entryYearForStrata1.label}
                      valueInput={searchCriteria.entryYearForStrata1.keyword}
                      valueCheckbox={searchCriteria.entryYearForStrata1.check}
                      onChangeCheckbox={this.handleChangeCheckbox(
                        "entryYearForStrata1"
                      )}
                      onChangeInput={this.handleChangeInput(
                        "entryYearForStrata1"
                      )}
                    />
                  </div>
                  <div className="col-md-4">
                    <InputGroup
                      label={searchCriteria.regNumber.label}
                      valueInput={searchCriteria.regNumber.keyword}
                      valueCheckbox={searchCriteria.regNumber.check}
                      onChangeCheckbox={this.handleChangeCheckbox("regNumber")}
                      onChangeInput={this.handleChangeInput("regNumber")}
                    />
                    <InputGroup
                      label={searchCriteria.entryYearForStrata2.label}
                      valueInput={searchCriteria.entryYearForStrata2.keyword}
                      valueCheckbox={searchCriteria.entryYearForStrata2.check}
                      onChangeCheckbox={this.handleChangeCheckbox(
                        "entryYearForStrata2"
                      )}
                      onChangeInput={this.handleChangeInput(
                        "entryYearForStrata2"
                      )}
                    />
                  </div>
                  <div className="col-md-4">
                    <InputGroup
                      label={searchCriteria.officeAddress.label}
                      valueInput={searchCriteria.officeAddress.keyword}
                      valueCheckbox={searchCriteria.officeAddress.check}
                      onChangeCheckbox={this.handleChangeCheckbox(
                        "officeAddress"
                      )}
                      onChangeInput={this.handleChangeInput("officeAddress")}
                    />
                    <InputGroup
                      label={searchCriteria.entryYearForStrata3.label}
                      valueInput={searchCriteria.entryYearForStrata3.keyword}
                      valueCheckbox={searchCriteria.entryYearForStrata3.check}
                      onChangeCheckbox={this.handleChangeCheckbox(
                        "entryYearForStrata3"
                      )}
                      onChangeInput={this.handleChangeInput(
                        "entryYearForStrata3"
                      )}
                    />
                  </div>
                </div>
                <br />
                <div className="row">
                  <div className="col-12">
                    <button
                      onClick={this.handleSearch}
                      className="btn btn-success btn-block"
                    >
                      <i className="fa fa-search" /> Mulai Pencarian
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {this.state.searchResults.length === 0 ? (
            <div className="col-12">
              <div className="text-center">
                <i className="fa fa-exclamation-circle" /> Tidak Ada Hasil
                Pencarian
              </div>
            </div>
          ) : (
            <div className="col-12">
              <div className="row">
                <div className="col-12">
                  <button
                    onClick={this.handleEksporExcel}
                    style={{ backgroundColor: "#27ae60", color: "#fff" }}
                    className="btn float-right"
                  >
                    <i className="fa fa-file-excel" /> Ekspor Excel
                  </button>
                </div>
              </div>
              <br />
              <div className="card">
                <div className="card-body">
                  <DataTable
                    title={
                      <span>
                        <i className="fa fa-address-book" /> &nbsp;Hasil
                        Pencarian Sebanyak {this.state.searchResults.length}{" "}
                        Alumni
                      </span>
                    }
                    withoutCard
                    loading={false}
                    columns={this.state.columns}
                    data={this.state.searchResults}
                    onEditData={this.openEditAlumni}
                    editButtonLabel="Lihat"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminArea>
    );
  }
}

const EKSPOR_EXCEL = gql`
  mutation exportAlumniToExcel($criteria: [SearchAlumniCriteria]) {
    exportAlumniToExcel(criteria: $criteria)
  }
`;
const SEARCH_ALUMNI = gql`
  mutation searchAlumni($criteria: [SearchAlumniCriteria]) {
    searchAlumni(criteria: $criteria) {
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
    }
  }
`;

export default protectAdminArea(
  withRouter(props => (
    <ApolloConsumer>
      {client => (
        <Mutation mutation={EKSPOR_EXCEL}>
          {exportAlumniToExcel => (
            <Mutation mutation={SEARCH_ALUMNI}>
              {searchAlumni => (
                <PencarianAlumniPage
                  {...props}
                  client={client}
                  searchAlumni={searchAlumni}
                  exportAlumniToExcel={exportAlumniToExcel}
                />
              )}
            </Mutation>
          )}
        </Mutation>
      )}
    </ApolloConsumer>
  ))
);
