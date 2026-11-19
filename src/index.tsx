/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import App from "./App";
import Landing from "./pages/Landing";
import AppPage from "./pages/AppPage";
import "./index.css";

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Landing} />
      <Route path="/app" component={AppPage} />
      <Route path="*" component={Landing} />
    </Router>
  ),
  document.getElementById("root")!
);
