# UI Spec：学情报告 & 自定义能力

> 基于 Design Brief 输出，组件采用 HeroUI v3。覆盖主界面、顶部栏报告中心入口、报告中心侧栏（列表态）、报告详情，以及 loading / empty / error 三态与桌面端 / 移动端适配。

---

## 0. 全局规范

### 字体层级
- 页面标题 / Modal 标题：20px / semibold
- 卡片标题、报告模块标题：16px / semibold
- 正文：14px / regular
- 次要说明、元信息：12px / regular，次级文字色
- 大数值（指标）：24px / semibold

### 间距
- 基础栅格：8px
- 卡片内边距：桌面 24px，移动 16px
- 模块间距：16px（紧凑）/ 24px（区块）
- 表单字段间距：16px
- 按钮组间距：8px

### 圆角
- 卡片 / Modal / Drawer：12px
- 输入框 / Select / 按钮：8px
- Chip / 标签：full（胶囊）
- Skeleton 占位块：4px

### 适配断点
- 桌面端：≥ 1024px
- 移动端：< 768px

---

## 1. AI 学情主界面

### 布局
- 整体纵向：顶部栏（固定）+ 对话流区（可滚动）+ 底部输入区（固定）。
- 顶部栏高度：桌面 / 移动均为 56px，1px 底分隔线；左侧产品标识，右侧报告中心入口。
- 对话流内容居中，桌面端最大宽度 720px；移动端左右 12px 边距、内容占满。
- 输入区固定底部，桌面端高度约 80px，移动端约 72px。

### 组件结构
```
MainScreen
  HeadBar (固定，56px)
    Brand (AI 标识 + 产品名)
    ReportCenterEntry (右侧入口)
  ChatStream (可滚动)
    AgentReplyCard
    ReportCard (解析中 / 已完成)
  InputBar (固定底部)
    TemplateSelect
    AnalysisInput
    SubmitButton
```

### 顶部栏报告中心入口（ReportCenterEntry）
```
HeadBar (右侧)
  Button(ghost)
    Icon: 列表 / 文档 图标 (16px)
    Label: 报告中心            ← 桌面端显示文字；移动端可仅 icon
    Badge: 报告数量 (可选)     ← 附在图标右上角
```
- 位置：顶部栏最右侧；与产品标识左右对齐。
- 尺寸：高度 32px（`Button` size sm），icon 16px，文字 14px。
- 图标与文字间距 6px；Badge 数字 12px，胶囊圆角。
- 默认 ghost 样式；hover 浅色填充；侧栏处于列表态时入口呈**激活态**（强调色文字 / 浅强调底）。
- 点击：展开右侧侧栏并进入「列表态」；再次点击或关闭侧栏 → 收起。

### 组件映射
- 对话气泡 / 报告卡片：HeroUI `Card`
- 模版选择：HeroUI `Select` / `Combo Box`
- 分析对象输入：HeroUI `Combo Box` / `Autocomplete` / `Tag Group`
- 时间范围：HeroUI `Date Range Picker`
- 提交 / 下载：HeroUI `Button`
- 状态标签（已完成 / 解析中）：HeroUI `Chip`
- 查看提示：HeroUI `Tooltip`

### ReportCard（已完成）结构
```
Card
  CardHeader
    FileIcon + Title (本周学情报告)
    Chip: 已完成
  CardBody
    Meta: 生成于 … · html / pdf / word
  CardFooter
    Button(ghost): 查看
    Button: 下载
```
- 卡片内边距：桌面 24px / 移动 16px；标题与元信息间距 8px；Footer 与正文间距 16px。
- 已完成卡片可点击（hover 浅色填充）；解析中卡片不可点击。

---

## 2. 报告中心侧栏（列表态）

> 点击顶部栏「报告中心」入口后展开的右侧侧栏，集中展示历史报告。与报告详情**共用同一侧栏容器**：列表态 ⇄ 详情态可相互切换。桌面端为右侧分栏（可拖拽宽度），移动端为全屏 overlay。

### 布局
- 桌面端：右侧侧栏，默认宽度约占视口 35%（可拖拽 20%~80%），左侧 1px 分隔线。
- 移动端：自顶部 / 全屏 overlay 占满。
- 纵向排列：标题栏 → （可选）搜索 / 筛选 → 报告列表（可滚动）。

