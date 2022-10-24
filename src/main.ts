import "preact/debug";
import { html, render } from "htm/preact";
import { App } from "./components";

function init(): void {
  const el = document.getElementById("app")!;
  render(html`<${App} />`, el);
}

window.addEventListener("DOMContentLoaded", init);
