const uuidV4 = require("uuid/v4");
// const { assertValidSession } = require("../../authentication");
const { NOT_DELETED_DOCUMENT_QUERY } = require("../../data-loader");
const bcrypt = require("bcryptjs");
const {
  assertValidSession,
  DEFAULT_EXPIRIDITY
} = require("../../authentication");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {
    allUsers: async (self, params, context) => {
      return await context
        .collection("Users")
        .find({
          ...NOT_DELETED_DOCUMENT_QUERY
          // PREFIX
        })
        .toArray();
    },
    allUserRoles: async (self, params, context) => {
      return await context
        .collection("UserRoles")
        .find({
          ...NOT_DELETED_DOCUMENT_QUERY
          // PREFIX
        })
        .toArray();
    },
    currentUser: async (self, params, context) => {
      // assertValidSession(context.activeSession);
      if (
        !context.activeSession ||
        !context.activeSession.User ||
        !context.activeSession.User._id
      ) {
        return null;
      }
      // console.log("currentUser...", context.activeSession.User);
      const user = await context.collection("Users").findOne({
        _id: context.activeSession.User._id
      });
      // console.log({ user });
      return user;
    }
  },

  Mutation: {
    registerUser: async (self, params, context) => {
      await context.collection("Users").createIndex(
        {
          username: 1
        },
        { unique: true }
      );

      const found = await context.collection("Users").findOne({
        username: params.username,
        ...NOT_DELETED_DOCUMENT_QUERY
        // PREFIX
      });

      if (found) {
        throw new Error(`Username ${found.username} telah digunakan!`);
      }

      const newUser = {
        _id: uuidV4(),
        ...params,
        password: bcrypt.hashSync(params.password, 10),
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
        // PREFIX
      };

      await context.collection("Users").insertOne(newUser);
      return newUser;
    },
    deleteUser: async (self, params, context) => {
      const found = await context.collection("Users").findOne({
        _id: params._id,
        alumniId: {
          $exists: false,
          $ne: ""
        }
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
        await context.collection("Users").createIndex(
          {
            username: 1
          },
          { unique: true }
        );
      }

      return "SUCCESS";
    },
    deactivateUser: async (self, params, context) => {
      await context.collection("Users").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            status: "Non Aktif",
            _updatedAt: new Date().toISOString()
          }
        }
      );
      return "SUCCESS";
    },
    activateUser: async (self, params, context) => {
      await context.collection("Users").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            status: "Aktif",
            _updatedAt: new Date().toISOString()
          }
        }
      );
      return "SUCCESS";
    },
    updateUser: async (self, params, context) => {
      await context.collection("Users").createIndex(
        {
          username: 1
        },
        { unique: true }
      );

      const found = await context.collection("Users").findOne({
        _id: {
          $ne: params._id
        },
        username: params.username,
        ...NOT_DELETED_DOCUMENT_QUERY
        // PREFIX
      });

      if (found) {
        throw new Error(`Username ${found.username} telah digunakan!`);
      }

      await context.collection("Users").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            ...params,
            _updatedAt: new Date().toISOString()
          }
        }
      );
      return "SUCCESS";
    },
    updateRoleForUser: async (self, params, context) => {
      await context.collection("Users").updateOne(
        {
          _id: params._id,
          alumniId: {
            $exists: false,
            $ne: ""
          }
        },
        {
          $set: {
            roleId: params.roleId,
            _updatedAt: new Date().toISOString()
          }
        }
      );
      return "SUCCESS";
    },
    updateUserPassword: async (self, params, context) => {
      const foundUser = await context.collection("Users").findOne({
        _id: params._id
      });
      if (!foundUser) {
        throw new Error(`User tidak valid atau tidak ditemukan!`);
      }

      if (!bcrypt.compareSync(params.oldPassword, foundUser.password)) {
        throw new Error(`Password lama tidak cocok!`);
      }

      await context.collection("Users").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            password: bcrypt.hashSync(params.newPassword, 10),
            passwordUpdatedAt: new Date().toISOString(),
            _updatedAt: new Date().toISOString()
          }
        }
      );
      return "SUCCESS";
    },
    resetUserPassword: async (self, params, context) => {
      const foundUser = await context.collection("Users").findOne({
        _id: params._id
      });
      if (!foundUser) {
        throw new Error(`User tidak valid atau tidak ditemukan!`);
      }

      await context.collection("Users").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            password: bcrypt.hashSync(params.newPassword, 10),
            passwordUpdatedAt: new Date().toISOString(),
            _updatedAt: new Date().toISOString()
          }
        }
      );
      return "SUCCESS";
    },

    createUserRole: async (self, params, context) => {
      const newRole = {
        _id: uuidV4(),
        ...params,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
        // PREFIX
      };
      await context.collection("UserRoles").insertOne(newRole);
      return newRole;
    },
    updateUserRole: async (self, params, context) => {
      await context.collection("UserRoles").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            name: params.name,
            privileges: params.privileges,
            _updatedAt: new Date().toISOString()
          }
        }
      );
      return "SUCCESS";
    },
    deleteUserRole: async (self, params, context) => {
      await context.collection("UserRoles").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            _deletedAt: new Date().toISOString()
          }
        }
      );
      await context.collection("Users").updateMany(
        {
          roleId: params._id
        },
        {
          $set: {
            status: "Non Aktif",
            _updatedAt: new Date().toISOString()
          }
        }
        // {
        //   multi: true
        // }
      );
      return "SUCCESS";
    },

    logIn: async (self, params, context) => {
      const foundUser = await context.collection("Users").findOne({
        username: params.username,
        status: "Aktif",
        roleId: "DEFAULT_ADMIN_ROLE",
        ...NOT_DELETED_DOCUMENT_QUERY
        // PREFIX
      });
      if (!foundUser) {
        throw new Error(`User ${params.username} tidak ditemukan!`);
      }

      if (!bcrypt.compareSync(params.password, foundUser.password)) {
        throw new Error(`Password tidak cocok!`);
      }

      const session = await createSession({
        user: foundUser,
        collection: context.collection
      });
      return session;
    },
    logOut: async (self, params, context) => {
      if (context.activeSession) {
        await context
          .collection("UserSessions")
          .updateOne(
            { _id: context.activeSession._id },
            { $set: { _deletedAt: new Date().toISOString() } }
          );
      }
      return "SUCCESS";
    }
  },

  User: {
    Role: async (self, params, context) => {
      return await context.collection("UserRoles").findOne({
        _id: self.roleId
      });
    },
    Alumni: async (self, params, context) => {
      return context.collection("Alumni").findOne({
        _id: self.alumniId
      });
    }
  },

  UserSession: {
    User: async (self, params, context) => {
      return await context.collection("Users").findOne({
        _id: self.userId
      });
    }
  },

  UserRole: {
    countUsers: async (self, params, context) => {
      return await context
        .collection("UserRoles")
        .find({
          roleId: self._Id
        })
        .count();
    }
  }
};

exports.resolvers = resolvers;

const createSession = async ({
  user,
  expiresIn = DEFAULT_EXPIRIDITY,
  collection
}) => {
  const sessionId = uuidV4();
  delete user.password;
  const jwtPayload = {
    sessionId,
    user: {
      _id: user._id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      roleId: user.roleId,
      status: user.status
    }
  };
  let token =
    expiresIn === null
      ? jwt.sign(jwtPayload, "SECRET", {})
      : jwt.sign(jwtPayload, "SECRET", { expiresIn });
  const newSession = {
    _id: sessionId,
    userId: user._id,
    token: "token-" + token,
    expiresIn,
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString()
  };
  await collection("UserSessions").insertOne(newSession);
  // await collection("Users").updateOne(
  //   {
  //     _id: user._id
  //   },
  //   {
  //     $set: {
  //       lastLoginAt: new Date().toISOString(),
  //       _updatedAt: new Date().toISOString()
  //     }
  //   }
  // );
  return newSession;
};
