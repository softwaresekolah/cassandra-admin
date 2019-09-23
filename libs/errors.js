import Router from "next/router";
import { addNotification } from "../components/App";

export const handleError = error => {
  if (error.message) {
    if (error.message.indexOf("Network error") >= 0) {
      error.message = "Network error! Please try again later."
    } else {
      error.message = error.message.replace("GraphQL error: ", "");
    }
  } else {
    error.message = "Unknown error! Please try again later.";
  }
  console.warn("Handling error:", error.message);
  addNotification({
    message: "Unknown Error",
    level: "error",
    ...error
  });
  // if (error.message) {
  //     return error.message.replace("GraphQL error:", "").trim();
  // }
  // Router.replace("/");
};
