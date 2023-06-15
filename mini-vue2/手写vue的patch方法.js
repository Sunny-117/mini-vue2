//简单实现vue的更新方法，递归实现
function update(obj, key, value) {
    if (typeof obj !== 'object' || obj === null) {
        return;
    }
    // 递归遍历对象属性
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (typeof obj[prop] === 'object') {
                update(obj[prop], key, value); // 递归调用更新方法
            } else if (prop === key) {
                obj[prop] = value; // 更新属性值
            }
        }
    }
}

// 示例用法
const data = {
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        state: 'NY',
        country: 'USA'
    }
};

console.log('Before update:', data);
update(data, 'city', 'San Francisco');
console.log('After update:', data);
