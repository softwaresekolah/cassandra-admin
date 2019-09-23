const PDFMake = require("pdfmake");
const { existsSync, mkdirSync, writeFileSync } = require("fs");
const { Roboto, Inconsolata } = require("./assets/pdfFonts");
// console.log(Roboto, Inconsolata);
const printer = new PDFMake({
  Roboto,
  Inconsolata
});

const createPdf = ({ docDefinition, prefix, filename }) => {
  if (!docDefinition) {
    throw new Error("Undefined docDefinition!");
  }
  if (!filename) {
    throw new Error("Undefined filename!");
  }

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    if (!existsSync("./static/cache/")) {
      mkdirSync("./static/cache");
    }
    let outputDir = "./static/cache";

    if (prefix) {
      outputDir = outputDir + "/" + prefix;
    }
    if (prefix && !existsSync(outputDir)) {
      mkdirSync(outputDir);
    }
    const filePath = `${outputDir}/${filename}`;
    // pdfDoc.pipe(createWriteStream(filePath));
    pdfDoc.end();

    let buffers = [];
    pdfDoc.on("data", buffers.push.bind(buffers));
    pdfDoc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      writeFileSync(filePath, pdfData);

      const urlPath = filePath.substring(1);
      resolve(urlPath);
    });
  });
};

exports.createPdf = createPdf;

const hrLine = width => ({
  canvas: [
    {
      type: "line",
      x1: 20,
      y1: 5,
      x2: width - 20,
      y2: 5,
      lineWidth: 0.7
    }
  ]
});
exports.hrLine = hrLine;

const logoInHeader = key =>
  existsSync(`./static/cache/${key}.png`)
    ? {
        image: `./static/cache/${key}.png`,
        width: 65,
        absolutePosition: { x: 20, y: 5 }
      }
    : null;
exports.logoInHeader = logoInHeader;

const renderLogoBase64 = logoUrl =>
  logoUrl
    ? {
        image: logoUrl,
        width: 65,
        maxHeight: 61,
        absolutePosition: { x: 20, y: 10 }
      }
    : null;
exports.renderLogoBase64 = renderLogoBase64;

exports.renderFooter = () => (currentPage, pageCount) => ({
  // text: "Hal " + currentPage.toString() + " dari " + pageCount,
  text: "Halaman " + currentPage.toString(),
  fontSize: 11,
  alignment: "center"
});

exports.renderHeader = companyInformation => (
  currentPage,
  pageCount,
  pageSize
) => {
  let nama = "NAMA SEKOLAH";
  let alamat = "Alamat";
  let telepon = "-";
  let website = "-";
  let email = "-";
  let logUrl = null;

  if (companyInformation) {
    nama = companyInformation.name;
    alamat = companyInformation.address;
    telepon = companyInformation.phone ? companyInformation.phone : "-";
    website = companyInformation.website ? companyInformation.website : "-";
    email = companyInformation.email ? companyInformation.email : "-";
    logoUrl = companyInformation.logoUrl ? companyInformation.logoUrl : null;
  }

  const alamatLines = alamat.split("\n");
  if (alamatLines.length >= 2) {
    return [
      {
        text: nama,
        bold: true,
        fontSize: 13,
        alignment: "center",
        margin: [0, 10, 0, 0]
      },
      { text: alamat, bold: true, fontSize: 10, alignment: "center" },
      { text: `Telepon: ${telepon}`, fontSize: 10, alignment: "center" },
      // {
      //   text: `Website: ${website}. Email: ${email}`,
      //   fontSize: 11,
      //   alignment: "center"
      // },
      hrLine(pageSize.width),
      renderLogoBase64(logoUrl)
    ];
  } else {
    return [
      {
        text: nama,
        bold: true,
        fontSize: 14,
        alignment: "center",
        margin: [0, 10, 0, 0]
      },
      { text: alamat, bold: true, fontSize: 12, alignment: "center" },
      { text: `Telepon: ${telepon}`, fontSize: 12, alignment: "center" },
      {
        text: `Website: ${website}. Email: ${email}`,
        fontSize: 11,
        alignment: "center"
      },
      hrLine(pageSize.width),
      // logoInHeader("logo_sekolah_dummy"),
      renderLogoBase64(logoUrl)
    ];
  }
};

