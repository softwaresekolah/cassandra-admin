import SecureLS from "secure-ls";

if (!process.browser) {
  global.localStorage = {
    setItem: () => {},
    getItem: () => {},
    removeItem: () => {},
    removeAll: () => {}
  };
  global.sessionStorage = {
    setItem: () => {},
    getItem: () => {},
    removeItem: () => {},
    removeAll: () => {}
  };
}

let secureLS;
try {
  secureLS = new SecureLS({ encodingType: "aes", isCompression: true });
} catch (err) {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
    secureLS = new SecureLS({ encodingType: "aes", isCompression: true });
  }
}

let encryptedLS = !process.browser
  ? secureLS
  : {
      get: key => {
        try {
          return secureLS.get(key);
        } catch (err) {
          console.warn("encryptedLS.get", err);
          localStorage.clear();
        }
      },
      set: (key, obj) => {
        try {
          return secureLS.set(key, obj);
        } catch (err) {
          console.warn("encryptedLS.set", err);
          localStorage.clear();
        }
      }
    };
export default encryptedLS;

// export default secureLS;
