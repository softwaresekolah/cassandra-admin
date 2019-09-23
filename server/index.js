let checkList = {
  APP_BIND_PORT: true,
  GRAPHQL_API_HOST: true,
  GRAPHQL_API_PORT: true
};
require("dotenv").config();
Object.keys(checkList).forEach(key => {
  console.log(`Checking ${key}`);
  if (!process.env[key]) {
    console.log("  Not found!");
    if (checkList[key]) {
      console.log("  Process is exitting...");
      process.exit(0);
    }
  } else {
    console.log(`  Found with value: ${process.env[key]}`);
  }
});

const bodyParser = require("body-parser");
const next = require("next");
const proxyMiddleware = require("http-proxy-middleware");
const cors = require("cors");
//

const expressApp = require("express")();
const server = require("http").Server(expressApp);
//

const port = parseInt(process.env.APP_BIND_PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
//

const nextApp = next({ dev, quiet: !dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  console.log(
    "Applying proxy for",
    `http://${process.env.GRAPHQL_API_HOST}:${
      process.env.GRAPHQL_API_PORT
    }/graphql`
  );
  expressApp.use(
    "/api",
    proxyMiddleware({
      target: `http://${process.env.GRAPHQL_API_HOST}:${
        process.env.GRAPHQL_API_PORT
      }`,
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/graphql"
      }
    })
  );

  expressApp.use(bodyParser.json());

  const corsOptions = {
    optionsSuccessStatus: 200
  };
  // PreFLIGHT!
  expressApp.options("*", cors(corsOptions));

  // expressApp.get("/", (req, res) => {
  //   res.redirect("/dashboard");
  // });

  expressApp.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(parseInt(process.env.APP_BIND_PORT), err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.APP_BIND_PORT}`);
  });
});
