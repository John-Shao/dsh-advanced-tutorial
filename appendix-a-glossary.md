# 附录 A 进阶术语表

[返回目录](README.md)

本表以官方术语表 `docs/glossary.zh.md`（英文对照 `docs/glossary.md`）为基准，聚合同一概念的分散词条，并补上正文反复使用而官方表未收录的机制词。**中文术语**是全书统一译法，英文原词才是检索键；方括号链接指向讲透该术语的章节；行号会漂移，找不到就按符号名检索。

## A.1 内核与作用域

作用域类术语决定"谁看得见这条注册"，内核类术语决定"它何时活、何时彻底死"。

- **作用域** — scope — 按 agent 划分的注册单位：贡献（工具、提示词段、变量、限制、监听器）要么全局可见，要么归属恰好一个 scope key。扁平两层是 harness 约定而非机制上限（`scopeParents`/`rebind` 支持多层），约定本身是不向 subagent 继承。[第4章](04-scope-agent-world.md)
- **作用域键** — scope key — scope 的不透明标识，按对象同一性比较；约定是一个活跃的 agent 就是它自身 scope 的 key。[第4章](04-scope-agent-world.md)
- **agent 上下文** — `agent.ctx` — agent 的带作用域上下文：经它注册同时具备 scope 可见性与 scope 生命周期（同一事实驱动两者），其上监听器参与该 agent 的过滤分发。[第4章](04-scope-agent-world.md)
- **作用域载体** — scope carrier — 过滤分发携带的 `thisArg`，由 `scopeTarget(base, key)` 构建：放行无标签监听器加主体自己的监听器；无主体的载体只放行无标签监听器。[第4章](04-scope-agent-world.md)
- **作用域分发** — scoped dispatch — 关于某个 agent 的活动以该 agent 的 carrier 分发；`packages/core/agent/src/dispatch.ts` 让 scope key 与载荷里的 `agent` 不可能分叉。[第4章](04-scope-agent-world.md)
- **注册表主体事件** — registry-subject event — 关于注册表本身的事件（"一个工具被添加了"）不属于任何 agent，按自身约定保持不过滤。[第3章](03-effects-services-events.md)
- **遮蔽** — shadowing — 最具体者胜出的名称解析：带作用域的项只在该 scope 内替换同名全局项（`packages/core/scope/src/store.ts`）。[第16章](16-low-code-customization.md)
- **限制** — restriction — `ctx.tools.restrict` 为单个 scope 过滤**全局**工具集合，多个取交集；作用域本地注册在过滤后合并。被过滤掉的全局工具不进提示词也拒绝执行。[第7章](07-tool-pipeline.md)
- **设置窗口** — setup window — 组装 agent 作用域环境的时隙（`CreateAgentOptions.setup`）：scope 与 agent 已存在，但尚未发布、`agent/created` 未触发。setup 只注册，不驱动。[第5章](05-composition-root.md)
- **血统** — lineage — 以数据携带的父子事实（`parentSession`、持久 `delegationDepth`、运行时 `subagentDepth`），从不影响可见性。[第4章](04-scope-agent-world.md)
- **纪元** — epoch — Cordis 把依赖变成顺序的指纹：`_refresh()` 把每个注入的 provider fiber 的 `uid` 拼成字符串，缺一个即 `INACTIVE`（`vendor/cordis/src/fiber.ts:611`）。没有 `dependsOn`，也没有拓扑排序。[第2章](02-cordis-kernel.md)
- **惯性** — inertia — fiber 一次加载或卸载的在途 Promise（`vendor/cordis/src/fiber.ts:200`）：存在期间新纪元变更不重启自己；它链式传播，一个卡住的 disposer 拖住整棵子树。[第2章](02-cordis-kernel.md)
- **静默** — quiescence — 生命周期工作全部结算后的状态，而非"已发出清理请求"：仍可观察的自启工作必须被 await。[第18章](18-debugging-performance.md)
- **易变字段** — volatile — schema 上标 `.volatile()` 的字段：值变化只提交进运行中的引用并发一条实例本地 `loader/volatile-update`，不重挂插件。[第16章](16-low-code-customization.md)
- **领域与隔离** — realm / isolate — Loader 用 `Realm` 把服务名映射为带后缀 symbol：`LocalRealm` 按条目隔离、`GlobalRealm` 按标签共享（`vendor/loader/src/config/isolate.ts`）。故 preset 内 service 行必须带 realm。[第16章](16-low-code-customization.md)

## A.2 循环层级

嵌套是交互段 ⊃ 轮次 ⊃ 步骤；"回合"是策略侧的外层计数。不要用"迭代""循环"泛指其中任何一个。

