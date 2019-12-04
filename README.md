# airplane
一个益智类的飞机大战小游戏

这个版本是为了适配安卓平板鞋的，因此控制按钮设计的是只能触摸（鼠标）控制，如果需要用键盘和空格控制子弹的发射的话，可以根据代码中的注释开启监听

本游戏还未解决跨域问题
  【windoes端】
   需要去Google属性中设置一个跨域允许
   
  【Mac端】
   open -n /Applications/Google\ Chrome.app/ --args --disable-web-security  --user-data-dir=/Users/用户名/Documents/MyChromeDevUserData
   注：dir后面跟个人电脑‘MyChromeDevUserData’文件所在路径，一般来说将用户名改为自己的就行了
