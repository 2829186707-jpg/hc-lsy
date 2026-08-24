# HC & LSY · 我们的专属空间 ♥

专属于两个人的私密情侣空间网站，纯静态页面，可部署到 GitHub Pages。

## 功能特性

### 🏠 首页
- **浪漫封面** — 两人名字 + 在一起天数 + 情话语录轮播
- **重要日子倒计时** — 生日、纪念日等多个倒计时卡片
- **数据统计** — 照片、日记、心愿、留言数量一览
- **最近动态** — 最新照片和日记快速预览

### 📷 照片墙
- 拖拽/点击上传，支持多选
- 自动压缩图片（最大宽度 1280px）
- **按月份分组**展示
- 灯箱查看，支持键盘左右切换
- 照片描述和拍摄日期

### 📝 生活日记
- 图文时间线，爱心节点串联
- 支持标题、日期、8 种心情表情
- **支持插入照片**（一篇日记可附多张图）
- 区分作者（HC/LSY 不同颜色标签）
- 可编辑、可删除

### ⭐ 心愿清单
- 添加想一起完成的心愿（旅行/美食/生活/礼物/其他）
- 完成后打勾，进度条实时更新
- 未完成的心愿自动排前面

### 💌 留言板
- 给对方留悄悄话
- 5 种便签颜色可选
- 卡片式展示，悬停微旋转效果

### 🎵 背景音乐
- 上传一首属于你们的歌
- 右上角悬浮播放控件，进入网站可播放

### ⚙️ 设置
- 在一起日期设置（首页天数计算）
- 纪念日管理（多个倒计时）
- 背景音乐上传/移除
- GitHub 数据同步配置
- HC/LSY 密码修改
- 数据导出 / 清空

### 🔐 登录
- 仅 HC 和 LSY 两个账号
- 初始密码均为 `123456`，登录后可修改
- 密码经哈希存储

### 📱 响应式
- 电脑端顶部导航
- 手机端底部 Tab 导航（App 式体验）
- 完美适配各种屏幕尺寸

## 快速开始

### 本地预览
直接用浏览器打开 `index.html`，或启动本地服务器：
```bash
python -m http.server 8080
# 访问 http://localhost:8080
```

### 部署到 GitHub Pages
1. 创建 GitHub 仓库（建议设为 Private）
2. 推送所有文件到仓库
3. Settings → Pages → Source 选 `main` 分支 → 保存
4. 访问 `https://你的用户名.github.io/仓库名/`

### 配置数据同步（推荐）
配置 GitHub Token 后，所有数据自动同步到仓库，换设备不丢失：
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 生成 token，Repository access 选你的仓库，Permissions → Contents 选 Read and write
3. 在网站设置页填写仓库所有者、仓库名、Token

## 项目结构
```
hc-lsy/
├── index.html          # 主页面
├── css/style.css       # 样式（莫兰迪配色）
├── js/app.js           # 应用逻辑
├── data/app-data.json  # 云端数据（自动生成）
├── .gitignore
└── README.md
```

## 技术栈
- 纯 HTML / CSS / JavaScript，无框架依赖
- Web Crypto API（密码哈希）
- Canvas API（图片压缩）
- GitHub Contents API（数据同步）
- GitHub Pages（静态托管）

---

私人使用，仅供 HC & LSY ♥
