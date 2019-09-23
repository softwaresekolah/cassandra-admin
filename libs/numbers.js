// import replace from "lodash/replace";
const replace = require("lodash/replace");

const decodeNum = (num, index) => {
  switch (num) {
    case 1:
      // if (index == 0)
      //   return 'se';
      // else
      return "satu ";
    case 2:
      return "dua ";
    case 3:
      return "tiga ";
    case 4:
      return "empat ";
    case 5:
      return "lima ";
    case 6:
      return "enam ";
    case 7:
      return "tujuh ";
    case 8:
      return "delapan ";
    case 9:
      return "sembilan ";
    default:
      return "";
  }
};

const tLevel = ["ratus", "ribu", "puluh"];

const decodeUnderThousand = nominal => {
  let stack = [];

  let num = nominal;
  let div = 1000;
  for (let digit = 3; digit > 0; digit--) {
    nominal = nominal % div;
    div /= 10;
    num = parseInt(nominal / div);

    if (num > 0)
      stack.push({
        num: num,
        say: tLevel[digit % 3]
      });
  }

  let terbilang = "";
  stack.forEach((item, index) => {
    if (item.num > 0) {
      if (index < stack.length - 1)
        terbilang += decodeNum(item.num, index) + item.say + " ";
      else {
        if (item.say == "ribu") terbilang += decodeNum(item.num, index) + " ";
        else terbilang += decodeNum(item.num, index) + item.say + " ";
      }
    }
  });
  return terbilang;
};

const decodeBelasan = terbilang => {
  terbilang = terbilang.trim();
  let found = terbilang.indexOf("satu puluh satu");

  if (found >= 0) {
    let pre = "";
    if (found > 0) {
      pre = terbilang.substring(0, found);
    }
    let post = terbilang.substring(
      found + "satu puluh satu".length,
      terbilang.length
    );

    // satu ratus ke seratus
    if (pre.length > 0) {
      pre = pre.trim();
      pre += " ";
    }
    // satu puluh satu ke sebelas
    if (post.length == 0) {
      pre += "sebelas";
    }
    return pre;
  } else {
    found = terbilang.indexOf("satu puluh");

    if (found >= 0) {
      let pre = "";
      if (found > 0) {
        pre = terbilang.substring(0, found);
      }
      let post = terbilang.substring(
        found + "satu puluh".length,
        terbilang.length
      );
      // satu ratus ke seratus
      if (pre.length > 0) {
        pre = pre.trim();
        pre += " ";
      }
      if (post.length > 0) {
        post = post.trim();
        pre += post + " belas";
      } else {
        pre += "sepuluh";
      }
      return pre;
    }
  }

  terbilang = replace(terbilang, "satu ratus", "seratus");
  return terbilang;
};

const decodeTerbilang = nominal => {
  let aboveBillion = parseInt(Math.floor(nominal / 1000000000));
  aboveBillion = decodeUnderThousand(aboveBillion);
  aboveBillion = decodeBelasan(aboveBillion);

  nominal = nominal % 1000000000;
  let aboveMillion = parseInt(Math.floor(nominal / 1000000));
  aboveMillion = decodeUnderThousand(aboveMillion);
  aboveMillion = decodeBelasan(aboveMillion);

  nominal = nominal % 1000000;
  let aboveThousand = parseInt(Math.floor(nominal / 1000));
  aboveThousand = decodeUnderThousand(aboveThousand);
  aboveThousand = decodeBelasan(aboveThousand);

  nominal = nominal % 1000;
  let underThousand = nominal % 1000;
  underThousand = decodeUnderThousand(underThousand);
  underThousand = decodeBelasan(underThousand);

  let result = "";
  if (aboveBillion.length > 0) result += aboveBillion + " miliar ";
  if (aboveMillion.length > 0) result += aboveMillion + " juta ";
  if (aboveThousand === "satu") result += "seribu ";
  else if (aboveThousand.length > 0) result += aboveThousand + " ribu ";
  if (underThousand.length > 0) result += underThousand;

  // console.log({aboveBillion, aboveMillion, aboveThousand, underThousand});
  // console.log(result);
  return (result.trim() + " rupiah").toUpperCase();
};

const formatCurrency = (num, c = 2, d = ",", t = ".") => {
  c = isNaN((c = Math.abs(c))) ? 2 : c;
  d = d == undefined ? "." : d;
  t = t == undefined ? "," : t;
  var n = num,
    s = n < 0 ? "-" : "",
    i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
    j = (j = i.length) > 3 ? j % 3 : 0;
  return (
    s +
    (j ? i.substr(0, j) + t : "") +
    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
    (c
      ? d +
        Math.abs(n - i)
          .toFixed(c)
          .slice(2)
      : "")
  );
};

module.exports = {
  decodeTerbilang,
  formatCurrency
}
// exports.decodeTerbilang = decodeTerbilang;
// exports.formatCurrency = formatCurrency;
