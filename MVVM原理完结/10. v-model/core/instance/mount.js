import VNode from "../../vdom/vnode.js";
import { vmodel } from "./grammer/vmodel.js";
import {
  getTemplate2VnodeMap,
  getVnode2TemplateMap,
  prepareRender,
} from "./render.js";
export function initMount(Due) {
  /**
   * 允许先不传递el，把due对象创建完了后再用mount方法挂载
   * @param {*} el
   */
  Due.prototype.$mount = function (el) {
    let vm = this;
    let rootDom = document.getElementById(el);
    mount(vm, rootDom);
  };
}

/**
 * 挂载函数
 * @param {*} vm
 * @param {*} el
 */
export function mount(vm, el) {
  // console.log("begin mount");
  vm._vnode = constructVNode(vm, el, null); // 根节点没有父节点，null
  // 进行预备渲染;（建立渲染索引，通过模板找vnode，通过vnode找模板）
  prepareRender(vm, vm._vnode);
  // console.log(getTemplate2VnodeMap());
  // console.log(getVnode2TemplateMap());
}

/**
 * 建立虚拟dom树，深度优先搜索
 * @param {*} vm
 * @param {*} elm
 * @param {*} parent
 */
function constructVNode(vm, elm, parent) {
  analysisAttr(vm, elm, parent);
  let vnode = null;
  let children = [];
  let text = getNodeText(elm); // 保证text一直有值
  let data = null;
  let nodeType = elm.nodeType; //与元素的type保持一致
  let tag = elm.nodeName; // DIV，SPAN
  vnode = new VNode(tag, elm, children, text, data, parent, nodeType);

  // 当前的元素是否还有子元素
  let childs = vnode.elm.childNodes;
  for (let i = 0; i < childs.length; i++) {
    let childNodes = constructVNode(vm, childs[i], vnode); // 深度优先，自己有多少孩子，就循环遍历多少遍
    if (childNodes instanceof VNode) {
      // 返回单一节点
      vnode.children.push(childNodes);
    } else {
      // 返回节点数组
      vnode.children = vnode.children.concat(childNodes);
    }
  }

  return vnode;
}

function getNodeText(elm) {
  // 只有#TEXT里面有文本，其他都是标签里面的文本子节点，不是文本
  // 所以只有文本节点里面才有文本
  if (elm.nodeType == 3) {
    return elm.nodeValue;
  } else {
    return "";
  }
}

function analysisAttr(vm, elm, parent) {
  if (elm.nodeType === 1) {
    // 是标签才分析属性
    let attrNames = elm.getAttributeNames();
    // console.log(attrNames);
    if (attrNames.indexOf("v-model") > -1) {
      vmodel(vm, elm, elm.getAttribute("v-model")); //调用
    }
  }
}
