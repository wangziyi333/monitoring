eventBus 
SDK内部的“事件中转站”/“发布订阅中心”
现在的collector职责过重：不仅采集点击，还判断target、判断可视化/声明式埋点是否命中、直接调用trackEvent...
解耦形态：collector只负责发出一个内部点击事实，其他订阅者各自处理自己的部分
如果变为bus风格，大概有三层内部事件：
1.原始层 如：dom:click\dom:exposure\runtime:error => 浏览器刚发生了什么
2.解析层 如：track:click:resolved\track:visual:matched\track:declarative:metched => SDK解释出了什么业务含义
3.标准事件层 如：monitor:event => 最终要进队列、进sender、进dashboard的标准事件
优点：解耦、易扩展、易测试、易调试、适合插件化
代价：链路抽象、调试要追踪、事件命名和协议要求规范

命名：
1.领域:阶段
2.领域:对象:阶段

dom:click 页面发生了一次原始dom点击
track:click:resolved 点击已被解释为某种埋点含义
monitor:event 标准化成统一MonitorEvent
monitor:event:queued 事件已进入队列

exposure resolver
和click resolver相比：
1.Map / Set ：用来记录哪些元素正在被观察、哪些已经曝光过
2.timer ：如果要做停留时长判断，就很可能有定时器
3.清理逻辑 ：leaver时取消timer、pagehide时清理、route change时清理
3.去重策略 ：防止重复曝光或决定是否允许二次曝光

click-resolver 是轻量同步解析器
exposure-resolver 是有状态过程协调器

点击resolver：这一下点击，算什么？偏语义识别、立即判断、无状态
曝光resolver：这一段可见过程，最终算不算一次曝光？偏过程协调、状态记忆、时序判断