# 基本使用
```js
//基本实现 和 一些操作
let personName = "jojo";
let person = {};
//默认给出的值是不可枚举的
Object.defineProperty(person, "fackName", {
    get() {
        return personName + "??";
    },
    set(val) {
        personName = val;
    },
});

console.log(person.fackName); //jojo??

person.fackName = "dio";

console.log(person.fackName); //dio??

for (const key in person) {
    console.log(key); //默认不可枚举 所以forin遍历不出
}

console.log(Reflect.ownKeys(person));

Object.defineProperty(person, "enumerableName", {
    enumerable: true,
    get() {
        return personName + "??";
    },
    set(val) {
        personName = val;
    },
});

console.log(person.enumerableName);
for (const key in person) {
    console.log(key); //enumerableName
}
```

# 监听对象上的多个属性错误写法
```js
let obj = {
  name: "jojo",
  age: 18,
  sex: "male",
};
//Maximum call stack size exceeded
Object.keys(obj).forEach(function (key) {
  Object.defineProperty(obj, key, {
    get() {
      console.log('触发get')
      return obj[key]
    },
    set() {
      obj[key] = '666'//Maximum call stack size exceeded
      console.log('被修改了')
    }
  });
});
obj.name = 'dio'
console.log(obj.name)

// 原因：访问obj中的属性触发了get方法，返回obj.name,但是访问obj.name也会触发get方法，递归调用导致栈溢出

// 这里可能比较难理解的一点是 返回objkey为什么又调用了一次get
// 这里可以理解为递归,返回objkey实际上就是访问了一遍这个值然后再返回
// 如何避免呢
// 使用形参接收objkey,这样的话,就已经提前访问好了,传入的只是一个地址

```

# 监听对象上的多个属性正确
```js
// 解决方法：封装多一层函数 让其中的一个形参替代接收,不直接访问对象.属性
let obj = {
  name: "jojo",
  age: 18,
  sex: "male",
};
function receiver(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log("触发get");
      return val;
    },
    set(newVal) {
      val = newVal;
      console.log("被修改了");
    },
  });
}
Object.keys(obj).forEach(function (key) {
  receiver(obj, key, obj[key]);
});
obj.name = "dio";
console.log(obj.name);
for (const key in obj) {
  console.log("key", key);
}

```
# 深度监听一个对象
```js
// 解决方法：封装多一层函数 让其中的一个形参替代接收,不直接访问对象.属性
let obj = {
  name: "jojo",
  age: 18,
  sex: "male",
  jojoObj: {
    name: "jostar",
    age: 22,
  },
};
function receiver(obj, key, val) {
  // obj就递归
  if (typeof val === "object") {
    observer(val);
  }
  Object.defineProperty(obj, key, {
    get() {
      console.log("触发get");
      return val;
    },
    set(newVal) {
      //假如把其他类型修改成object类型 重新监听
      if (typeof newVal === "object") {
        observer(key);
      }
      console.log("被修改了");
      val = newVal;
    },
  });
}
function observer(obj) {
  //递归终点
  if (typeof obj !== "object" || obj === null) {
    return;
  }
  Object.keys(obj).forEach(function (key) {
    receiver(obj, key, obj[key]);
  });
}
observer(obj)
obj.name = {
    test:'toObj'
}
// obj.name = 'dio'
console.log(obj.name);
obj.name.test = 'jojo'

```
# 监听数组
```js
let arr = [1, 2, 3];
let obj = {}
Object.defineProperty(obj, "arr", {
  get() {
    console.log("get arr");
    return arr;
  },
  set(newVal) {
    console.log("set", newVal);
    arr = newVal;
  },
});
console.log(obj.arr); //输出get arr [1,2,3]  正常
obj.arr = [1, 2, 3, 4]; //输出set [1,2,3,4] 正常
obj.arr.push(3); //输出get arr 不正常，监听不到push

// 因为索引变了,要手动初始化才能被监听
// 在vue2中是通过重写Array原型解决这个问题

```

# 注意
```js
// 如果是原先没有的属性 默认是不可枚举不可修改不可删除的 
let person = { personName: "jojo" };
Object.defineProperty(person, "fackName", {
  //   enumerable: true,
  get() {
    return personName + "??";
  },
  set(val) {
    personName = val;
  },
});

for (const key in person) {
  console.log(key); //不可枚举不输出
}

// 但如果是现有属性 默认是可以枚举,修改,和删除的 
// let person = {personName:'jojo'};
// Object.defineProperty(person, 'personName', {
//   get() {
//     return personName + "??";
//   },
//   set(val) {
//     personName = val;
//   },
// });

// for (const key in person) {
//     console.log(key)//personName
// }

```
