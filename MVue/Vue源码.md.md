

## 小马哥的视频代码

### Observer

- data 监听类，主要通过 Object.defineProperty 进行属性劫持，通过 Dep 和 Watch 类进行数据的 notify 操作。
  这里需要注意的是，data 中每个子对象都对应一个 Dep，每个 v-开头的属性对应一个 Watcher，Dep 是 Watcher 的数组集合

### Compile

- 对 v-开头的属性进行编译
- 双向绑定通过 input 事件来处理的

### proxy

- 属性劫持实现获取 data 中的数据不需要写 data


# Vue的MVVM实现原理

> 相信只要你去面试vue，都会被问到vue的双向数据绑定，你要是就说个mvvm就是视图模型模型视图，只要数据改变视图也会同时更新！那你离被pass就不远了！

### 几种实现双向绑定的做法

目前几种主流的mvc(vm)框架都实现了单向数据绑定，而我所理解的双向数据绑定无非就是在单向绑定的基础上给可输入元素（input、textare等）添加了change(input)事件，来动态修改model和 view，并没有多高深。所以无需太过介怀是实现的单向或双向绑定。

实现数据绑定的做法有大致如下几种：

> 发布者-订阅者模式（backbone.js）
>
> 数据劫持（vue.js）

**发布者-订阅者模式:** 一般通过sub, pub的方式实现数据和视图的绑定监听，更新数据方式通常做法是 `vm.set('property', value)`，这里有篇文章讲的比较详细，有兴趣可点[这里](https://link.juejin.cn?target=http%3A%2F%2Fwww.html-js.com%2Farticle%2FStudy-of-twoway-data-binding-JavaScript-talk-about-JavaScript-every-day)

这种方式现在毕竟太low了，我们更希望通过 `vm.property = value`这种方式更新数据，同时自动更新视图，于是有了下面两种方式

**数据劫持:** vue.js 则是采用数据劫持结合发布者-订阅者模式的方式，通过`Object.defineProperty()`来劫持各个属性的`setter`，`getter`，在数据变动时发布消息给订阅者，触发相应的监听回调。

### MVVM原理

Vue响应式原理最核心的方法便是通过Object.defineProperty()来实现对属性的劫持，达到监听数据变动的目的，无疑这个方法是本文中最重要、最基础的内容之一

整理了一下，要实现mvvm的双向绑定，就必须要实现以下几点：

- 1、实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
- 2、实现一个指令解析器Compile，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数
- 3、实现一个Watcher，作为连接Observer和Compile的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图
- 4、mvvm入口函数，整合以上三者



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/6/9/172970655167cff7~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)



先看之前vue的功能

```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

<body>
    <div id="app">
        <h2>{{obj.name}}--{{obj.age}}</h2>
        <h2>{{obj.age}}</h2>
        <h3 v-text='obj.name'></h3>
        <h4 v-text='msg'></h4>
        <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ul>
        <h3>{{msg}}</h3>
        <div v-html='htmlStr'></div>
        <div v-html='obj.fav'></div>
        <input type="text" v-model='msg'>
        <img v-bind:src="imgSrc" v-bind:alt="altTitle">
        <button v-on:click='handlerClick'>按钮1</button>
        <button v-on:click='handlerClick2'>按钮2</button>
        <button @click='handlerClick2'>按钮3</button>
    </div>
    <script src="./vue.js"></script>
    <script>
        let vm = new MVue({
            el: '#app',
            data: {
                obj: {
                    name: '小马哥',
                    age: 19,
                    fav:'<h4>前端Vue</h4>'
                },
                msg: 'MVVM实现原理',
                htmlStr:"<h3>hello MVVM</h3>",
                imgSrc:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1568782284688&di=8635d17d550631caabfeb4306b5d76fa&imgtype=0&src=http%3A%2F%2Fh.hiphotos.baidu.com%2Fimage%2Fpic%2Fitem%2Fb3b7d0a20cf431ad7427dfad4136acaf2fdd98a9.jpg',
                altTitle:'眼睛',
                isActive:'true'

            },
            methods: {
                handlerClick() {
                    alert(1);
                    console.log(this);
                    
                },
                handlerClick2(){
                    console.log(this);
                    alert(2)
                }
            }

        })
    </script>
</body>

</html>
复制代码
```

### 实现指令解析器Compile

实现一个指令解析器Compile，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数,添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图，如图所示：

#### 初始化

