import { mount } from "./mount.js";
import { constructProxy } from "./proxy.js";
let uid = 0;
export function initMixin(Due) {
  Due.prototype._init = function (options) {
    const vm = this;
    vm.uid = uid++;
    vm._isDue = true;
    // 初始化数据data
    if (options && options.data) {
      // 装载到了test._data； test两个地方

      vm._data = constructProxy(vm, options.data, "");
    }
    // 初始化created方法
    // 初始化methods
    // 初始化computed
    // 初始化el并挂载
    if (options && options.el) {
      let rootDom = document.getElementById(options.el); // 真实dom
      mount(vm, rootDom);
    }
  };
}
