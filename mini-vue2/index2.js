// 发布订阅模式
/**
 * 构造函数Dep，用于谁在依赖
 */
function Dep() {
    this.subscribes = new Set(); // 一个元素不可重复的数组，用于记录依赖
}

Dep.prototype.depend = function () {
    if (activeUpdate) {//存在
        // 将其记录到依赖数组中
        this.subscribes.add(activeUpdate);
    }
};

Dep.prototype.notify = function () {//循环之后调用
    this.subscribes.forEach((fn) => fn());
};

var activeUpdate = null; // 当前正在收集依赖的函数
/**
 * 自动运行指定的函数
 * @param {*} fn
 */
function autorun(fn) {
    activeUpdate = fn;
    fn(); // 该函数的运行期间，activeUpdate一定有值
    activeUpdate = null;
}

// test
var dep = new Dep();
autorun(() => {
    dep.depend(); // 记录依赖
    console.log("run1");
});
// --> run1
autorun(() => {
    dep.depend(); // 记录依赖
    console.log("run2");
});
// --> run2
autorun(() => {
    console.log("run3");
});
// --> run3
dep.notify(); // --> run1 run2