新建MVue.js

```
class MVue {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        //保存 options参数,后面处理数据要用到
        this.$options = options;
        // 如果这个根元素存在则开始编译模板
        if (this.$el) {
            // 1.实现一个指令解析器compile
            new Compile(this.$el, this)
        }
    }
}
class Compile{
    constructor(el,vm) {
        // 判断el参数是否是一个元素节点,如果是直接赋值,如果不是 则获取赋值
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
    }
    isElementNode(node){
        // 判断是否是元素节点
        return node.nodeType === 1
    }
}
复制代码
```

这样外界可以这样操作

```
let vm = new Vue({
    el:'#app'
})
//or
let vm = new Vue({
    el:document.getElementById('app')
})
复制代码
```

#### **优化编译使用文档碎片**

```
<h2>{{obj.name}}--{{obj.age}}</h2>
<h2>{{obj.age}}</h2>
<h3 v-text='obj.name'></h3>
<h4 v-text='msg'></h4>
<ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
</ul>
<h3>{{msg}}</h3>
<div v-html='htmlStr'></div>
<div v-html='obj.fav'></div>
<input type="text" v-model='msg'>
<img v-bind:src="imgSrc" v-bind:alt="altTitle">
<button v-on:click='handlerClick'>按钮1</button>
<button v-on:click='handlerClick2'>按钮2</button>
<button @click='handlerClick2'>按钮3</button>
复制代码
```

> 接下来,找到子元素的值,比如obj.name,obj.age,obj.fav 找到obj 再找到fav,获取数据中的值替换掉
>
> 但是在这里我们不得不想到一个问题,每次找到一个数据替换,都要重新渲染一遍,可能会造成页面的回流和重绘,那么我们最好的办法就是把以上的元素放在内存中,在内存中操作完成之后,再替换掉.

```
class Compile {
    constructor(el, vm) {
        // 判断el参数是否是一个元素节点,如果是直接赋值,如果不是 则获取赋值
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        // 因为每次匹配到进行替换时,会导致页面的回流和重绘,影响页面的性能
        // 所以需要创建文档碎片来进行缓存,减少页面的回流和重绘
        // 1.获取文档碎片对象
        const fragment = this.node2Fragment(this.el);
        // console.log(fragment);
        // 2.编译模板
        // 3.把子元素的所有内容添加到根元素中
        this.el.appendChild(fragment);

    }
    node2Fragment(el) {
        const fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment
    }
    isElementNode(el) {
        return el.nodeType === 1;
    }
}
复制代码
```

这时候会发现页面跟之前没有任何变化,但是经过Fragment的处理,优化页面渲染性能

#### **编译模板**

```
// 编译数据的类
class Compile {
    constructor(el, vm) {
        // 判断el参数是否是一个元素节点,如果是直接赋值,如果不是 则获取赋值
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        // 因为每次匹配到进行替换时,会导致页面的回流和重绘,影响页面的性能
        // 所以需要创建文档碎片来进行缓存,减少页面的回流和重绘
        // 1.获取文档碎片对象
        const fragment = this.node2Fragment(this.el);
        // console.log(fragment);
        // 2.编译模板
        this.compile(fragment)

        // 3.把子元素的所有内容添加到根元素中
        this.el.appendChild(fragment);

    }
    compile(fragment) {
        // 1.获取子节点
        const childNodes = fragment.childNodes;
        // 2.遍历子节点
        [...childNodes].forEach(child => {

            // 3.对子节点的类型进行不同的处理
            if (this.isElementNode(child)) {
                // 是元素节点
                // 编译元素节点
                // console.log('我是元素节点',child);
                this.compileElement(child);
            } else {
                // console.log('我是文本节点',child);
                this.compileText(child);
                // 剩下的就是文本节点
                // 编译文本节点
            }
            // 4.一定要记得,递归遍历子元素
            if (child.childNodes && child.childNodes.length) {
                this.compile(child);
            }
        })
    }
    // 编译文本的方法
    compileText(node) {
        console.log('编译文本')

    }
    node2Fragment(el) {
        const fragment = document.createDocumentFragment();
        // console.log(el.firstChild);
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment
    }
    isElementNode(el) {
        return el.nodeType === 1;
    }
}
复制代码
```

接下来根据不同子元素的类型进行渲染

#### 编译元素

