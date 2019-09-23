import React, { Component } from "react";
import PDFObject from "pdfobject";

class PDFViewer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      id: parseInt(Math.random() * 1000)
    }
  }
  componentDidMount() {
    const { pdfUrl } = this.props;
    // setTimeout(() => {
      PDFObject.embed(pdfUrl, `#custom-pdf-viewer-${this.state.id}`);
    // }, 500);
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.pdfUrl !== this.props.pdfUrl) {
      // setTimeout(() => {
        PDFObject.embed(nextProps.pdfUrl, `#custom-pdf-viewer-${this.state.id}`);
      // }, 500);
    }
  };

  render() {
    const { width, height } = this.props;
    return <div style={{ width, height }} id={`custom-pdf-viewer-${this.state.id}`} />;
  }
}

export default PDFViewer;
