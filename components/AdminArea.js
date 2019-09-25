import React, { Component } from "react";
import App from "./App";
import Header from "./Header";
import Footer from "./Footer";
import redirect from "../libs/redirect";
import checkLoggedIn from "../libs/checkLoggedIn";
import Error from "next/error";

class AdminArea extends Component {
  render() {
    return (
      <App>
        <div className="page">
          <div className="page-main">
            <Header />
            <div className="my-3 my-md-5">
              <div
                className={
                  this.props.fluid ? "container-fluid pl-6 pr-6" : "container"
                }
              >
                {this.props.children}
              </div>
            </div>
            {this.props.withoutFooter === true ? null : <Footer />}
          </div>
        </div>
      </App>
    );
  }
}

export default AdminArea;

export const protectAdminArea = ProtectedComponent => {
  return class WithProtectedAdminArea extends Component {
    static displayName = `WithProtectedAdminArea(${ProtectedComponent.displayName})`;

    static async getInitialProps(context) {
      const { loggedInUser } = await checkLoggedIn(context.apolloClient);
      if (typeof loggedInUser.currentUser === "undefined") {
        return { errorCode: 500 };
      } else if (loggedInUser.currentUser === null) {
        redirect(context, "/");
      }
      return {
        currentUser:
          loggedInUser && loggedInUser.currentUser
            ? loggedInUser.currentUser
            : {}
      };
    }

    render() {
      if (this.props.errorCode) {
        return <Error statusCode={this.props.errorCode} />;
      } else {
        return (
          <ProtectedComponent
            {...this.props}
            currentUser={this.props.currentUser}
          />
        );
      }
    }
  };
};

export const protectAdminAreaForRoles = roleIds => ProtectedComponent => {
  return class WithProtectedAdminArea extends Component {
    static displayName = `WithProtectedAdminArea(${ProtectedComponent.displayName})`;

    static async getInitialProps(context) {
      const res = await checkLoggedIn(context.apolloClient);
      const { loggedInUser } = res;
      // console.log({
      //   undefined: typeof loggedInUser.currentUser === "undefined",
      //   null: loggedInUser.currentUser === null
      // });
      if (typeof loggedInUser.currentUser === "undefined") {
        return { errorCode: 500 };
      } else if (loggedInUser.currentUser === null) {
        redirect(context, "/");
      }
      return {
        currentUser:
          loggedInUser && loggedInUser.currentUser
            ? loggedInUser.currentUser
            : {}
      };
    }

    render() {
      if (this.props.errorCode) {
        return <Error statusCode={this.props.errorCode} />;
      } else if (
        !this.props.currentUser.Role ||
        !roleIds.includes(this.props.currentUser.Role._id)
      ) {
        return <Error statusCode={404} />;
      } else {
        return (
          <ProtectedComponent
            {...this.props}
            currentUser={this.props.currentUser}
          />
        );
      }
    }
  };
};
