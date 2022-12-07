import { getEnvAttr, getValue } from "../../util/ObjectUtil.js";

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
  if (/^{[\w\W]+}$/.test(value)) {
    let str = value.substring(1, value.length - 1).trim();
    let expressionList = str.split(",");
    let result = analysisExpression(vm, vnode, expressionList);
    vnode.elm.setAttribute(k, result);
    vnode.elm.setAttribute(k, result);
  } else {
    let v = getValue(vm._data, value);
    vnode.elm.setAttribute(k, v);
  }
}
function analysisExpression(vm, vnode, expressionList) {
  // 获取当前环境的变量
  let attr = getEnvAttr(vm, vnode);
  // 判断表达式是否成立
  let code = generateCode(attr);
  // 拼组result
}
