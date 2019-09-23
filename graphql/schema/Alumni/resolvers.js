const { assertValidSession } = require("../../authentication");
const bcrypt = require("bcryptjs");
const mime = require("mime");
const Excel = require("exceljs");
const fs = require("fs");
const excelHelper = require("../../excel");
const uuidV4 = require("uuid/v4");
const lodash = require("lodash");

const resolvers = {
  Query: {
    allAlumni: async (self, params, context) => {
      assertValidSession(context.activeSession);
      return await context
        .collection("Alumni")
        .find({
          _deletedAt: {
            $exists: false
          }
        })
        .toArray();
    },

    alumniById: async (self, params, context) => {
      assertValidSession(context.activeSession);
      return await context.collection("Alumni").findOne({
        _id: params._id
      });
    }
  },

  Mutation: {
    createAlumni: async (self, params, context) => {
      assertValidSession(context.activeSession);

      let newAlumni = {
        _id: uuidV4(),
        ...params.input,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      };

      const user = await upsertUserForAlumni({
        alumniId: newAlumni._id,
        alumni: newAlumni,
        context
      });
      // console.log({ user });
      newAlumni.userId = user._id;

      await context.collection("Alumni").insertOne(newAlumni);

      return newAlumni;
    },
    registerAlumni: async (self, params, context) => {
      assertValidSession(context.activeSession);

      if (params.input.phoneNumber !== "") {
        const foundSamePhone = await context.collection("Users").findOne({
          phoneNumber: params.input.phoneNumber
        });

        if (foundSamePhone) {
          throw new Error("Phone already exists");
        }
      }
      if (params.input.email !== "") {
        const foundSameEmail = await context.collection("Users").findOne({
          email: params.input.email
        });

        if (foundSameEmail) {
          throw new Error("Email already exists");
        }
      }

      if (params.input.whatsappNumber !== "") {
        const foundSameWA = await context.collection("Users").findOne({
          whatsappNumber: params.input.whatsappNumber
        });

        if (foundSameWA) {
          throw new Error("Whatsapp number already exists");
        }
      }

      let newRegiterAlumni = {
        _id: uuidV4(),
        ...params.input,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      };

      const user = await upsertUserForAlumni({
        alumniId: newRegiterAlumni._id,
        alumni: newRegiterAlumni,
        context
      });
      // console.log({ user });
      newRegiterAlumni.userId = user._id;

      await context.collection("Alumni").insertOne(newRegiterAlumni);

      return newRegiterAlumni;
    },

    updateAlumni: async (self, params, context) => {
      assertValidSession(context.activeSession);

      const user = await upsertUserForAlumni({
        alumniId: params._id,
        alumni: params.input,
        context
      });
      if (user) {
        params.input.userId = user._id;
      }

      await context.collection("Alumni").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            ...params.input,
            _updatedAt: new Date().toISOString()
          }
        }
      );

      return "Success";
    },

    deleteAlumni: async (self, params, context) => {
      assertValidSession(context.activeSession);

      await context.collection("Alumni").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            _deletedAt: new Date().toISOString()
          }
        }
      );
      await deleteUserForAlumni({
        alumniId: params._id,
        context
      });

      return "Success";
    },

    importAlumniFromExcel: async (self, params, context) => {
      assertValidSession(context.activeSession);

      // ==================================================================================
      // ================================================= GRAB THEN SAVE
      const ContentType = base64MimeType(params.excelBase64);
      const filename = `tmp_impor.` + mime.getExtension(ContentType);
      const buf = Buffer.from(params.excelBase64.split("base64,")[1], "base64");
      fs.writeFileSync(__dirname + "/" + filename, buf);

      // ==================================================================================
      // ================================================= LOAD XLSX FILE
      let workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(__dirname + "/" + filename);

      // ==================================================================================
      // ================================================= POPULATE DATA TO AS JSON
      let worksheet = workbook.getWorksheet("DATA_ALUMNI");
      let keys = [];
      let data = [];
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        // console.log("row.values", row.values);
        if (rowNumber === 1) {
          // do nothing
        } else if (rowNumber === 2) {
          keys = row.values;
          // keys = row.values.map((val, index) => {
          //   if (val === keys[index]) {
          //     return val;
          //   } else {
          //     return keys[index] + " " + val;
          //   }
          // });
        } else {
          let newData = {
            // _id: uuidV4()
          };
          keys.forEach((key, index) => {
            if (key) {
              newData[key] = row.values[index] ? row.values[index] : "";
            }
          });
          if (newData["EMAIL"] && newData["EMAIL"].text) {
            newData["EMAIL"] = newData["EMAIL"].text;
          }
          data.push({
            ...populateImportedData(newData),
            rawJsonRowData: JSON.stringify(newData)
          });
          // console.log("Row " + rowNumber, "newData", newData);
        }
      });
      // console.log("keys", keys);
      // console.log("data", data);

      let importFromExcelResults = [];
      let anyError = false;
      let allNewAlumni = [];

      for (let newData of data) {
        let { rawJsonRowData, ...alumni } = newData;
        let errors = [];

        if (!alumni.name) {
          errors.push("Nama lengkap belum diisi.");
        }
        if (!alumni.email) {
          errors.push("Email belum diisi.");
        }
        // if (!alumni.phoneNumber) {
        //   errors.push("Nomor telepon belum diisi.");
        // }

        if (alumni.phoneNumber) {
          alumni.phoneNumber = ("" + alumni.phoneNumber).trim();
          if (!alumni.phoneNumber.startsWith("0")) {
            alumni.phoneNumber = "0" + alumni.phoneNumber;
          }
        }
        if (alumni.whatsappNumber) {
          alumni.whatsappNumber = ("" + alumni.whatsappNumber).trim();
          if (!alumni.whatsappNumber.startsWith("0")) {
            alumni.whatsappNumber = "0" + alumni.whatsappNumber;
          }
        }

        if (alumni.isStrata1 && alumni.isStrata1 === "YA") {
          if (!alumni.entryYearForStrata1) {
            errors.push(
              "Alumni mengikuti pendidikan Strata 1, namun tahun masuk belum diisi."
            );
          } else {
            alumni.entryYearForStrata1 = parseInt(alumni.entryYearForStrata1);
          }
        } else {
          alumni.entryYearForStrata1 = null;
        }
        if (alumni.isStrata2 && alumni.isStrata2 === "YA") {
          if (!alumni.entryYearForStrata2) {
            errors.push(
              "Alumni mengikuti pendidikan Strata 2, namun tahun masuk belum diisi."
            );
          } else {
            alumni.entryYearForStrata2 = parseInt(alumni.entryYearForStrata2);
          }
        } else {
          alumni.entryYearForStrata2 = null;
        }
        if (alumni.isStrata3 && alumni.isStrata3 === "YA") {
          if (!alumni.entryYearForStrata3) {
            errors.push(
              "Alumni mengikuti pendidikan Strata 3, namun tahun masuk belum diisi."
            );
          } else {
            alumni.entryYearForStrata3 = parseInt(alumni.entryYearForStrata3);
          }
        } else {
          alumni.entryYearForStrata3 = null;
        }
        if (alumni.entryYearForJob) {
          alumni.entryYearForJob = parseInt(alumni.entryYearForJob);
        } else {
          alumni.entryYearForJob = null;
        }

        const result = {
          _id: uuidV4(),
          status: errors.length === 0 ? "No error" : `${errors.length} errors`,
          message: errors,
          rawJsonRowData
        };
        importFromExcelResults.push(result);
        // Check if has any error
        anyError = anyError || errors.length > 0;
        //
        allNewAlumni.push(alumni);
        // console.log({ alumni });
      }
      // return [];

      // ====================================================================================
      // =================================================== START INSERTING HERE IF NO ERROR
      if (!anyError) {
        // await context.collection("Alumni").createIndex({ phoneNumber: 1 });
        await context.collection("Alumni").createIndex({ email: 1 });
        for (let alumni of allNewAlumni) {
          const result = await context.collection("Alumni").findOneAndUpdate(
            {
              // phoneNumber: alumni.phoneNumber
              email: alumni.email
            },
            {
              $set: {
                ...alumni,
                _updatedAt: new Date().toISOString()
              },
              $setOnInsert: {
                _id: uuidV4(),
                _createdAt: new Date().toISOString()
              }
            },
            {
              upsert: true,
              returnOriginal: false
            }
          );

          const user = await upsertUserForAlumni({
            alumniId: result.value._id,
            alumni: result.value,
            context
          });
          if (user) {
            await context.collection("Alumni").updateOne(
              {
                _id: result.value._id
              },
              {
                $set: {
                  userId: user._id,
                  _updatedAt: new Date().toISOString()
                }
              }
            );
          }
        }
      }

      return importFromExcelResults;
    },

    searchAlumni: async (self, params, context) => {
      // let query = { $or: [] };
      // if (params.name) {
      //   query.$or.push({
      //     name: { $regex: params.name, $options: "i" }
      //   });
      // }
      // if (params.regNumber) {
      //   query.$or.push({
      //     regNumber: params.regNumber
      //   });
      // }
      // if (params.entryYear) {
      //   query.$or.push({
      //     entryYearForStrata1: params.entryYear
      //   });
      //   query.$or.push({
      //     entryYearForStrata2: params.entryYear
      //   });
      //   query.$or.push({
      //     entryYearForStrata3: params.entryYear
      //   });
      // }
      // if (query.$or.length === 0) {
      //   query = {};
      // }
      // await context.collection("Alumni").createIndex({
      //   name: 1
      // });
      // await context.collection("Alumni").createIndex({
      //   regNumber: 1
      // });
      // await context.collection("Alumni").createIndex({
      //   entryYearForStrata1: 1
      // });
      // await context.collection("Alumni").createIndex({
      //   entryYearForStrata2: 1
      // });
      // await context.collection("Alumni").createIndex({
      //   entryYearForStrata3: 1
      // });

      let filter = params.criteria.reduce((all, c) => {
        if (!c.keyword) {
          // pass
        } else if (c.key === "regNumber") {
          all["regNumber"] = parseInt(c.keyword);
        } else if (c.key === "entryYearForStrata1") {
          all["entryYearForStrata1"] = parseInt(c.keyword);
        } else if (c.key === "entryYearForStrata2") {
          all["entryYearForStrata2"] = parseInt(c.keyword);
        } else if (c.key === "entryYearForStrata3") {
          all["entryYearForStrata3"] = parseInt(c.keyword);
        } else {
          all[c.key] = {
            $regex: c.keyword,
            $options: "i"
          };
        }
        return all;
      }, {});
      const result = await context
        .collection("Alumni")
        .find({
          ...filter
        })
        .toArray();
      return result;
    },
    exportAlumniToExcel: async (self, params, context) => {
      assertValidSession(context.activeSession);
      let filter = params.criteria.reduce((all, c) => {
        if (!c.keyword) {
          // pass
        } else if (c.key === "regNumber") {
          all["regNumber"] = parseInt(c.keyword);
        } else if (c.key === "entryYearForStrata1") {
          all["entryYearForStrata1"] = parseInt(c.keyword);
        } else if (c.key === "entryYearForStrata2") {
          all["entryYearForStrata2"] = parseInt(c.keyword);
        } else if (c.key === "entryYearForStrata3") {
          all["entryYearForStrata3"] = parseInt(c.keyword);
        } else {
          all[c.key] = {
            $regex: c.keyword,
            $options: "i"
          };
        }
        return all;
      }, {});
      let alumni = await context
      .collection("Alumni")
      .find({
        ...filter
      })
      .toArray();
      // ========================================================
      let columnWidths = [];
      let headerRow = [];
      let accessors = [];

      params.criteria.forEach(c => {
        if(c.check){
          headerRow.push(c.label);
          accessors.push(c.dataReference ? c.dataReference : c.key);
          columnWidths.push(30);
        }
      });

      const workbook = new Excel.Workbook();
      workbook.creator = "Alumni Data Unair";
      const sheet = workbook.addWorksheet("Hasil Pencarian Alumni Unair");

      let colCounter = 0;
      columnWidths.forEach(width => {
        const column = ++colCounter
        excelHelper.setColumnWidth({
          sheet,
          column,
          width          
        })
      })
      colCounter = 0;
      let rowCounter = 1;
      headerRow.forEach(data => {
        excelHelper.addText({
          sheet,
          row: rowCounter,
          col: ++colCounter,
          value: data,
          font: {bold: true},
          alignment: {vertical: "middle",horizontal:"center"},
          borderStyle: excelHelper.BorderStyle.Thin
        })
      })
      rowCounter++

      alumni.forEach(e => {
        colCounter = 0;
        accessors.forEach(accessor => {
          const value = lodash.get(e,accessor,"");

          excelHelper.addText({
            sheet,
            row: rowCounter,
            col: ++colCounter,
            value,
            font:{},
            aligment:{
              vertical: "middle",
              horizontal: "center"
            },
            borderStyle: excelHelper.BorderStyle.Thin
          })
        })
        rowCounter++
      })
      await workbook.xlsx.writeFile(__dirname + "/search_result.xlsx");
      const bitmap = fs.readFileSync(__dirname + "/search_result.xlsx");
      const xlsx64 = new Buffer(bitmap).toString("base64");
      return xlsx64;
      //     let query = { $or: [] };
      //     let strata = ["isStrata1","isStrata2","isStrata3"];

      //     if (params.name) {
      //       query.$or.push({
      //         name: { $regex: params.name, $options: "i" }
      //       });
      //     }
      //     if (params.regNumber) {
      //       query.$or.push({
      //         regNumber: params.regNumber
      //       });
      //     }
      //     if (params.entryYear) {
      //       query.$or.push({
      //         entryYearForStrata1: params.entryYear
      //       });
      //       query.$or.push({
      //         entryYearForStrata2: params.entryYear
      //       });
      //       query.$or.push({
      //         entryYearForStrata3: params.entryYear
      //       });
      //     }
      //     if (query.$or.length === 0) {
      //       query = {};
      //     }
      //     await context.collection("Alumni").createIndex({
      //       name: 1
      //     });
      //     await context.collection("Alumni").createIndex({
      //       regNumber: 1
      //     });
      //     await context.collection("Alumni").createIndex({
      //       entryYearForStrata1: 1
      //     });
      //     await context.collection("Alumni").createIndex({
      //       entryYearForStrata2: 1
      //     });
      //     await context.collection("Alumni").createIndex({
      //       entryYearForStrata3: 1
      //     });

      //     const result = await context
      //       .collection("Alumni")
      //       .find(query)
      //       .toArray();

      //     const workbook = new Excel.Workbook();
      //     workbook.creator = "Alumni Data Unair";
      //     const sheet = workbook.addWorksheet("Alumni Data Unair");

      //     let columnWidths = [5, 20, 25, 15, ...strata.map(e => 10), 35, 35, 40];
      //     let headerRow = [
      //       "NO",
      //       "NAMA",
      //       "Email",
      //       "NO TELP",
      //       ...strata.map(e => "TAHUN MASUK"),
      //       "ALAMAT RUMAH",
      //       "ALAMAT KANTOR",
      //       "KOMENTAR"
      //     ];

      //     let rowCounter = 1;
      //     let colCounter = 0;

      //     columnWidths.forEach(width => {
      //       const column = ++colCounter;
      //       excelHelper.setColumnWidth({
      //         sheet,
      //         column,
      //         width
      //       });
      //     });

      //     colCounter = 0;
      //     verticalMerger = [1, 1, 1, 1,...strata.map(e => 0), 1, 1, 1];

      //     headerRow.forEach((data, index) => {
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: data,
      //         font: { bold: true },
      //         alignment: {
      //           vertical: "middle",
      //           horizontal: "center"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });

      //       if (verticalMerger[index] === 1) {
      //         sheet.mergeCells(
      //           rowCounter - 1,
      //           colCounter,
      //           ++rowCounter,
      //           colCounter
      //         );
      //       }

      //       rowCounter = 1;
      //     });
      //     sheet.mergeCells(rowCounter - 1, 5, rowCounter, 8 - 1); // top,left,bottom,right

      //     excelHelper.addText({
      //         sheet,
      //         row: 2,
      //         col: 5,
      //         value: "S1",
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "middle",
      //           horizontal: "center"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: 2,
      //         col: 6,
      //         value: "S2",
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "middle",
      //           horizontal: "center"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: 2,
      //         col: 7,
      //         value: "S3",
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "middle",
      //           horizontal: "center"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });

      //     rowCounter = 3;
      //     let nomor = 0;
      //     colCounter = 0;

      //     for(const res of result) {
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: ++nomor,
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "middle",
      //           horizontal: "center"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.name,
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "left",
      //           horizontal: "left"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.email,
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "left",
      //           horizontal: "left"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.phoneNumber,
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "left",
      //           horizontal: "left"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.entryYearForStrata1 ? res.entryYearForStrata1 : "-",
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "middle",
      //           horizontal: "center"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.entryYearForStrata2 ? res.entryYearForStrata2 : "-",
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "middle",
      //           horizontal: "center"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.entryYearForStrata3 ? res.entryYearForStrata3 : "-",
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "middle",
      //           horizontal: "center"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.address,
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "left",
      //           horizontal: "left"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.officeAddress,
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "left",
      //           horizontal: "left"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       excelHelper.addText({
      //         sheet,
      //         row: rowCounter,
      //         col: ++colCounter,
      //         value: res.comment,
      //         font: { size: 10 },
      //         alignment: {
      //           vertical: "left",
      //           horizontal: "left"
      //         },
      //         borderStyle: excelHelper.BorderStyle.Thin
      //       });
      //       ++rowCounter
      //       colCounter = 0
      //     }

      //     await workbook.xlsx.writeFile(__dirname + "/data_alumni.xlsx");
      //     const bitmap = fs.readFileSync(__dirname + "/data_alumni.xlsx");
      //     const xlsx64 = new Buffer(bitmap).toString("base64");
      //     return xlsx64;
    }
  }
};

