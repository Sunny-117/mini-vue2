const arrayProto = Array.prototype; // 数组原型
function defArrayFunc(obj, func, namespace, vm) {
  // 给obj对象代理，代理的属性是func。
  Object.defineProperty(obj, func, {
    enumerable: true, //可枚举
    configurable: true, //可配置
    value: function (...args) {
      // 最终还是用的Array的push，只不过这里我可以在中间干点别的事情
      let original = arrayProto[func];
      const result = original.apply(this, args);
      console.log(getNameSpace(namespace, "")); // 获取是否修改了数组,打印对谁进行了修改
      return result;
    },
  });
}

/**
 * 代理数组主要代理数组的方法
 * 不能捕获索引
 * 但是可以捕获事件
 * @param {*} vm
 * @param {*} arr
 * @param {*} namespace
 * @returns
 */
function proxyArr(vm, arr, namespace) {
  let obj = {
    // 用对象去代理
    eleType: "Array",
    toString: function () {
      let result = "";
      for (let i = 0; i < arr.length; i++) {
        result += arr[i] + ", ";
      }
      return result.substring(0, result.length - 2);
    },
    push() {}, // 值是function ，对值进行代理
    pop() {},
    shift() {},
    unshift() {},
  };
  defArrayFunc.call(vm, obj, "push", namespace, vm); // call 因为有this指向vm实例
  defArrayFunc.call(vm, obj, "pop", namespace, vm);
  defArrayFunc.call(vm, obj, "shift", namespace, vm);
  defArrayFunc.call(vm, obj, "unshift", namespace, vm);
  arr.__proto__ = obj;
  return arr;
}
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
    if (obj[prop] instanceof Object) {
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
    proxyObj = new Array(obj.length);
    for (let i = 0; i < obj.length; i++) {
      proxyObj[i] = constructProxy(vm, obj[i], namespace); // 数组里的每个元素的修改也需要知道
    }
    proxyObj = proxyArr(vm, obj, namespace); // 对数组的修改也希望能监听
  } else if (obj instanceof Object) {
    proxyObj = constructObjectProxy(vm, obj, namespace);
  } else {
    throw new Error("error");
  }
  return proxyObj;
}

function getNameSpace(nowNameSpace, nowProp) {
  if (nowNameSpace == null || nowNameSpace == "") {
    return nowProp;
  } else if (nowProp == null || nowProp == "") {
    return nowNameSpace;
  } else {
    return nowNameSpace + "." + nowProp;
  }
}
