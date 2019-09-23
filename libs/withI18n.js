import React, { Component } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import translations from "../locales";
import encryptedLS from "./encryptedLS";

const startI18n = lang =>
  i18n.init({
    lng: lang ? lang : "id", // active language http://i18next.com/translate/
    fallbackLng: "id",

    resources: translations,

    ns: ["translations"],
    defaultNS: "translations",

    debug: false,
    silent: true,
    saveMissing: true,

    interpolation: {
      escapeValue: false, // not needed for react!!
      formatSeparator: ",",
      format: (value, format, lng) => {
        if (format === "uppercase") return value.toUpperCase();
        return value;
      }
    }
  });

// Gets the display name of a JSX component for dev tools
const getComponentDisplayName = Component => {
  return Component.displayName || Component.name || "Unknown";
};

export const withI18n = ComposedComponent => {
  return class WithApollo extends React.Component {
    static displayName = `WithI18n(${getComponentDisplayName(
      ComposedComponent
    )})`;

    static async getInitialProps(ctx) {
      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx);
      }

      return {
        ...composedInitialProps
      };
    }

    constructor(props) {
      super(props);

      const lang = encryptedLS.get("______lang");
      // const lang =
      //   props.url.query && props.url.query.lang ? props.url.query.lang : "id";
      // console.log("LANG", lang);
      this.i18n = startI18n(lang);
    }

    render() {
      return (
        <I18nextProvider i18n={this.i18n}>
          <ComposedComponent {...this.props} client={this.apollo} />
        </I18nextProvider>
      );
    }
  };
};
