import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import NProgress from "nprogress";
import Router from "next/router";

Router.onRouteChangeStart = url => {
  console.log(`Loading: ${url}`);
  NProgress.start();
};
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();
let _notificationSystem = null;
let _loadingSpinner = null;

class LoadingSpinner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible
    };
  }

  show = () => {
    this.setState({
      visible: true
    });
  };

  hide = () => {
    this.setState({
      visible: false
    });
  };

  render() {
    const { visible } = this.state;
    return (
      <div>
        <div
          className="loader-wrapper"
          style={{
            visibility: visible ? "visible" : "hidden",
            opacity: visible ? 1 : 0
          }}
        >
          <div className="loader" />
        </div>
        <style jsx>{`
          .loader-wrapper {
            -webkit-transition: visibility 0s linear 200ms, opacity 200ms linear; /* Safari */
            transition: visibility 0s linear 200ms, opacity 200ms linear;

            opacity: 1;
            position: fixed; /* Sit on top of the page content */
            display: block; /* Hidden by default */
            width: 100%; /* Full width (cover the whole page) */
            height: 100%; /* Full height (cover the whole page) */
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(
              243,
              243,
              243,
              0.4
            ); /* Black background with opacity */
            z-index: 9997; /* Specify a stack order in case you're using a different order for other elements */
            cursor: pointer; /* Add a pointer on hover */
          }
          .loader {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            border: 3px solid #f3f3f3; /* Light grey */
            border-top: 3px solid white; /* Blue */
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 0.6s linear infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
}

export default class App extends Component {
  componentDidMount() {
    hideLoadingSpinner();
  }

  render() {
    return (
      <div>
        <NotificationSystem
          ref={comp => {
            _notificationSystem = comp;
          }}
        />
        <LoadingSpinner
          visible={true}
          ref={comp => {
            _loadingSpinner = comp;
          }}
        />
        {this.props.children}
      </div>
    );
  }
}

export const addNotification = params => {
  if (!_notificationSystem) return;
  if (!params.level) {
    params.level = "warning";
  }
  _notificationSystem.addNotification(params);
};

export const removeNotification = params => {
  if (!_notificationSystem) return;
  _notificationSystem.removeNotification(params);
};

export const clearNotifications = () => {
  if (!_notificationSystem) return;
  _notificationSystem.clearNotifications();
};

export const showLoadingSpinner = () => {
  if (!_loadingSpinner) return;
  _loadingSpinner.show();
};

export const hideLoadingSpinner = () => {
  if (!_loadingSpinner) return;
  _loadingSpinner.hide();
};
