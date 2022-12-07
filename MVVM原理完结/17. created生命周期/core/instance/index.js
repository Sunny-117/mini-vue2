import { initMixin } from "./init.js";
import { renderMixin } from "./render.js";
function Due(options) {
  this._init(options);
  if (this._created !== null) {
    this._created.call(this); // this指向due实例
  }
  this._render();
}
initMixin(Due);
renderMixin(Due);

export default Due;
