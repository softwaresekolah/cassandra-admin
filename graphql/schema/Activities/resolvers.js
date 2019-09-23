const { NOT_DELETED_DOCUMENT_QUERY } = require("../../data-loader");
const bcrypt = require("bcryptjs");
const {
  assertValidSession,
  DEFAULT_EXPIRIDITY
} = require("../../authentication");
const jwt = require("jsonwebtoken");
const uuidV4 = require("uuid/v4");

const resolvers = {
  Query: {
    allActivities: async (self, params, context) => {
      return await context
        .collection("Activities")
        .find({
          type: "ACTIVITY_GROUP",
          _deletedAt: {
            $exists: false
          }
        })
        .toArray();
    },
    allActivityDocumentation: async (self, params, context) => {
      let documentation = await context.collection("Activities").findOne({
        activityGroupId: params._id,
        _deletedAt: {
          $exists: false
        }
      });
      if (!documentation) {
        return { _id: "", thumbnails: [] };
      }
      return documentation;
    }
  },
  Mutation: {
    createActivity: async (self, params, context) => {
      assertValidSession(context.activeSession);

      let data = { 
        _id: uuidV4(),
        ...params.input,
        type: "ACTIVITY_GROUP",
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      };
      await context.collection("Activities").insertOne(data);
      return "ok";
    },
    createActivityDocumentation: async (self, params, context) => {
      assertValidSession(context.activeSession);

      let foundActivity = await context.collection("Activities").findOne({
        _id: params.activityGroupId,
        type: "ACTIVITY_GROUP",
        _deletedAt: {
          $exists: false
        }
      });

      if (!foundActivity) {
        throw new Error("ID Aktivitas Grup tidak ditemukan!");
      }

      let foundDocumentation = await context.collection("Activities").findOne({
        activityGroupId: params.activityGroupId,
        type: "ACTIVITY_DOCUMENTATION",
        _deletedAt: {
          $exists: false
        },
        thumbnails: {
          $exists: true
        }
      });

      if(foundDocumentation){
        await context.collection("Activities").updateOne({
          _id: foundDocumentation._id
        },{
          $set: {thumbnails: params.input.thumbnails}
        })
      }else{
        let documentation = {
          _id: uuidV4(),
          thumbnails: params.input.thumbnails,
          activityGroupId: params.activityGroupId,
          type: "ACTIVITY_DOCUMENTATION",
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString()
        }
        await context.collection("Activities").insertOne(documentation);      
      }

      return "OK";
    },
    updateActivity: async (self, params, context) => {
      assertValidSession(context.activeSession);

      foundActivity = await context.collection("Activities").findOne({
        _id: params._id,
        _deletedAt: {
          $exists: false
        }
      });

      if (!foundActivity) {
        throw new Error("Aktivitas tidak ditemukan!");
      }
      await context.collection("Activities").updateOne(
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

      return "OKE";
    },
    updateActivityDocumentation: async (self, params, context) => {
      assertValidSession(context.activeSession);
 
      foundDocumentation = await context.collection("Activities").findOne({
        _id: params._id,
        _deletedAt: {
          $exists: false
        }
      });

      if (!foundDocumentation) {
        throw new Error("Dokumentasi tidak ditemukan!");
      }

      await context.collection("Activities").updateOne(
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
      return "OKE";
    },
    deleteActivity: async (self, params, context) => {
      assertValidSession(context.activeSession);

      foundActivity = await context.collection("Activities").findOne({
        _id: params._id,
        _deletedAt: {
          $exists: false
        }
      });

      if (!foundActivity) {
        throw new Error("Aktivitas tidak ditemukan!");
      }

      if (foundActivity.activityDocumentationIds) {
        for (const doc of foundActivity.activityDocumentationIds) {
          await context.collection("Activities").updateOne(
            {
              _id: doc
            },
            {
              $set: {
                _deletedAt: new Date().toISOString()
              }
            }
          );
        }
      }

      await context.collection("Activities").updateOne(
        {
          _id: params._id
        },
        {
          $set: {
            _deletedAt: new Date().toISOString()
          }
        }
      );

      return "oke";
    },
    deleteActivityDocumentation: async (self, params, context) => {
      assertValidSession(context.activeSession);
      foundDocumentation = await context.collection("Activities").findOne({
        _id: params._id,
        type: "ACTIVITY_DOCUMENTATION",
        _deletedAt: {
          $exists: false
        }
      });
      if (!foundDocumentation) {
        throw new Error("Dokumentasi tidak ditemukan");
      }

      foundActivity = await context.collection("Activities").findOne({
        _id: foundDocumentation.activityGroupId,
        _deletedAt: {
          $exists: false
        }
      });
      if (foundDocumentation.thumbnails.length === 0) {
        await context.collection("Activities").updateOne(
          {
            _id: foundDocumentation.activityGroupId
          },
          {
            $pull: { activityDocumentationIds: foundDocumentation._id }
          }
        );

        await context.collection("Activities").updateOne(
          {
            _id: params._id
          },
          {
            $set: {
              _deletedAt: new Date().toISOString()
            }
          }
        );

        return "oke";
      }

      await context.collection("Activities").updateOne(
        {
          _id: params._id
        },
        {
          $pull: { thumbnails: params.thumbnail }
        }
      );
      return "oke";
    },
    // deleteActivityDocumentationThumbnails: async (self,params,context) => {
    //   assertValidSession(context.activeSession);

    // }
  },
  Activities: {
    ActivityDocumentation: async (self, params, context) => {
      assertValidSession(context.activeSession);
      const test = await context
        .collection("Activities")
        .findOne({
          activityGroupId: self._id
        });
      return test;
    }
  }
};

exports.resolvers = resolvers;
