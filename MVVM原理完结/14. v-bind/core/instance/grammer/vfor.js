import VNode from "../../../vdom/vnode.js";
import { getValue } from "../../util/ObjectUtil.js";

/**
 *
 * @param {*} vm
 * @param {*} elm
 * @param {*} parent
 * @param {*} instructions vfor里面的值
 */
export function vforInit(vm, elm, parent, instructions) {
  // (key) in list // 把list解析出来
  let virtualNode = new VNode(
    elm.nodeName,
    elm,
    [],
    "",
    getVirtualNodeData(instructions)[2], // key) in list  list取出来
    parent,
    0,
    ""
  ); // 虚拟节点，nodeType设成0
  virtualNode.instructions = instructions;
  // 让父级把当前节点删除，因为是虚拟节点
  parent.elm.removeChild(elm);
  //   为了保证结构一致
  parent.elm.appendChild(document.createTextNode(""));

  let resultSet = analysisInstructions(vm, instructions, elm, parent);
  // console.log(resultSet);
  // console.log(virtualNode);
  return virtualNode;
}

function getVirtualNodeData(instructions) {
  let insSet = instructions.trim().split(" ");
  if (insSet.length != 3 || (insSet[1] != "in" && insSet[1] != "of")) {
    throw new Error("error");
  }
  return insSet;
}

/**
 * 分析这个指令要做什么
 */
function analysisInstructions(vm, instructions, elm, parent) {
  let insSet = getVirtualNodeData(instructions);
  console.log(insSet);
  let dataSet = getValue(vm._data, insSet[2]); //从vm._data对象里得到list
  if (!dataSet) {
    throw new Error("error");
  }
  let resultSet = [];
  for (let i = 0; i < dataSet.length; i++) {
    // 创建节点
    let tempDom = document.createElement(elm.nodeName);
    tempDom.innerHTML = elm.innerHTML;
    // 创建的不同li的key应该不同，不是一个对象，key是他们li的局部变量
    // 这时候用到了env;
    let env = analysisKV(insSet[0], dataSet[i], i); // 获取局部变量
    tempDom.setAttribute("env", JSON.stringify(env)); // 将变量设置到dom中
    parent.elm.appendChild(tempDom);
    // console.log(tempDom);
    resultSet.push(tempDom);
  }
  return resultSet;
}
function analysisKV(instructions, value, index) {
  // instructions:(key)或key或(key, index)
  if (/([a-zA-Z0-9_$]+)/.test(instructions)) {
    instructions = instructions.trim();
    instructions = instructions.substring(1, instructions.length - 1); // 干掉括号
  }
  let keys = instructions.split(",");
  if (keys.length === 0) {
    throw new Error("error");
  }
  let obj = {};
  if (keys.length >= 1) {
    obj[keys[0].trim()] = value;
  }
  if (keys.length >= 2) {
    //(key, index)
    obj[keys[1].trim()] = index;
  }
  return obj; // 局部变量赋值给env
}
