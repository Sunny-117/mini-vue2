// 模板和节点的映射

import { getValue } from "../util/ObjectUtil.js";

// 通过模板找到那些节点用到了这个模板
// to->2  for->4
let template2Vnode = new Map();
let vnode2Template = new Map();
export function renderMixin(Due) {
  Due.prototype._render = function () {
    renderNode(this, this._vnode);
  };
}

export function renderData(vm, data) {
  // content;
  let vnodes = template2Vnode.get(data);
  if (vnodes !== undefined) {
    for (let i = 0; i < vnodes.length; i++) {
      // console.log(vnodes[i]);
      renderNode(vm, vnodes[i]);
    }
  }
}
export function renderNode(vm, vnode) {
  // 渲染{{}}这些特殊格式的文本，渲染成数据
  // 前提是个文本节点
  if (vnode.nodeType === 3) {
    // 是文本节点，渲染他
    let templates = vnode2Template.get(vnode);
    if (templates) {
      // 这个节点下有模板
      let result = vnode.text; // {{content}} 要想拿到content，前提是data里得有这个content
      for (let i = 0; i < templates.length; i++) {
        let templateValue = getTemplateValue(
          [vm._data, vnode.env],
          templates[i]
        ); // 当前节点的参数可以来自于Due对象， 也可以来自于父级节点(v-for)
        // console.log(templateValue);
        if (templateValue) {
          result = result.replace("{{" + templates[i] + "}}", templateValue);
        }
      }
      vnode.elm.nodeValue = result;
    }
  } else if (vnode.nodeType === 1 && vnode.tag === "INPUT") {
    // 标签
    let templates = vnode2Template.get(vnode);
    if (templates) {
      for (let i = 0; i < templates.length; i++) {
        let templateValue = getTemplateValue(
          [vm._data, vnode.env],
          templates[i]
        ); // 从哪里获取？要么是全局，要么是当前环境下的
        if (templateValue) {
          vnode.elm.value = templateValue;
        }
      }
    }
  } else {
    // 查找子节点
    for (let i = 0; i < vnode.children.length; i++) {
      renderNode(vm, vnode.children[i]);
    }
  }
}

// 通过节点找到这个节点下有哪些模板

export function prepareRender(vm, vnode) {
  if (vnode == null) return;
  if (vnode.nodeType === 3) {
    // 是个文本节点
    analysisTemplateString(vnode);
  }

  analysisAttr(vm, vnode);

  if (vnode.nodeType === 1) {
    //   表示标签
    // 看标签节点的子节点
    for (let i = 0; i < vnode.children.length; i++) {
      prepareRender(vm, vnode.children[i]); // 遍历树形结构，就是递归
    }
  }
}

function analysisTemplateString(vnode) {
  //   console.log(vnode.text);
  let templateStrList = vnode.text.match(/{{[a-zA-Z0-9_.]+}}/g);
  //   console.log(templateStrList);
  for (let i = 0; templateStrList && i < templateStrList.length; i++) {
    setTemplate2Vnode(templateStrList[i], vnode);
    setVnode2Template(templateStrList[i], vnode);
  }
}

function setTemplate2Vnode(template, vnode) {
  //   console.log(template);
  let templateName = getTemplateName(template);
  let vnodeSet = template2Vnode.get(templateName); // 有没有
  if (vnodeSet) {
    vnodeSet.push(vnode);
  } else {
    template2Vnode.set(templateName, [vnode]); // 设置成数组，因为一个模板不止对应一个节点
  }
}

function setVnode2Template(template, vnode) {
  let templateSet = vnode2Template.get(vnode); // 这个节点下有哪些模板
  if (templateSet) {
    templateSet.push(getTemplateName(template));
  } else {
    vnode2Template.set(vnode, [getTemplateName(template)]);
  }
}

/**
 * 解掉花括号
 */
function getTemplateName(template) {
  // 判断是否有花括号，如果有，则解掉，如果没有，直接返回
  if (
    template.substring(0, 2) === "{{" &&
    template.substring(template.length - 2, template.length) === "}}"
  ) {
    return template.substring(2, template.length - 2);
  } else {
    return template;
  }
}

export function getTemplate2VnodeMap() {
  return template2Vnode;
}
export function getVnode2TemplateMap() {
  return vnode2Template;
}

/**
 * 层级递进，获取里面的值
 * @param {*} objs
 * @param {*} templateName
 * @returns
 */
function getTemplateValue(objs, templateName) {
  for (let i = 0; i < objs.length; i++) {
    let temp = getValue(objs[i], templateName);
    if (temp !== null) {
      return temp;
    }
  }
  return null;
}

function analysisAttr(vm, vnode) {
  if (vnode.nodeType !== 1) {
    // 必须是标签才带属性
    return;
  }
  let attrNames = vnode.elm.getAttributeNames();
  if (attrNames.indexOf("v-model") > -1) {
    setTemplate2Vnode(vnode.elm.getAttribute("v-model"), vnode);
    setVnode2Template(vnode.elm.getAttribute("v-model"), vnode);
  }
}
