// Dep module
// 一个副作用可能有多个依赖,一个依赖也可能有多个副作用
class Dep {
    static stack = [];
    static target = null;
    deps = null;

    constructor() {
        this.deps = new Set(); //依赖去重
    }

    depend() {
        if (Dep.target) {
            //添加依赖
            this.deps.add(Dep.target);
            console.log("副作用被添加进来了", this.deps);
        }
    }

    notify() {
        //执行属性对应的副作用
        this.deps.forEach((w) => w.update());
    }
    // 栈结构解决effect嵌套问题
    static pushTarget(t) {
        if (this.target) {
            this.stack.push(this.target);
        }
        this.target = t; //当前依赖
    }

    static popTarget() {
        this.target = this.stack.pop();
    }
}

// reactive
function reactive(o) {
    if (o && typeof o === "object") {
        Object.keys(o).forEach((k) => {
            defineReactive(o, k, o[k]); //传递形参避免无限递归
        });
    }
    return o;
}

function defineReactive(obj, k, val) {
    // 初始化容器
    let dep = new Dep();
    Object.defineProperty(obj, k, {
        //劫持
        get() {
            console.log("get");
            dep.depend();
            return val;
        },
        set(newVal) {
            console.log("set");
            val = newVal;
            dep.notify();
        },
    });
    //嵌套reactive
    if (val && typeof val === "object") {
        reactive(val);
    }
}

// watcher
class Watcher {
    constructor(effect) {
        this.effect = effect;
        this.update();
    }

    update() {
        //执行副作用触发响应式
        Dep.pushTarget(this);
        this.value = this.effect(); //执行副作用访问响应式触发get陷阱
        Dep.popTarget();
        return this.value;
    }
}

// 测试代码
const data = reactive({
    msg: "aaa",
});
// 执行构造并添加副作用
new Watcher(() => {
    new Watcher(() => {
        console.log("===> effect2", data.msg);
    });
    console.log("===> effect", data.msg);
});

  // setTimeout(() => {
  //   data.msg = "hello";
  // }, 1000);
