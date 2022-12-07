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
    // obj.a.x 看看有没有x
    temp[attrList[attrList.length - 1]] = value; // 获取到这个属性
  }
}
