import React, { PureComponent } from "react";
import appConfig from "../app.json";

class Footer extends PureComponent {
  render() {
    return (
      <div>
        <footer className="footer">
          <div className="container">
            <div className="row align-items-center flex-row-reverse">
              <div className="col-auto ml-lg-auto">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <ul className="list-inline list-inline-dots mb-0">
                      <li className="list-inline-item">
                        App Version {appConfig.appVersion}
                      </li>
                    </ul>
                  </div>
                  <div className="col-auto">
                    <a
                      href="https://github.com/softwaresekolah/cassandra-admin"
                      target="_blank"
                      className="btn btn-outline-primary btn-sm"
                    >
                      Source code
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-auto mt-3 mt-lg-0 text-center">
                Copyright © 2019 All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default Footer;