```
compileElement(node) {
    // 获取该节点的所有属性
    const attributes = node.attributes;
    // 对属性进行遍历
    [...attributes].forEach(attr => {
        const { name, value } = attr; //v-text v-model   v-on:click  @click 
        // 看当前name是否是一个指令
        if (this.isDirective(name)) {
            //对v-text进行操作
            const [, directive] = name.split('-'); //text model html
            // v-bind:src
            const [dirName, eventName] = directive.split(':'); //对v-on:click 进行处理
            // 更新数据
            compileUtil[dirName] && compileUtil[dirName](node, value, this.vm, eventName);
            // 移除当前元素中的属性
            node.removeAttribute('v-' + directive);

        }else if(this.isEventName(name)){
            // 对事件进行处理 在这里处理的是@click
            let [,eventName] =  name.split('@');
            compileUtil['on'](node, value, this.vm, eventName)
        }

    })

}
// 是否是@click这样事件名字
isEventName(attrName){
    return attrName.startsWith('@')
}
//判断是否是一个指令
isDirective(attrName) {
    return attrName.startsWith('v-')
}
复制代码
```

#### 编译文本

```
// 编译文本的方法
compileText(node) {
    const content = node.textContent;
    // 匹配{{xxx}}的内容
    if (/\{\{(.+?)\}\}/.test(content)) {
        // 处理文本节点
        compileUtil['text'](node, content, this.vm)
    }

}
复制代码
```

大家也会发现,`compileUtil`这个对象它是什么鬼?真正的编译操作我将它放入到这个对象中,根据不同的指令来做不同的处理.比如v-text是处理文本的 v-html是处理html元素 v-model是处理表单数据的.....

这样我们在当前对象`compileUtil`中通过updater函数来初始化视图

#### **处理元素/处理文本/处理事件....**

```
const compileUtil = {
    // 获取值的方法
    getVal(expr, vm) {
        return expr.split('.').reduce((data, currentVal) => {
            return data[currentVal]
        }, vm.$data)
    },
    getAttrs(expr,vm){

    },
    text(node, expr, vm) { //expr 可能是 {{obj.name}}--{{obj.age}} 
        let val;
        if (expr.indexOf('{{') !== -1) {
            // 
            val = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                return this.getVal(args[1], vm);
            })
        }else{ //也可能是v-text='obj.name' v-text='msg'
            val = this.getVal(expr,vm);
        }
        this.updater.textUpdater(node, val);
    },
    html(node, expr, vm) {
        // html处理 非常简单 直接取值 然后调用更新函数即可
        let val = this.getVal(expr,vm);
        this.updater.htmlUpdater(node,val);
    },
    model(node, expr, vm) {
        const val = this.getVal(expr,vm);
        this.updater.modelUpdater(node,val);
    },
    // 对事件进行处理
    on(node, expr, vm, eventName) {
        // 获取事件函数
        let fn = vm.$options.methods && vm.$options.methods[expr];
        // 添加事件 因为我们使用vue时 都不需要关心this的指向问题,这是因为源码的内部帮咱们处理了this的指向
        node.addEventListener(eventName,fn.bind(vm),false);
    },
    // 绑定属性 简单的属性 已经处理 类名样式的绑定有点复杂 因为对应的值可能是对象 也可能是数组 大家根据个人能力尝试写一下
    bind(node,expr,vm,attrName){
        let attrVal = this.getVal(expr,vm);
        this.updater.attrUpdater(node,attrName,attrVal);
    },
    updater: {
        attrUpdater(node, attrName, attrVal){
            node.setAttribute(attrName,attrVal);
        },
        modelUpdater(node,value){
            node.value = value;
        },
        textUpdater(node, value) {

            node.textContent = value;

        },
        htmlUpdater(node,value){
            node.innerHTML = value;
        }
    }

}
复制代码
```

> 通过以上操作:我们实现了一个编译器compile,用它来解析指令,通过updater初始化视图

### 实现一个数据监听器Observer

ok, 思路已经整理完毕，也已经比较明确相关逻辑和模块功能了，let's do it 我们知道可以利用`Obeject.defineProperty()`来监听属性变动 那么将需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上 `setter`和`getter` 这样的话，给这个对象的某个值赋值，就会触发`setter`，那么就能监听到了数据变化。。相关代码可以是这样：

