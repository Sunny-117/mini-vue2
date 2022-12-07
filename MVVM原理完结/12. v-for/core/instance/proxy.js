import { renderData } from "./render.js";

const arrayProto = Array.prototype;
function defArrayFunc(obj, func, namespace, vm) {
  Object.defineProperty(obj, func, {
    enumerable: true,
    configurable: true,
    value: function (...args) {
      let original = arrayProto[func];
      const result = original.apply(this, args);
      // console.log(getNameSpace(namespace, ""));
      renderData(vm, getNameSpace(namespace));

      return result;
    },
  });
}

function proxyArr(vm, arr, namespace) {
  let obj = {
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
  defArrayFunc.call(vm, obj, "push", namespace, vm);
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
        renderData(vm, getNameSpace(namespace, prop));
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
        renderData(vm, getNameSpace(namespace, prop));
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
      proxyObj[i] = constructProxy(vm, obj[i], namespace);
    }
    proxyObj = proxyArr(vm, obj, namespace);
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
