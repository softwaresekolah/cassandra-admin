const cassandra = require("cassandra-driver");

const initCassandra = () => {
  const client = new cassandra.Client({
    contactPoints: ["127.0.0.1"],
    localDataCenter: "datacenter1"
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

  // client.execute("SELECT * FROM system_schema.keyspaces", function(err, result) {
  //   if (err) return console.error(err);
  //   const row = result.first();
  //   console.log(row);
  // });

  return client
};

module.exports = initCassandra;