```
//test.js
let data = {name: 'kindeng'};
observe(data);
data.name = 'dmq'; // 哈哈哈，监听到值变化了 kindeng --> dmq

function observe(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    // 取出所有属性遍历
    Object.keys(data).forEach(function(key) {
        defineReactive(data, key, data[key]);
    });
};

function defineReactive(data, key, val) {
    observe(val); // 监听子属性
    Object.defineProperty(data, key, {
        enumerable: true, // 可枚举
        configurable: false, // 不能再define
        get: function() {
            return val;
        },
        set: function(newVal) {
            console.log('哈哈哈，监听到值变化了 ', val, ' --> ', newVal);
            val = newVal;
        }
    });
}
复制代码
```



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/6/9/1729707844e00322~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)



再看这张图,我们接下来实现的是一个数据监听器Observer,能够对数据对象的所有属性进行监听，如有变动可拿到最新值通知依赖收集对象(Dep)并通知订阅者(Watcher)来更新视图

```
// 创建一个数据监听者  劫持并监听所有数据的变化
class Observer{
    constructor(data) {
        this.observe(data);
    }
    observe(data){
        // 如果当前data是一个对象才劫持并监听
        if(data && typeof data === 'object'){
            // 遍历对象的属性做监听
            Object.keys(data).forEach(key=>{
                this.defineReactive(data,key,data[key]);
            })
            
        }
    }
    defineReactive(obj,key,value){
        // 循环递归 对所有层的数据进行观察
        this.observe(value);//这样obj也能被观察了
        Object.defineProperty(obj,key,{
            get(){
                return value;
            },
            set:(newVal)=>{
                if (newVal !== value){
                    // 如果外界直接修改对象 则对新修改的值重新观察
                    this.observe(newVal);
                    value = newVal;
                    // 通知变化
                    dep.notify();
                }
            }
        })
    }
}
复制代码
```

这样我们已经可以监听每个数据的变化了，那么监听到变化之后就是怎么通知订阅者了，所以接下来我们需要实现一个消息订阅器，很简单，维护一个数组，用来收集订阅者，数据变动触发notify，再调用订阅者的update方法，代码改善之后是这样：

**创建Dep**

- 添加订阅者
- 定义通知的方法

```
class Dep{
    constructor() {
        this.subs = []
    }
    // 添加订阅者
    addSub(watcher){
        this.subs.push(watcher);
 
    }
    // 通知变化
    notify(){
        // 观察者中有个update方法 来更新视图
        this.subs.forEach(w=>w.update());
    }
}
复制代码
```

虽然我们已经创建了Observer,Dep(订阅器),那么问题来了，谁是订阅者？怎么往订阅器添加订阅者？

没错，上面的思路整理中我们已经明确订阅者应该是Watcher, 而且`const dep = new Dep();`是在 `defineReactive`方法内部定义的，所以想通过`dep`添加订阅者，就必须要在闭包内操作，所以我们可以在 `getOldVal`里面动手脚：

### 实现一个Watcher

它作为连接Observer和Compile的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图

只要所做事情:

1、在自身实例化时往属性订阅器(dep)里面添加自己

2、自身必须有一个update()方法

3、待属性变动dep.notify()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。

```
//Watcher.js
class Watcher{
    constructor(vm,expr,cb) {
        // 观察新值和旧值的变化,如果有变化 更新视图
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        // 先把旧值存起来  
        this.oldVal = this.getOldVal();
    }
    getOldVal(){
        Dep.target = this;
        let oldVal = compileUtil.getVal(this.expr,this.vm);
        Dep.target = null;
        return oldVal;
    }
    update(){
        // 更新操作 数据变化后 Dep会发生通知 告诉观察者更新视图
        let newVal = compileUtil.getVal(this.expr, this.vm);
        if(newVal !== this.oldVal){
            this.cb(newVal);
        }
    }
}

//Observer.js
defineReactive(obj,key,value){
    // 循环递归 对所有层的数据进行观察
    this.observe(value);//这样obj也能被观察了
    const dep = new Dep();
    Object.defineProperty(obj,key,{
        get(){
            //订阅数据变化,往Dep中添加观察者
            Dep.target && dep.addSub(Dep.target);
            return value;
        },
        //....省略
    })
}
复制代码
```

当我们修改某个数据时,数据已经发生了变化,但是视图没有更新



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/6/9/1729707c446b3a68~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)



我们在什么时候来添加绑定watcher呢,继续看图



![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/6/9/1729707ec99df077~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)



也就是说,当我们订阅数据变化时,来绑定更新函数,从而让watcher去更新视图

修改

