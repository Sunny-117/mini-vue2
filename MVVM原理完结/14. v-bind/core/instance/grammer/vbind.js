import { getValue } from "../../util/ObjectUtil.js";

export default function checkVBind(vm, vnode) {
  if (vnode.nodeType !== 1) {
    return;
  } else {
    let attrNames = vnode.elm.getAttributeNames();
    for (let i = 0; i < attrNames.length; i++) {
      if (
        attrNames[i].indexOf("v-bind:") === 0 ||
        attrNames[i].indexOf(":") == 0
      ) {
        vBind(vm, vnode, attrNames[i], vnode.elm.getAttribute(attrNames[i]));
      }
    }
  }
}

function vBind(vm, vnode, name, value) {
  let k = name.split(":")[1];
  let v = getValue(vm._data, value);
  vnode.elm.setAttribute(k, v);
}