### 组件结构
```
ReportCenterPanel (列表态)
  Header (56px)
    Title: 报告中心
    Badge: 报告数量 (可选)
    CloseButton
  Toolbar (可选)
    SearchField (按标题检索)
    Tabs / Select (按状态 / 模版筛选)
  ListBody (可滚动)
    ReportListItem ×N
```

### 组件映射
- 容器：右侧分栏（桌面）/ 全屏 overlay（移动），与报告详情共用
- 列表：HeroUI `List Box` 或 `Card` 列表
- 列表搜索：HeroUI `Search Field`
- 列表筛选：HeroUI `Tabs`（下划线）/ `Select` / `Tag Group`
- 列表项状态：HeroUI `Chip`
- 数量标识：HeroUI `Badge`
- 关闭：HeroUI `Close Button`

### ReportListItem（列表项）结构
```
ListItem (可点击行)
  Left
    FileIcon (20px)
  Main
    Title (本周学情报告)              ← 14px / medium，单行省略
    Meta: 生成于 2026-06-16 · PDF     ← 12px 次级文字色
  Right
    Chip: 已完成 / 解析中 / 失败       ← 状态色
    ChevronRight (12px，仅已完成显示)
```
- 列表项高度：约 64px；左右内边距 16px；图标与文本间距 12px。
- 列表项之间 1px 分隔线或 8px 间距（二选一，保持与详情风格一致）。
- **已完成**：整行可点击，hover 浅色填充，右侧显示进入箭头；点击 → 切换为该报告详情态。
- **解析中**：状态 Chip + 行内 `Progress Circle`（16px），整行不可点击。
- **失败**：危险色 Chip，整行不可点击（如需重试，复用主界面失败态路径）。
- 排序：按生成时间倒序，最新在上。

---

## 3. 报告详情

> 桌面端使用居中 `Modal`，移动端使用底部 / 全屏 `Drawer`。在 ClassIn 内打开。
> 从报告中心进入时，承载于右侧侧栏（详情态），标题栏额外提供「返回列表」入口。

### 布局
- 桌面端 Modal：宽 860px，最大高度 600px，body 可滚动。
- 移动端 Drawer：占满屏幕宽度，自底部弹出，保留顶部安全区。
- 纵向排列：标题栏 → Tabs → 指标区 → 图表区 → 文字分析。
- 模块间距 24px，指标卡片之间 16px。

### 组件结构
```
Modal / Drawer
  Header
    BackButton: 返回列表        ← 仅「自报告中心进入」时显示（icon-only 返回箭头）
    FileIcon + Title + Chip(日期)
    Button: 下载
    CloseButton
  Tabs (总览 / 知识点分析 / 学生详情)
  Body (可滚动)
    StatCardGroup
      StatCard ×3 (数值 + 标签 + Chip)
    ChartCard
    AnalysisCard (分析摘要文字)
```

### 组件映射
- 容器：HeroUI `Modal`（桌面）/ `Drawer`（移动）/ 右侧侧栏（自报告中心进入）
- 返回列表：HeroUI `Button`（icon-only，返回箭头，仅自报告中心进入时显示）
- 关闭：HeroUI `Close Button`
- 模块切换：HeroUI `Tabs`（下划线样式）
- 指标卡片：HeroUI `Card`
- 状态 / 趋势标签：HeroUI `Chip`
- 下载：HeroUI `Button`
- 指标提示：HeroUI `Tooltip`

### 规格
- 标题栏高度：桌面 64px，1px 底分隔线。
- 「返回列表」按钮位于标题栏最左侧，icon 16px；点击后回到报告中心列表态当前浏览位置。
- Tabs：下划线样式，无背景填充；激活态使用强调色。
- 指标区：桌面 3 列 `Grid`，移动端 2 列；指标数值 24px / semibold。
- 图表区卡片：full-width，高度 ≥ 200px。

---

## 4. 状态规范

### Loading（解析中）
- **报告卡片**：标题行展示 `Progress Circle`（桌面 24px / 移动 20px）+ 文案「正在生成学情报告…」；正文用 3 行 `Skeleton`（宽度 100% / 80% / 50%，高度 12px，间距 8px，圆角 4px）。
- **报告详情**：指标卡片以 `Skeleton` 占位（数值块 + 标签块）；图表区居中 `Progress Circle`（32px）+ 文案「报告生成中，请稍候…」。
- 卡片不可点击；前端轮询后端状态，完成后切换为静态入口。