exports.resolvers = resolvers;

const upsertUserForAlumni = async ({ alumniId, alumni, context }) => {
  let updateParams = {
    roleId: "DEFAULT_MOBILE_USER_ROLE",
    status: "Aktif",
    phone: "",
    email: "",
    alumniId
  };
  if (alumni.email) {
    updateParams.email = alumni.email;
    updateParams.username = alumni.email;
  } else if (alumni.phone) {
    updateParams.phoneNumber = alumni.phoneNumber;
    updateParams.username = alumni.phoneNumber;
  }

  if (updateParams.username) {
    const defaultPassword = generateRandomString();

    await context.collection("Users").createIndex(
      {
        username: 1
      },
      { unique: true }
    );
    const result = await context.collection("Users").findOneAndUpdate(
      {
        username: updateParams.username
      },
      {
        $set: {
          ...updateParams,
          // passwordUpdatedAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString()
        },
        $setOnInsert: {
          _id: uuidV4(),
          defaultPassword,
          password: bcrypt.hashSync(defaultPassword, 10),
          _createdAt: new Date().toISOString()
        }
      },
      {
        upsert: true,
        returnOriginal: false
      }
    );
    return result.value;
  } else {
    return null;
  }
};

const deleteUserForAlumni = async ({ alumniId, context }) => {
  await context.collection("Users").createIndex({
    alumniId: 1
  });
  const found = await context.collection("Users").findOne({
    alumniId
  });

  if (found) {
    await context.collection("Users").updateOne(
      {
        _id: found._id
      },
      {
        $set: {
          username: found._id,
          formerUsername: found.username,
          status: "Non Aktif",
          _deletedAt: new Date().toISOString()
        }
      }
    );
  }
};