- **轮次** — turn — 会话中一次对已接纳输入的排空，在模型及其工具停止工作或终止策略介入后结束。[第6章](06-agent-loop.md)
- **步骤** — step — 一次模型请求加上由该响应引发的工具执行；一个轮次含零个或多个步骤。[第6章](06-agent-loop.md)
- **回合** — round — 承载一个轮次的外层**策略**迭代，如一个 Goal Round 或一次全新 agent 的 Ralph 尝试；计数器归该策略所有，不统计会话里的每个轮次。[第13章](13-seams-execution-world.md)
- **交互段** — exchange — 连续若干轮次：从首个步骤认领真人输入的轮次起，到下一个这样的轮次为止；被通知唤醒的轮次归入前一段。[第15章](15-platform-surfaces.md)
- **预备调用** — prepared call — `ctx.llm.prepareCall()` 把同一次注册的适配器与解析元数据绑定为一次调用的凭证；循环在提交系统提示词与已接纳用户之前绑定它。[第14章](14-llm-adapter.md)
- **瀑布** — waterfall — 围绕末端 `next` 的组合中间件：调 `next()` 才把可被包裹的结果交给下一层，不调而返回是有意的短路。[第3章](03-effects-services-events.md)
- **短路** — bail — 遇到首个同步 bail 值即停止派发链；不做包裹，返回值决定链是否停。[第3章](03-effects-services-events.md)
- **串行** — serial — 按注册顺序 await 监听器直到某个返回 bail 值，链上没有 `next()`；`agent/turn-stopping` 就是 serial。[第6章](06-agent-loop.md)
- **Ralph 循环／回合／交接** — Ralph loop / round / handoff — 循环是一次面向不可变目标的前台全新 agent 工作流运行，即组合出的工具策略而非同会话目标或调度器；回合是其中一个不收对话种子的全新子会话；交接是传给下一回合的有界结构化报告，补充而非取代共享工作区。[第13章](13-seams-execution-world.md)

## A.3 能力接缝

- **接缝** — seam — 包含三种角色的**可替换能力**：Service Definition（拥有自身 `ctx.<key>` 与词汇类型的 Cordis `Service`，是抽象类或具体注册表，绝不是 TypeScript `interface`）、一个或多个 Provider、一个或多个 Consumer。接缝是完整能力而非某个角色；范例 `packages/shell`。[第13章](13-seams-execution-world.md)
- **三角色的分工** — Definition / Provider / Consumer — Definition 声明形状与不变量；Provider 在一个 context 内整体替换实现；Consumer 只经 `ctx.*` 访问；一个包可兼多角色（`dsh-user-approval`）。[第12章](12-capability-package.md)
- **执行世界** — execution world — `ctx.fs`／`ctx.subprocess`／`ctx.shell`／`ctx.terminals`／`ctx.sandbox` 共同回答"文件、进程、命令、终端、限制各在哪"，不变量是同一个世界、整体切换（`docs/architecture.md:138`）。[第13章](13-seams-execution-world.md)
- **单调守卫** — monotonic guard — `ctx.tools.guard()` 注册的最终派发前策略：在**每个** `tools/pre-execute` 之后、工具主体之前求值，返回理由即拒绝。返回类型没有 allow 分支，故监听器顺序无法把拒绝翻回许可。[第7章](07-tool-pipeline.md)

## A.4 会话与持久化

- **表面** — surface — 日志派生的有序模型可见历史。只有产生消息的 `SurfaceEventType` 能上表面且必须声明 `surfaceOp`；`replace` 遮蔽 `startSeq`..`endSeq` 的现有节点并插入新节点。[第8章](08-session-log.md)
- **仅持久** — log-only durable — 写进日志、跨重启存活，但不产生模型消息、不带表面元数据的事件，如 `assistant/attempt`、`request/header`。[第8章](08-session-log.md)
- **可忽略事件** — ignorable — 事件上的 `ignorable: true`：不认识该类型的读取者可跳过并继续正确工作，插件记录属此类；无此标记的未知事件阻止无损重建。[第17章](17-session-format-evolution.md)
- **撕裂尾** — torn tail — 崩溃留下的**物理**残片（属于一次从未落定的追加）：绝不交给读取者，写路径在自身首次追加前截断它。不同于"未闭合的中断轮次"这一逻辑缺口。[第8章](08-session-log.md)
- **独占发布** — exclusive publication — 整代制品的落地方式：编码、校验，再在未改动的源文件旁一次性发布版本命名文件；已提交的代路径绝不改动。[第17章](17-session-format-evolution.md)
- **会话投影** — session projection — `ctx.sessionProjections` 注册的状态驱动折叠单元：框架驱动（注册表订阅一次 `session/event` 折进每个单元），领域计算，承载方只读整份当前值。[第8章](08-session-log.md)

## A.5 上下文与压缩

- **压缩压力** — compaction pressure — 请求侧上下文逼近窗口容量的度量与触发条件。`CompactionTrigger` 只有 `'pressure'`（在 `agent/pre-step` 运行）与 `'context-overflow'`（走 `agent/request-error`）。[第9章](09-context-compaction.md)
- **溢出落盘** — spill — `ctx.spillStore` 原样存下超限文本，返回不透明定位符、精确字节数与检索提示；是否落盘由消费方决定。[第9章](09-context-compaction.md)

## A.6 目标与轮次

