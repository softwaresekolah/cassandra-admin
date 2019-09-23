let checkList = {
  APP_BIND_PORT: false,
  GRAPHQL_API_PORT: false
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

const port = parseInt(process.env.APP_BIND_PORT) || 8008;
const dev = process.env.NODE_ENV !== "production";
//

const nextApp = next({ dev, quiet: !dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  console.log(
    "Applying proxy for",
    `http://localhost:${process.env.GRAPHQL_API_PORT || 8009}/graphql`
  );
  expressApp.use(
    "/api",
    proxyMiddleware({
      target: `http://localhost:${process.env.GRAPHQL_API_PORT || 8009}`,
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

  server.listen(parseInt(port), err => {
    if (err) throw err;
    console.log(`🚀 Web server ready on http://localhost:${port}`);
  });
});
