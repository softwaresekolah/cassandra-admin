const cassandra = require("cassandra-driver");

const initCassandra = () => {
  const client = new cassandra.Client({
    contactPoints: process.env.CONTACT_POINTS
      ? process.env.CONTACT_POINTS.split(",").map(point => ("" + point).trim())
      : ["127.0.0.1"],
    localDataCenter: process.env.LOCAL_DATA_CENTER || "datacenter1"
  });
  client.connect(err => {
    if (err) {
      console.log("Error connect to cassandra : ", err);
    } else {
      console.log(
        "Connected to cluster with %d host(s): %j",
        client.hosts.length,
        client.hosts.keys()
      );
    }
  });
  return client;
};

module.exports = initCassandra;
