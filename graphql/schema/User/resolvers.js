const uuidV4 = require("uuid/v4");
const bcrypt = require("bcryptjs");
const {
  assertValidSession,
  DEFAULT_EXPIRIDITY
} = require("../../authentication");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {},

  Mutation: {}
};

exports.resolvers = resolvers;
