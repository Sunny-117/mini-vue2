import { initMixin } from "./init.js";
import { renderMixin } from "./render.js";
function Due(options) {
  this._init(options);
  this._render();
}
initMixin(Due);
renderMixin(Due);

export default Due;
