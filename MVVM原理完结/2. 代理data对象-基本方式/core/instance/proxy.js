function constructObjectProxy(vm, obj, namespace) {
  let proxyObj = {};
  for (let prop in obj) {
    Object.defineProperty(proxyObj, prop, {
      configurable: true,
      get() {
        return obj[prop];
      },
      set: function (value) {
        // console.log(prop);// 打印一下我修改的哪个属性
        obj[prop] = value;
      },
    });
    /**
     * test.data.content可以
     * 现在我想实现直接访问和修改 test.content
     * 往vm上也设置代理
     */
    Object.defineProperty(vm, prop, {
      configurable: true,
      get() {
        return obj[prop];
      },
      set: function (value) {
        obj[prop] = value;
      },
    });
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
    throw new Error("我只接受对象和数组");
  }
  return proxyObj;
}
