import React, { Component } from "react";
import Head from "next/head";
import appConfig from "../app.json";
import App from "../components/App";
import redirect from "../libs/redirect";
import checkLoggedIn from "../libs/checkLoggedIn";
import LoginBox from "../components/LoginBox";

class IndexPage extends Component {
  static async getInitialProps(context) {
    redirect(context, "/dashboard");
    // const { loggedInUser } = await checkLoggedIn(context.apolloClient);
    // // console.log({
    // //   currentUser: loggedInUser.currentUser,
    // //   undefined: typeof loggedInUser.currentUser === "undefined",
    // //   null: loggedInUser.currentUser === null
    // // });
    // if (loggedInUser.currentUser) {
    //   redirect(context, "/dashboard");
    // } else if (typeof loggedInUser.currentUser === "undefined") {
    //   return { errorCode: 500 };
    // }
    return {};
  }

  render() {
    return (
      <App>
        <Head>
          <title>Login | {appConfig.appName}</title>
        </Head>
        <div className="page">
          <div className="page-single">
            <div className="container">
              <div className="row">
                <LoginBox />
              </div>
            </div>
          </div>
        </div>
      </App>
    );
  }
}

export default IndexPage;
