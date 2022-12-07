// 模板和节点的映射

// 通过模板找到那些节点用到了这个模板
// to->2  for->4
let template2Vnode = new Map();

// 通过节点找到这个节点下有哪些模板
let vnode2Template = new Map();
export function prepareRender(vm, vnode) {
  if (vnode == null) return;
  if (vnode.nodeType === 3) {
    // 是个文本节点
    analysisTemplateString(vnode);
  }
  if (vnode.nodeType === 1) {
    //   表示标签节点
    // 看标签节点的子节点
    for (let i = 0; i < vnode.children.length; i++) {
      prepareRender(vm, vnode.children[i]); // 遍历树形结构，就是递归
    }
  }
}

/**
 * 有没有模板字符串
 * @param {*} vnode
 */
function analysisTemplateString(vnode) {
  //   console.log(vnode.text);
  let templateStrList = vnode.text.match(/{{[a-zA-Z0-9_.]+}}/g); //查找所有的{{}}
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
