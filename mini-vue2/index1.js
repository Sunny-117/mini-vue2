function isObject(val) {
    return val !== null && !Array.isArray(val) && typeof val === "object";
}

/**
 * 将对象obj变为数据响应式对象
 * @param {*} obj
 */
function observe(obj) {
    if (!isObject(obj)) return
    // implement
    // 遍历对象的每一个属性
    Object.keys(obj).forEach((key) => {
        // 重新定义属性
        var internalValue = obj[key]; // 缓存该属性的值
        observe(internalValue); // 递归监听该属性
        Object.defineProperty(obj, key, {
            get() {
                console.log("get " + key + ":", internalValue);
                return internalValue;
            },
            set(val) {
                observe(val);
                internalValue = val;
                console.log("set " + key + ":", internalValue);
            },
        });
    });
}

var state = {
    name: "monica",
    addr: {
        province: "黑龙江",
        city: "哈尔滨",
    },
};

observe(state);

state.name; // --> get name: monica
state.name = "莫妮卡"; // --> set name: 莫妮卡
state.addr.province = "四川"; // --> set province: 四川
state.addr.city; // --> get city: 哈尔滨
