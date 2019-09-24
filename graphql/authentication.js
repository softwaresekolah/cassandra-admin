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
