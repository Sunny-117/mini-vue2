function constructObjectProxy(vm, obj, namespace) {
  let proxyObj = {};
  for (const prop in obj) {
    Object.defineProperty(proxyObj, prop, {
      configurable: true,
      get() {
        return obj[prop];
      },
      set: function (value) {
        // console.log(prop);
        console.log(getNameSpace(namespace, prop));
        obj[prop] = value;
      },
    });
    /**
     * 实现直接访问和修改 test.content
     */
    Object.defineProperty(vm, prop, {
      configurable: true,
      get() {
        return obj[prop];
      },
      set: function (value) {
        console.log(getNameSpace(namespace, prop));
        obj[prop] = value;
      },
    });
    /**
     * 属性是对象：对象套对象
     * 对象往下传递的时候就有了自己的命名空间：上一级传过来的命名空间+当前属性名
     */
    if (obj[prop] instanceof Object) {
      // 不确定是对象还是数组，所以要调用外面的constructProxy
      proxyObj[prop] = constructProxy(
        vm,
        obj[prop],
        getNameSpace(namespace, prop)
      );
    }
  }
  return proxyObj;
}
/**
 * 要知道哪个属性被修改了，才能对页面上的内容进行更新
 * 所以必须先能否捕获修改的这个事件
 * 所以需要用代理的方式监听属性的修改
 * @param {*} vm Due对象
 * @param {*} obj 要进行代理的对象
 * @param {*} namespace
 */
export function constructProxy(vm, obj, namespace) {
  // 递归
  // 代理的要莫是对象，要么是数组
  let proxyObj = null;
  if (obj instanceof Array) {
  } else if (obj instanceof Object) {
    proxyObj = constructObjectProxy(vm, obj, namespace);
  } else {
    throw new Error("error");
  }
  return proxyObj;
}

/**
 * 命名空间：表示当前修改的东西是什么
 * @param {}} nowNameSpace
 * @param {*} nowProp
 * @returns
 */
function getNameSpace(nowNameSpace, nowProp) {
  if (nowNameSpace == null || nowNameSpace == "") {
    return nowProp;
  } else if (nowProp == null || nowProp == "") {
    return nowNameSpace;
  } else {
    // 嵌套的情况
    return nowNameSpace + "." + nowProp;
  }
}
