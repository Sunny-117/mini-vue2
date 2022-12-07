import { setValue } from "../../util/ObjectUtil.js";

/**
 *
 * @param {*} vm 元素
 * @param {*} elm 对象
 * @param {*} data 对应的属性
 */
export function vmodel(vm, elm, data) {
  elm.onchange = function (event) {
    // 已修改就设置value
    setValue(vm._data, data, elm.value); // vue对象，该元素绑定的属性，该元素的新value
  };
}