exports.renderHeaderForReceipt = (
  informasiSekolah,
  informasiYayasan,
  label
) => (currentPage, pageCount, pageSize) => {
  let nama = "NAMA SEKOLAH";
  let alamat = "Alamat";
  let telepon = "-";
  let website = "-";
  let email = "-";
  let logUrl = null;

  if (informasiSekolah) {
    nama = informasiSekolah.nama;
    alamat = informasiSekolah.alamat;
    telepon = informasiSekolah.telepon ? informasiSekolah.telepon : "-";
    website = informasiSekolah.website ? informasiSekolah.website : "-";
    email = informasiSekolah.email ? informasiSekolah.email : "-";
    logoUrl = informasiSekolah.logoUrl ? informasiSekolah.logoUrl : null;
  } else if (informasiYayasan) {
    nama = informasiYayasan.nama;
    alamat = informasiYayasan.alamat;
    telepon = informasiYayasan.telepon ? informasiYayasan.telepon : "-";
    website = informasiYayasan.website ? informasiYayasan.website : "-";
    email = informasiYayasan.email ? informasiYayasan.email : "-";
    logoUrl = informasiYayasan.logoUrl ? informasiYayasan.logoUrl : null;
  }

  return [
    {
      text: nama,
      bold: true,
      fontSize: 14,
      // alignment: "center",
      margin: [20, 10, 0, 0]
    },
    {
      text: alamat,
      bold: true,
      fontSize: 12,
      //  alignment: "center",
      margin: [20, 0, 0, 0]
    },
    {
      text: `Telepon: ${telepon}`,
      fontSize: 12,
      //  alignment: "center"
      margin: [20, 0, 0, 0]
    },
    {
      text: `Website: ${website}. Email: ${email}`,
      fontSize: 11,
      // alignment: "center"
      margin: [20, 0, 0, 0]
    },
    hrLine(pageSize.width),
    // logoInHeader("logo_sekolah_dummy"),
    // renderLogoBase64(logoUrl)
    label
      ? {
          absolutePosition: { x: 450, y: 14 },
          table: {
            widths: [115],
            body: [[{ text: "" + label, alignment: "center" }]]
          }
        }
      : {}
  ];
};

exports.defaultPageMargins = [20, 80, 20, 30];

exports.defaultTableLayout = {
  hLineWidth: function(i, node) {
    return 1;
    return i === 0 || i === node.table.body.length ? 2 : 1;
  },
  vLineWidth: function(i, node) {
    return 1;
    return i === 0 || i === node.table.widths.length ? 2 : 1;
  },
  hLineColor: function(i, node) {
    return i === 0 || i === node.table.body.length ? "black" : "gray";
  },
  vLineColor: function(i, node) {
    return i === 0 || i === node.table.widths.length ? "black" : "gray";
  },
  paddingLeft: function(i, node) {
    return 2;
  },
  paddingRight: function(i, node) {
    return 2;
  },
  paddingTop: function(i, node) {
    return 1;
  },
  paddingBottom: function(i, node) {
    return 1;
  }
  // fillColor: function (rowIndex, node, columnIndex) { return null; }
};

exports.noBorderTableLayout = {
  hLineWidth: function(i, node) {
    return 0;
  },
  vLineWidth: function(i, node) {
    return 0;
  },
  hLineColor: function(i, node) {
    return "white";
  },
  vLineColor: function(i, node) {
    return "white";
  },
  paddingLeft: function(i, node) {
    return 0;
  },
  paddingRight: function(i, node) {
    return 0;
  },
  paddingTop: function(i, node) {
    return 0;
  },
  paddingBottom: function(i, node) {
    return 0;
  }
  // fillColor: function (rowIndex, node, columnIndex) { return null; }
};

exports.composeHeaderRow = (row, style) =>
  row.map(cell => ({
    text: cell,
    ...style
  }));
