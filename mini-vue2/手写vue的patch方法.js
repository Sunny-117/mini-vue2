//简单实现vue的更新方法，递归实现
function update(vNode, newNode) {
    let children = vNode.children || {};
    let newChildren = newNode.children || {};
    children.forEach((childrenVnode, index) => {
        let newChildrenVnode = newChildren[index];
        if (childrenVnode.tag == newChildrenVnode.tag) {
            update(childrenVnode, newChildrenVnode);
        } else {
            replace(childrenVnode, newChildrenVnode);
        }
    });
}