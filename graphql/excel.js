const addText = ({
  row,
  col,
  value,
  alignment,
  font,
  sheet,
  borderStyle,
  fill,
  numFmt = null
}) => {
  // console.log(row, col, value, alignment, font, sheet);
  sheet.getRow(row).getCell(col).value = value ? value : "";
  sheet.getRow(row).getCell(col).alignment = alignment
    ? alignment
    : {
        vertical: "middle",
        horizontal: "left"
      };
  sheet.getRow(row).getCell(col).font = font ? font : {};
  if (fill) {
    sheet.getRow(row).getCell(col).fill = fill;
  }
  if (numFmt) {
    sheet.getRow(row).getCell(col).numFmt = numFmt;
  }
  sheet.getRow(row).getCell(col).border = borderStyle ? borderStyle : {};
};
exports.addText = addText;

const setColumnWidth = ({ column, width, sheet }) => {
  sheet.getColumn(column).width = width;
};
exports.setColumnWidth = setColumnWidth;

exports.BorderStyle = {
  Thin: {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" }
  },
  Double: {
    top: { style: "double" },
    left: { style: "double" },
    bottom: { style: "double" },
    right: { style: "double" }
  }
};
