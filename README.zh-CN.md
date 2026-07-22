# BugPattern Gallery（失效模式展廊）

这是一个可运行的软件失效模式博物馆：每个案例把错误实现、真实复现、断言、解释与修复实现放在一起。

```bash
npm ci
npm run dev
```

打开 `http://localhost:3000`，任选展品并点击“Run exhibit”。所有案例都在浏览器内离线、确定性执行，不上传输入、不执行任意用户代码。

首发包含竞态、缓存失效、时区、浮点数、重试风暴等 10 个原创最小案例。详细架构、测试、隐私边界与贡献方式请见英文 [README](README.md)、[架构说明](docs/ARCHITECTURE.md) 和 [贡献指南](CONTRIBUTING.md)。当前状态：`v0.1.0`。
