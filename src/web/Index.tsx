import "core-js/stable";
import "regenerator-runtime/runtime";

import * as React from "react";
import * as ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {APIClient} from "../services/apiclient/APIClient";
import * as serviceWorker from "./serviceWorker";
import App from "./App";

// import "antd/dist/antd.less";

APIClient.configureClient({});

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root") as HTMLElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
serviceWorker.unregister();
