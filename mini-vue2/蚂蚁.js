// 实现一个observer方法——要监听的对象属性可配置
// https://juejin.cn/post/7114588899661316126
function observer(obj, path, cb) {
    path.forEach((key) => {
        let value = "";
        if (key) {
            const _key = key.split(".");
            if (_key.length > 1) {
                let tmp = obj;
                // 循环，为了取到属性值，不断地赋值给 tmp
                _key.forEach((k) => {
                    // 递归，对每一个层级都进行劫持，要不然无法监听到深层级的属性值变化
                    observer(tmp, [k], cb);
                    tmp = tmp[k];
                });
                value = tmp;
            } else {
                value = obj[key];
            }

            Object.defineProperty(obj, key, {
                get() {
                    return value;
                },
                set(newV) {
                    if (newV !== value) {
                        cb && cb(newV, value);
                        value = newV;
                    }
                },
            });
        }
    });
}

var o = {
    a: 1,
    b: 2,
    c: {
        x: 1,
        y: 2,
    },
};

observer(o, ['a', "c.x"], (v, prev) => {
    console.log("newV=", v, " oldV=", prev);
});

o.a = 2; // 2, 1
o.b = 3; // 不打印
o.c.x = 3; // 3, 1
o.c.y = 3; // 没有没监听，不打印
