export function getValue(obj, name) {
  // key.a
  if (!obj) {
    return obj;
  }
  let nameList = name.split(".");
  let temp = obj;
  for (let i = 0; i < nameList.length; i++) {
    if (temp[nameList[i]]) {
      temp = temp[nameList[i]];
    } else {
      return undefined;
    }
  }
  return temp;
}

// _data = {content:'panda', desc:'aa', obj:{x:1,y:2}}
// _data, obj.x  obj.a.x
export function setValue(obj, data, value) {
  if (!obj) return;
  let attrList = data.split(".");
  let temp = obj;
  for (let i = 0; i < attrList.length - 1; i++) {
    // 到倒数第二层就停
    if (temp[attrList[i]]) {
      temp = temp[attrList[i]];
    } else {
      return undefined;
    }
  }
  if (temp[attrList[attrList.length - 1]] !== null) {
    temp[attrList[attrList.length - 1]] = value; // 获取到这个属性
  }
}

export function mergeAttr(obj1, obj2) {
  if (obj1 === null) {
    return clone(obj2);
  }
  if (obj2 == null) {
    return clone(obj1);
  }
  let result = {};
  let obj1Attrs = Object.getOwnPropertyNames(obj1);
  for (let i = 0; i < obj1Attrs.length; i++) {
    result[obj1Attrs[i]] = obj1[obj1Attrs[i]];
  }
  let obj2Attrs = Object.getOwnPropertyNames(obj2);
  for (let i = 0; i < obj2Attrs.length; i++) {
    result[obj2Attrs[i]] = obj2[obj2Attrs[i]];
  }
  return result;
}
function easyClone(obj) {
  JSON.parse(JSON.stringify(obj)); // 有局限：无法合并代理对象vm._data
}

// 经典克隆算法
function clone(obj) {
  if (obj instanceof Array) {
    return cloneArray(obj);
  } else if (obj instanceof Object) {
    return cloneObject(obj);
  } else {
    return obj;
  }
}
function cloneObject(obj) {
  let result = {};
  let names = Object.getOwnPropertyNames(obj); // 代理的属性也能访问到
  for (let i = 0; i < names.length; i++) {
    result[names[i]] = clone(obj[names[i]]); // 属性的话
  }
  return result;
}

function cloneArray(obj) {
  let result = new Array(obj.length);
  for (let i = 0; i < obj.length; i++) {
    result[i] = clone(obj[i]);
  }
  return result;
}

export function getEnvAttr(vm, vnode) {
  let result = mergeAttr(vm._data, vnode.env);
  result = mergeAttr(result, vm._computed);
  return result;
}
