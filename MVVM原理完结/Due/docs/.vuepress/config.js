module.exports = {
  base: "/MVVM_Due.js/",
  title: "",
  head: [
    // 注入到当前页面的 HTML <head> 中的标签
    ["link", { rel: "icon", href: "/public/Due.js.png" }], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  themeConfig: {
    logo: "/Due.js.png", // 左上角logo
    nav: [
      // 导航栏配置
      { text: "首页", link: "/" },
      { text: "文档", link: "/due/due" },
      { text: "github", link: "https://github.com/Sunny-117/MVVM_Due.js" },
    ],
    sidebar: {
      "/learning method": [
        {
          title: "learning method",
        },
      ],
      "/FrontEnd": [
        {
          title: "FrontEnd",
          // children:['']
        },
        {
          title: "HTML CSS",
          children: [
            {
              title: "Align center",
              children: [],
            },
          ],
        },
        {
          title: "JavaScript",
        },
      ],
    },
    sidebarDepth: 2,
  },
};
