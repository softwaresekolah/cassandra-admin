import React, { Component } from "react";

export default class RichTextEditor extends Component {
  constructor(props) {
    super(props);
    if (typeof window !== "undefined") {
      this.ReactQuill = require("react-quill");
      const { Quill } = require("react-quill");
      this.Quill = Quill
      this.modules = {
        toolbar: [
          ["bold", "italic", "underline", "strike"], // toggled buttons
          ["blockquote" /*, "code-block"*/],

          // [{ header: 1 }, { header: 2 }], // custom button values
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }], // superscript/subscript
          [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
          [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
          // [{ direction: "rtl" }], // text direction

          // [{ size: ["small", false, "large", "huge"] }], // custom dropdown
          [{ header: [1, 2, 3, 4, 5, 6, false] }],

          [{ color: [] }, { background: [] }], // dropdown with defaults from theme
          // ['link', 'image']
          // [{ font: [] }]

          // ["clean"] // remove formatting button
        ],
      };

      this.formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "align"
      ];
    }
  }

  render() {
    const ReactQuill = this.ReactQuill;
    const { onChange, value } = this.props;

    if (typeof window !== "undefined" && ReactQuill) {
      return (
        <ReactQuill
          onChange={onChange}
          theme="snow"
          value={value}
          modules={this.modules}
          formats={this.formats}
        />
      );
    } else {
      return <textarea />;
    }
  }
}
