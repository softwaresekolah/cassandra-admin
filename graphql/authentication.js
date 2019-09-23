const jwt = require("jsonwebtoken");
const HEADER_REGEX = /Bearer token-(.*)$/;

exports.authenticate = async (req, dataLoader) => {
  try {
    // console.log("Authorization header", req.headers.authorization);
    if (!req.headers.authorization) {
      return null;
    }
    const authorizationHeader =
      req.headers.authorization && HEADER_REGEX.exec(req.headers.authorization);
    if (!authorizationHeader) {
      return null;
    }
    const token = authorizationHeader[1];
    // console.log("Token", token);
    if (!token) {
      return null;
    }
    const { sessionId, user } = jwt.verify(token, "SECRET");
    return {
      _id: sessionId,
      User: user,
      token
    };

    //#####################################################################
    // const foundSession = await dataLoader("Sessions").load(sessionId);
    // // console.log("foundSession", foundSession);
    // // const foundSession = await collection("Session").findOne({
    // //   _id: sessionId
    // // });
    // return foundSession && user._id === foundSession.userId
    //   ? { ...foundSession, User: user }
    //   : null;
  } catch (err) {
    console.log("AUTHENTICATE ERROR:", err.message);
    return null;
  }
};

exports.assertValidSession = session => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  if (!session) {
    console.log("SESSION ERROR: Undefined session");
    throw new Error("Undefined session");
  }
  if (!session.User || !session.User._id) {
    console.log("SESSION ERROR: Invalid user session");
    throw new Error("Invalid user session");
  }
};

exports.DEFAULT_EXPIRIDITY = "2d";
// exports.DEFAULT_EXPIRIDITY = "6h";

// ######################################################################################
// ######################################################################################
const bcrypt = require("bcryptjs");

const rolePrivileges = require("./role-privileges.json");
const DEFAULT_ADMIN_ROLES = [
  {
    _id: "DEFAULT_ADMIN_ROLE",
    name: "ADMIN",
    privileges: rolePrivileges.reduce((all, privilege) => {
      for (const access of privilege.access) {
        all.push(privilege.name + ":" + access);
      }
      return all;
    }, [])
  },
  {
    _id: "DEFAULT_MOBILE_USER_ROLE",
    name: "MOBILE_USER",
    privileges: rolePrivileges.reduce((all, privilege) => {
      for (const access of privilege.access) {
        all.push(privilege.name + ":" + access);
      }
      return all;
    }, [])
  }
];

const DEFAULT_ADMIN_USERS = [
  {
    _id: "083854430431",
    username: "083854430431",
    email: "",
    phone: "083854430431",
    status: "Aktif",
    roleId: "DEFAULT_ADMIN_ROLE"
  },
  {
    _id: "admin",
    username: "admin",
    email: "",
    phone: "",
    status: "Aktif",
    roleId: "DEFAULT_ADMIN_ROLE"
  }
];

const generateRandomString = () =>
  [...Array(6)].map(i => (~~(Math.random() * 36)).toString(36)).join("");
const makeSureDefaultUsersAreExists = async collection => {
  for (const defaultRole of DEFAULT_ADMIN_ROLES) {
    const found = await collection("UserRoles").findOne({
      _id: defaultRole._id
    });
    if (found) {
      await collection("UserRoles").updateOne(
        {
          _id: defaultRole._id
        },
        {
          $set: {
            name: defaultRole.name,
            privileges: defaultRole.privileges
          }
        }
      );
    } else {
      await collection("UserRoles").insertOne({
        ...defaultRole,
        _id: defaultRole._id,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      });
    }
  }

  for (const defaultUser of DEFAULT_ADMIN_USERS) {
    const found = await collection("Users").findOne({
      _id: defaultUser._id
    });
    if (found) {
      continue;
    }
    const defaultPassword = defaultUser.defaultPassword
      ? defaultUser.defaultPassword
      : generateRandomString();
    console.log(
      `New password for ${defaultUser.username} => ${defaultPassword}`
    );
    await collection("Users").insertOne({
      ...defaultUser,
      _id: defaultUser._id,
      password: bcrypt.hashSync(defaultPassword, 10),
      defaultPassword,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString()
    });
  }
};
exports.makeSureDefaultUsersAreExists = makeSureDefaultUsersAreExists;
