import React, { Component } from "react";
import AdminArea, { protectAdminArea } from "../components/AdminArea";
import Head from "next/head";
import appConfig from "../app.json";
import { Editor } from "react-draft-wysiwyg";
import AutosizeTextarea from "react-autosize-textarea";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

class EksperimentalPage extends Component {
  state = {
    contentState: {}
  };

  handleContentStateChange = contentState => {
    this.setState({
      contentState
    });
  };

  render() {
    return (
      <AdminArea withoutFooter>
        <Head>
          <title>Eksperimental | {appConfig.appName}</title>
        </Head>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <i className="fa fa-flask" /> &nbsp;Eksperimental
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <b>
                      <i className="fa fa-pencil-alt" /> &nbsp;WYSIWYG Editor
                    </b>
                    <Editor
                      editorStyle={{
                        margin: 0,
                        padding: "0 10px",
                        backgroundColor: "#fafafa",
                        border: "1px solid #eee"
                      }}
                      onContentStateChange={this.handleContentStateChange}
                    />
                  </div>
                </div>

                <div className="row mt-6">
                  <div className="col-md-6">
                    <div className="form-group">
                      <b>
                        <i className="fa fa-info-circle" /> &nbsp;Raw Content
                        State
                      </b>
                      <AutosizeTextarea
                        value={JSON.stringify(this.state.contentState, null, 4)}
                        onChange={e => {}}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <b>
                        <i className="fa fa-info-circle" /> &nbsp;HTML Content
                        State
                      </b>
                      <AutosizeTextarea
                        value={draftToHtml(this.state.contentState)}
                        onChange={e => {}}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminArea>
    );
  }
}

export default protectAdminArea(EksperimentalPage);
