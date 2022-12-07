let test = {
    tag: "DIV",
    attrs: {
        id: "app",
    },
    children: [{
        tag: "SPAN",
        children: [{
            tag: "A",
            children: []
        }],
    },
    {
        tag: "SPAN",
        children: [{
            tag: "A",
            children: []
        },
        {
            tag: "A",
            children: []
        },
        ],
    },
    ],
};

function __render(vnode) {
    if (typeof vnode === 'number') {
        vnode = String(vnode);
    }
    if (typeof vnode === 'string') {
        return document.createTextNode(vnode);
    }
    const dom = document.createElement(vnode.tag);
    if (vnode.attrs) {
        //遍历属性
        Object.keys(vnode.attrs).forEach((key) => {
            const value = vnode.attrs[key];
            dom.setAttribute(key, value);
        })
    }
    vnode.children.forEach((child) => dom.appendChild(__render(child)))
    return dom;
}
console.log(__render(test))