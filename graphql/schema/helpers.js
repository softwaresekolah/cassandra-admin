const { parse } = require("graphql");
const { replace } = require("lodash");

exports.composeTypeDefs = definitions => {
  let merged = {};
  let ret = ``;
  Object.values(definitions).forEach(defObject => {
    if (typeof defObject === "string") {
      ret = `${ret}${defObject}`;
    } else if (typeof defObject === "object") {
      for (const key in defObject) {
        merged[key] = defObject[key];
      }
    }
  });
  for (const key in merged) {
    ret = `${ret}${merged[key]}`;
  }
  return ret;
};

exports.packAndExport = defs => {
  return defs;
};

const splitDefinitions = input => {
  // const parsed = parse(input);
  const parsed = parse(replace(input, "undefined", ""));
  if (parsed.kind !== "Document") {
    throw new Error("Invalid input for extractType! Expected Document.");
  }
  const result = {};
  for (const def of parsed.definitions) {
    const typename = def.name.value;
    if (!result[typename]) {
      // console.log(typename);
      result[typename] = input.substring(def.loc.start, def.loc.end);
    }
  }
  return result;
};

exports.define = (...includes) => input => {
  const inputTypes = splitDefinitions(input);
  const includedTypes = includes.reduce((aggregated, include) => {
    for (const typename in include) {
      aggregated[typename] = include[typename];
    }
    return aggregated;
  }, {});
  // console.log(inputTypes, includedTypes);
  return {
    ...inputTypes,
    ...includedTypes
  };
};

exports.include = definition => {
  // console.log("include", definition);
  return definition;
};

exports.composeTypeDefs = string => {
  return Object.values(splitDefinitions(string)).join("\n");
};
