/**
 * 判断一个值是否是一个普通对象
 * @param {*} val
 */
function isObject(val) {
  return val !== null && !Array.isArray(val) && typeof val === "object";
}

/**
 * 将对象obj变为数据响应式对象
 * @param {*} obj
 */
function observe(obj) {
  if (!isObject(obj)) {
    return; // 不处理非对象
  }
  // implement
  // 遍历对象的每一个属性
  Object.keys(obj).forEach((key) => {
    var dep = new Dep();
    // 重新定义属性
    var internalValue = obj[key]; // 缓存该属性的值
    observe(internalValue); // 递归监听该属性
    Object.defineProperty(obj, key, {
      get() {
        dep.depend(); // 看一下，是哪个函数用到了我这个属性，将该函数记录下来
        return internalValue;
      },
      set(val) {
        observe(val);
        internalValue = val;
        dep.notify(); // 通知所有用到我这个属性的函数，全部重新运行
      },
    });
  });
}

/**
 * 构造函数Dep，用于谁在依赖
 */
function Dep() {
  this.subscribes = new Set(); // 一个元素不可重复的数组，用于记录依赖
}

Dep.prototype.depend = function () {
  if (activeUpdate) {
    // 将其记录到依赖数组中
    this.subscribes.add(activeUpdate);
  }
};

Dep.prototype.notify = function () {
  this.subscribes.forEach((fn) => fn());
};

var activeUpdate = null; // 当前正在收集依赖的函数
/**
 * 自动运行指定的函数
 * @param {*} fn
 */
function autorun(fn) {
  function updateWrapper() {//防止后面的依赖收集不到，所以谈一层函数 
    activeUpdate = updateWrapper;
    fn(); // 该函数的运行期间，activeUpdate一定有值
    activeUpdate = null;
  }
  updateWrapper();
}

// test1
var state = {
  name: "monica",
  age: 18,
  addr: {
    province: "黑龙江",
    city: "哈尔滨",
  },
};

observe(state);

autorun(() => {
  console.log("年龄", state.age);
  // if (state.age % 2 !== 0) {
  //   // 年龄是奇数的时候，输出
  //   console.log(
  //     "姓名",
  //     state.name,
  //     "地址",
  //     state.addr.province,
  //     state.addr.city
  //   );
  // }
});

// --> 姓名 monica 地址 黑龙江 哈尔滨

// state.age = 19;
// state.name = "袁进";
// // --> 姓名 袁进 地址 黑龙江 哈尔滨
// state.addr.province = "四川";
// // --> 姓名 袁进 地址 四川 哈尔滨
// state.addr.city = "成都";
// // --> 姓名 袁进 地址 四川 成都


// 设置没有的属性，删除属性监控不到，所以要用$set,$delete