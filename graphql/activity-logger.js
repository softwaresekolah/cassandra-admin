const uuidV4 = require("uuid/v4");

const assertValidTopicAndMessage = (topic, message) => {
  if (!topic) {
    console.log("ACTIVITY LOGGER ERROR: Undefined topic");
  }
  if (!message) {
    console.log("ACTIVITY LOGGER ERROR: Undefined message");
  }
};

exports.buildActivityLogger = (collection, activeSession) => async ({
  topic,
  message,
  userId,
  sessionId
}) => {
  if (activeSession) {
    userId = activeSession.User._id;
    sessionId = activeSession._id;
  }
  assertValidTopicAndMessage(topic, message);
  const newActivityLog = {
    _id: uuidV4(),
    topic,
    message,
    sessionId,
    userId,
    _createdAt: new Date().toISOString()
  };
  await collection("ActivityLogs").insertOne(newActivityLog);
};