const generateRandomString = () =>
  [...Array(6)].map(i => (~~(Math.random() * 36)).toString(36)).join("");

const base64MimeType = encoded => {
  var result = null;

  if (typeof encoded !== "string") {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
};

const alumniImporKey = {
  NAMA_LENGKAP_DAN_GELAR: "name",
  NIM: "regNumber",
  ALAMAT_EMAIL: "email",
  NOMOR_HP: "phoneNumber",
  NOMOR_WHATSAPP: "whatsappNumber",
  // STRATA_PENDIDIKAN: "Strata 1",
  // ANGKATAN_MASUK: "S1 tahun 1996",
  "STRATA1_FAKULTAS_HUKUM_UNAIR?": "isStrata1",
  TAHUN_MASUK_STRATA1: "entryYearForStrata1",
  "STRATA2_FAKULTAS_HUKUM_UNAIR?": "isStrata2",
  TAHUN_MASUK_STRATA2: "entryYearForStrata2",
  "STRATA3_FAKULTAS_HUKUM_UNAIR?": "isStrata3",
  TAHUN_MASUK_STRATA3: "entryYearForStrata3",
  PEKERJAAN: "job",
  TAHUN_MASUK_KERJA: "entryYearForJob",
  ALAMAT_KANTOR: "officeAddress",
  ALAMAT_RUMAH: "address",
  KOTA_TEMPAT_TINGGAL: "city",
  PROVINSI_TEMPAT_TINGGAL: "province",
  KOMENTAR: "comment"
};

const mapImportedData = (data, keys) => {
  const newData = {};
  Object.keys(keys).forEach(key => {
    const newKey = keys[key];
    if (data[key]) {
      if (typeof data[key] === "object") {
        if (data[key].result) {
          newData[newKey] = data[key].result;
        } else if (data[key].text) {
          newData[newKey] = data[key].text;
        } else {
          newData[newKey] = "";
        }
      } else {
        newData[newKey] = data[key];
      }
    } else {
      newData[newKey] = "";
    }
  });
  return newData;
};

const populateImportedData = data => {
  return { ...mapImportedData(data, alumniImporKey) };
};