```
// 编译模板工具类
const compileUtil = {
    // 获取值的方法
    getVal(expr, vm) {
        return expr.split('.').reduce((data, currentVal) => {
            return data[currentVal]
        }, vm.$data)
    },
    //设置值
    setVal(vm,expr,val){
        return expr.split('.').reduce((data, currentVal, index, arr) => {
            return data[currentVal] = val
        }, vm.$data)
    },
    //获取新值 对{{a}}--{{b}} 这种格式进行处理
    getContentVal(expr, vm) {
        return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getVal(args[1], vm);
        })
    },
    text(node, expr, vm) { //expr 可能是 {{obj.name}}--{{obj.age}} 
        let val;
        if (expr.indexOf('{{') !== -1) {
            // 
            val = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                //绑定watcher从而更新视图
                new Watcher(vm,args[1],()=>{           
                    this.updater.textUpdater(node,this.getContentVal(expr, vm));
                })
                return this.getVal(args[1], vm);
            })
        }else{ //也可能是v-text='obj.name' v-text='msg'
            val = this.getVal(expr,vm);
        }
        this.updater.textUpdater(node, val);

    },
    html(node, expr, vm) {
        // html处理 非常简单 直接取值 然后调用更新函数即可
        let val = this.getVal(expr,vm);
        // 订阅数据变化时 绑定watcher,从而更新函数
        new Watcher(vm,expr,(newVal)=>{
            this.updater.htmlUpdater(node, newVal);
        })
        this.updater.htmlUpdater(node,val);
    },
    model(node, expr, vm) {
        const val = this.getVal(expr,vm);
        // 订阅数据变化时 绑定更新函数 更新视图的变化

        // 数据==>视图
        new Watcher(vm, expr, (newVal) => {
            this.updater.modelUpdater(node, newVal);
        })
        // 视图==>数据
        node.addEventListener('input',(e)=>{
            // 设置值
            this.setVal(vm,expr,e.target.value);

        },false);
        this.updater.modelUpdater(node,val);
    },
    // 对事件进行处理
    on(node, expr, vm, eventName) {
        // 获取事件函数
        let fn = vm.$options.methods && vm.$options.methods[expr];
        // 添加事件 因为我们使用vue时 都不需要关心this的指向问题,这是因为源码的内部帮咱们处理了this的指向
        node.addEventListener(eventName,fn.bind(vm),false);
    },
    // 绑定属性 简单的属性 已经处理 类名样式的绑定有点复杂 因为对应的值可能是对象 也可能是数组 大家根据个人能力尝试写一下
    bind(node,expr,vm,attrName){
        let attrVal = this.getVal(expr,vm);
        this.updater.attrUpdater(node,attrName,attrVal);
    },
    updater: {
        attrUpdater(node, attrName, attrVal){
            node.setAttribute(attrName,attrVal);
        },
        modelUpdater(node,value){
            node.value = value;
        },
        textUpdater(node, value) {
            node.textContent = value;
        },
        htmlUpdater(node,value){
            node.innerHTML = value;
        }
    }

}
复制代码
```

### 代理proxy

我们在使用vue的时候,通常可以直接vm.msg来获取数据,这是因为vue源码内部做了一层代理.也就是说把数据获取操作vm上的取值操作 都代理到vm.$data上

```
class Vue {
    constructor(options) {
        this.$data = options.data;
        this.$el = options.el;
        this.$options = options
        // 如果这个根元素存在开始编译模板
        if (this.$el) {
            // 1.实现一个数据监听器Observe
            // 能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
            // Object.definerProperty()来定义
            new Observer(this.$data);

            // 把数据获取操作 vm上的取值操作 都代理到vm.$data上
            this.proxyData(this.$data);
            
            // 2.实现一个指令解析器Compile
            new Compiler(this.$el, this);

        }
    }
    // 做个代理
    proxyData(data){
       for (const key in data) {
          Object.defineProperty(this,key,{
              get(){
                  return data[key];
              },
              set(newVal){
                  data[key] = newVal;
              }
          })
       }
    }
}
复制代码
```

### 面试题

阐述一下你所理解vue的MVVM响应式原理

vue.js 则是采用数据劫持结合发布者-订阅者模式的方式，通过`Object.defineProperty()`来劫持各个属性的`setter`，`getter`，在数据变动时发布消息给订阅者，触发相应的监听回调。

MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果


![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/6/9/17297083977dad4d~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)