- **目标** — goal — 附着在**现有会话**上的单个持久完成目标：带按修订演进的 `active`／`paused`／`blocked`／`complete` 阶段与 Goal Round 上限。它是状态，不是调度器也不是独立对话。[第6章](06-agent-loop.md)
- **Goal Round** — goal round — 为当前目标接纳的一次续行周期，由同会话驱动器具体化为一个目标来源的轮次；无关的人类轮次不消耗上限。[第6章](06-agent-loop.md)
- **目标激活** — goal activation — 续行消费方接纳下一个 Goal Round 的**进程本地**权限，取 `armed`／`disarmed`；有意不参与持久回放，恢复或 fork 后需一次人类授权的恢复变更。[第6章](06-agent-loop.md)

## A.7 平台与接入

- **人类命令** — human command — 以斜杠开头、由面向人类的适配器经 `ctx.commands` 解释执行的指令，不会成为模型消息；不同于面向模型的工具，也不同于经 `ctx.shell` 的 shell 执行。[第16章](16-low-code-customization.md)
- **命令平面** — command plane — UI 适配器与命令插件负责的发现、解析、分发、取消与结果渲染；除非处理器另改持久领域，命令输出属于 UI 状态。[第15章](15-platform-surfaces.md)
- **平台面** — surface（平台义） — 产品对用户的接入平面（CLI、Web GUI、Desktop、SDK、ACP）及其共用的 Remote 契约与注册面；与会话的"表面"各有专指。[第15章](15-platform-surfaces.md)
- **档案** — profile — 存在 Harness home 里的具名装配：列出叠加的 bundle、安装的非树内插件、用户自己的 `cordis.patch.yml`；出厂模板是 `web`／`headless`／`sdk`／`sdk-minimal`／`acp`。[第5章](05-composition-root.md)
- **能力包** — bundle — Cordis 配置行与其挂载代码的**分发格式**：`package.json` 的 `dsh.bundle` 指向自己的 patch 文件，故它插入的东西可被上层改写。[第12章](12-capability-package.md)
- **patch 层** — patch layer — 作用到空条目列表上的有序叠加：档案的有序 bundle → 档案的 `cordis.patch.yml` → home patch → `--patch` 覆盖。patch 按 `id` 指住一行并整段替换其 `config`，绝不深合并。[第16章](16-low-code-customization.md)
- **预设** — preset — 两种同形不同名的东西：`preset` 类型的 patch 声明把操作限制在该声明自己的 `config.plugins` 内；agent 预设（`ctx.agentPresets`）是一行普通插件声明承载的 agent 作用域能力集，其内 service 行必须带 `isolate` realm，否则挂载审计启动即抛。[第16章](16-low-code-customization.md)

## A.8 易混淆对照表

| 甲 | 乙 | 判据 |
| --- | --- | --- |
| `ctx.shell` | `ctx.subprocess` | 要命令行与解释语义用 shell；要 argv、stdio、进程树生命周期与 kill 升级用 subprocess。`bash-local` 自己就走 `ctx.subprocess`。 |
| `ctx.terminals` | `ctx.shell` | 要跨多次调用保留 shell/REPL 状态并围栏到创建它的 agent 用 terminals；一次性派发用 shell。 |
| tool | skill／human command | tool 有 Schema、执行写 `tool/call`／`tool/result`；skill 只是目录条目与指令正文，`ctx.skills` 不执行任何东西；人敲斜杠触发的入口是 human command，不产生模型消息。 |
| `session/event` | `agent/*` | 必须在重载后存活的事实写会话事件；观察或拦截飞行中的工作用 `agent/*`。 |
| `rawConfig` | `effectiveConfig` | 前者是留给下次激活的原始输入、不求值不校验（`vendor/cordis/src/fiber.ts:642`）；后者是已发布的已校验对象（`:655`）。 |
| `DISPOSED` | 清理完成（静默） | `DISPOSED` 只看 `uid` 置空、不可逆；"完成"要求可观察工作 await 到静默，看 `inertia` 链是否耗尽。 |
| bundle | profile | bundle 是分发格式（patch 文件加代码）；profile 是一次具名装配。bundle 不知道自己在哪个 profile 里。 |
| patch | preset | patch 按 id 指住一行、整段替换或插入；`preset` 把操作限制在自己的 `config.plugins` 内，agent 预设按 agent 作用域挂载能力集。 |
| 会话投影 | 会话查询 | 投影答"这个会话的某项派生状态现在整份是什么"；查询答"历史上满足条件的会话有哪些"（`ctx.sessionQuery`）。 |
| restriction | monotonic guard | restriction 在注册期过滤全局工具、影响提示词可见性；guard 在派发期只减不加权限、不影响可见性。看不见是前者，看得见但被拒是后者。 |
| `tools/pre-execute` | `tools/execute` | 前者是可改写决定的 waterfall；后者包裹派发生命周期且只有 `exec.signal` 可替换。 |
| spill | compaction | spill 存下单条超限内容并换回定位符，原文仍可检索；compaction 用摘要遮蔽一段表面节点，原文不再进历史。 |
