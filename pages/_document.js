import Document, { Head, Main, NextScript } from "next/document";
import flush from "styled-jsx/server";
// import htmlescape from "htmlescape";
import appConfig from "../app.json";

export default class SiteDocument extends Document {
  static getInitialProps({ renderPage }) {
    const { html, head, errorHtml, chunks } = renderPage();
    const styles = flush();
    return { html, head, errorHtml, chunks, styles };
  }

  render() {
    // const script = `window.ENV = '${process.env.ENV || "dev"}';`;
    return (
      <html>
        <Head>
          <meta
            httpEquiv="Cache-Control"
            content="no-cache, no-store, must-revalidate"
          />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#0984e3" />
          {/* <meta name="theme-color" content="#74b9ff" /> */}
          <link rel="icon" href={appConfig.appFavicon} />

          {/* <link href="/static/css/bootstrap-4.1.2.min.css" rel="stylesheet" /> */}
          <link
            href="/static/fontawesome-free-5.7.2-web/css/all.min.css"
            rel="stylesheet"
          />
          <link href="/static/css/dashboard.css" rel="stylesheet" />
          <link href="/static/css/nprogress.css" rel="stylesheet" />
          {/* <link href="/static/css/react-select.min.css" rel="stylesheet" /> */}
          <link href="/static/css/react-tabs.css" rel="stylesheet" />
          <link href="/static/css/react-table.min.css" rel="stylesheet" />
          <link href="/static/css/react-draft-wysiwyg.css" rel="stylesheet" />
          <link href="/static/css/quill.snow.css" rel="stylesheet" />
          {/* <link href="/static/css/react-toggle.css" rel="stylesheet" /> */}
          {/* <link href="/static/css/main2.min.css" rel="stylesheet" /> */}
          {/* <script
            dangerouslySetInnerHTML={{ __html: "__ENV__ = " + htmlescape(env) }}
          /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