### Empty（空状态）
- 出现位置：暂无任何报告时的对话流 / 列表区。
- 结构：居中占位（min-height 200px）
  - 图标：轮廓文档图标 40×40，三级文字色。
  - 主文案：「暂无报告」14px 次级文字色，居中。
  - 辅助文案：「选择模版并填写分析内容，生成你的第一份学情报告。」12px 三级文字色，max-width 240px，居中。
- 无边框 / 卡片包裹；引导用户聚焦底部输入区。

### Error（错误）
- 触发：Agent 解析 / 生成失败，或下载失败。
- 组件：HeroUI `Alert`（行内）/ `Alert Dialog`（阻断性）。
- 结构：
  - 图标：警示图标（危险色）。
  - 主文案：「报告生成失败」16px / semibold，危险色。
  - 辅助文案：「Agent 生成过程中遇到错误，请重试或联系管理员。」14px 次级文字色。
  - 操作：`Button` 重新生成（primary）+ `Button` 关闭（ghost）。
- 失败态必须提供**重试**入口，重试回到提交步骤。

### 报告中心列表三态
- **加载中**：列表区以 3–6 条 `Skeleton` 列表项占位（每条含图标块 + 标题块 + 元信息块），或居中 `Spinner`；标题栏正常显示。
- **空状态**：列表区居中占位（min-height 200px）
  - 图标：轮廓文档图标 40×40，三级文字色。
  - 主文案：「暂无报告」14px 次级文字色，居中。
  - 辅助文案：「生成你的第一份学情报告后，会在这里集中展示。」12px 三级文字色，max-width 240px，居中。
- **错误**：列表区行内 `Alert`（危险色）+ 文案「报告列表加载失败」+ `Button` 重试。

---

## 5. 桌面端 / 移动端适配

| 维度 | 桌面端 | 移动端 |
| --- | --- | --- |
| 对话流宽度 | 居中，最大 720px | 占满，左右 12px 边距 |
| 卡片内边距 | 24px | 16px |
| 顶部栏高度 | — / Modal 64px | 56px / Drawer 顶部安全区 |
| 报告详情容器 | 居中 `Modal`（860px） | 底部 / 全屏 `Drawer`（占满宽） |
| 报告中心入口 | icon + 文字「报告中心」 | 优先 icon-only（可省略文字） |
| 报告中心侧栏 | 右侧分栏（约 35%，可拖拽） | 全屏 overlay（占满宽） |
| 列表项 | 行高约 64px，hover 反馈 | 行高约 64px，点击反馈 |
| 指标区列数 | `Grid` 3 列 | `Grid` 2 列 |
| 输入区 | 输入框 + 行内提交按钮 | 输入框 + 全宽提交按钮 |
| 操作按钮 | 文字按钮 | 优先 icon-only，节省空间 |
| Progress Circle | 24–32px | 20px |

---

## 6. 组件汇总（HeroUI）

| 用途 | HeroUI 组件 |
| --- | --- |
| 卡片 / 容器 | `Card` |
| 报告详情容器 | `Modal` / `Drawer` |
| 报告中心入口 | `Button` + `Badge` |
| 报告列表 | `List Box` / `Card` |
| 列表搜索 / 筛选 | `Search Field` / `Tabs` / `Select` / `Tag Group` |
| 返回列表 | `Button`（icon-only） |
| 模块切换 | `Tabs` |
| 模版选择 | `Select` / `Combo Box` |
| 分析对象输入 | `Combo Box` / `Autocomplete` / `Tag Group` |
| 时间范围 | `Date Range Picker` |
| 输入与校验 | `Form` / `Text Field` / `Text Area` |
| 操作按钮 | `Button` / `Button Group` |
| 状态 / 趋势标签 | `Chip` |
| 提示 | `Tooltip` |
| 加载态 | `Skeleton` / `Spinner` / `Progress Circle` |
| 反馈 | `Toast` / `Alert` / `Alert Dialog` |
| 关闭 | `Close Button` |
| 文件类型选择 | `Dropdown` / `Select` |
