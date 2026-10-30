# 附录 B 服务与接缝索引

[返回目录](README.md)

## B.1 这份索引从哪来、怎么用

本索引从 `docs/capability-seams.md` 末尾的生成表（列名 `ctx key | Role | Owner | Implementations | Direct consumers | Companion plugins | Note`）提炼，按主题分组、只收录选型时真正要比较的行，不是整表照抄；全量清单读生成表本身，它由 `scripts/gen-doc-graphs.ts` 从 Cordis 声明发现服务并分类 interface／implementation／consumer 角色。

**角色·实现**一列把两个信息并排：角色取 `core`（主干服务，一个 context 一般一个）、`seam`（可替换能力接缝，多 provider 才有意义）、`service`（独立服务或贡献面）、`bundle`（装配点）；点号后是生成表 `Implementations` 列已知的 provider 数，`—` 表示该表未列实现（对 `core` 与 `service` 是常态，不代表技术上不可替换）。职责是 `Note` 列要点的压缩，名单随版本变化，决策前用 B.10 的命令重新生成一次。

## B.2 内核与循环

选型含义：这一组几乎全是 `core`，换它们等于换产品骨架而非换能力。`ctx.agentLoop` 是唯一具名循环实现，但扩展包应依赖 `dsh-agent` 的事件与服务而不是这个包；要改行为，先找事件扩展点。

| ctx key | 角色·实现 | Owner 包 | 一句话职责 | 章节 |
| --- | --- | --- | --- | --- |
| `ctx.agents` | core · — | `packages/core/agent` | 活 Agent 句柄与 create/resume 工厂接缝 | [第4章](04-scope-agent-world.md) |
| `ctx.agentLoop` | bundle · — | `packages/core/agent-loop` | 唯一的具名循环插件，扩展别依赖此包 | [第6章](06-agent-loop.md) |
| `ctx.sessions` | core · — | `packages/core/session` | append-only Session 实例与持久事件流 | [第8章](08-session-log.md) |
| `ctx.tools` | core · — | `packages/core/tools` | 能力与作用域执行器注册，含整批派发 | [第7章](07-tool-pipeline.md) |
| `ctx.agentPresets` | core · — | `packages/preset/agent-preset-registry` | 挂载 preset 版本并绑到作用域贡献 | [第16章](16-low-code-customization.md) |
| `ctx.commands` | core · — | `packages/interaction/commands` | 面向人的命令登记，不送去给模型 | [第16章](16-low-code-customization.md) |
| `ctx.goals` | core · — | `packages/goal/goal` | 从日志折叠目标状态，激活留进程本地 | [第6章](06-agent-loop.md) |

## B.3 会话与持久化

选型含义：日志是唯一真源，"能不能换"要看换掉后哪些不变量还在。物理格式与代管理在 provider 里，逻辑事件词汇表在 `core` 里；投影与查询是两条不同读路径。

| ctx key | 角色·实现 | Owner 包 | 一句话职责 | 章节 |
| --- | --- | --- | --- | --- |
| `ctx.sessionPersistence` | seam · 1 | `packages/session/session-persistence` | 把每个会话存成一份 SessionEvent 制品 | [第8章](08-session-log.md) |
| `ctx.sessionQuery` | seam · 1 | `packages/session-query/session-query` | 精确读取、过滤与关系追踪 | [第8章](08-session-log.md) |
| `ctx.sessionProjections` | core · — | `packages/session/session-projection` | 状态折叠单元的注册与整份当前值 | [第8章](08-session-log.md) |
| `ctx.sessionProjectionCache` | core · — | `packages/session/session-projection-cache` | 投影检查点与缓存视图、 prepared 水合 | [第8章](08-session-log.md) |
| `ctx.sessionTitle` | seam · 2 | `packages/session/session-title` | 确定性回退加唯一异步 provider | [第12章](12-capability-package.md) |
| `ctx.workingDirectory` | seam · 1 | `packages/session/working-directory` | 一个投影拥有有效执行目录 | [第13章](13-seams-execution-world.md) |
| `ctx.storage` | seam · 2 | `packages/storage/storage` | 多后端按名并排的 KV hub | [第12章](12-capability-package.md) |

## B.4 模型与上下文

选型含义：模型侧接缝只负责"发出去"与"算清有多贵"。凡改变模型可见内容的东西都必须能落回日志，所以装配与压缩分属两处，且压缩没有面向模型的工具。

| ctx key | 角色·实现 | Owner 包 | 一句话职责 | 章节 |
| --- | --- | --- | --- | --- |
| `ctx.llm` | seam · 3 | `packages/llm/llm` | provider 中立的 stream 与适配器注册 | [第14章](14-llm-adapter.md) |
| `ctx.tokenMeter` | core · — | `packages/llm/token-meter` | 隔离重放折叠与不可变压力测量 | [第9章](09-context-compaction.md) |
| `ctx.compaction` | seam · 1 | `packages/compaction/compaction` | 消费压力与 request-error 的压缩策略 | [第9章](09-context-compaction.md) |
| `ctx.toolResultPruner` | core · — | `packages/compaction/compaction-tool-result-pruner` | 摘要前以单节点替换重写超限结果 | [第9章](09-context-compaction.md) |
| `ctx.systemPrompt` | core · — | `packages/core/system-prompt` | 每步的提示词段与工具 schema 组装 | [第9章](09-context-compaction.md) |

## B.5 执行与工具

选型含义：这一组就是"执行世界"所在——接缝按世界整体站队，不按单条命令挑；provider 换实现、策略加事件门监听器，两者互不相碰。同类未列入的还有 `ctx.shellEnv`、`ctx.jobs`、`ctx.lsp`、`ctx.mcpResources`、`ctx.fileReferences`。

| ctx key | 角色·实现 | Owner 包 | 一句话职责 | 章节 |
| --- | --- | --- | --- | --- |
| `ctx.fs` | seam · 3 | `packages/fs/fs` | 读写编辑与原子变更的统一形状 | [第13章](13-seams-execution-world.md) |
| `ctx.subprocess` | seam · 2 | `packages/subprocess/subprocess` | 进程坐标、生命周期与 kill 升级 | [第13章](13-seams-execution-world.md) |
| `ctx.shell` | seam · 3 | `packages/shell/shell` | 模型侧 shell 工具消费的执行方言 | [第13章](13-seams-execution-world.md) |
| `ctx.terminals` | seam · 1 | `packages/terminal/terminal` | owner-scoped 持久终端会话注册表 | [第13章](13-seams-execution-world.md) |
| `ctx.sandbox` | seam · 2 | `packages/sandbox/sandbox` | 按调用策略包裹 argv 并报告强制 | [第13章](13-seams-execution-world.md) |
| `ctx.sandboxPolicy` | core · — | `packages/sandbox/sandbox-policy` | 默认模式与工作区 root 的唯一归属 | [第13章](13-seams-execution-world.md) |
| `ctx.skills` | seam · 4 | `packages/skill/skill` | 合并 provider 的 skill 目录 | [第16章](16-low-code-customization.md) |
| `ctx.subagents` | seam · 6 | `packages/subagent/subagent` | 两种子 agent 生命周期的统一入口 | [第13章](13-seams-execution-world.md) |
| `ctx.web` | seam · 5 | `packages/web/web` | 搜索与抓取的 provider 选择 | [第13章](13-seams-execution-world.md) |
| `ctx.ptcRuntime` | seam · 2 | `packages/ptc-runtime/ptc-runtime` | 对宿主 binding 执行程序的语言底座 | [第7章](07-tool-pipeline.md) |
| `ctx.spillStore` | seam · 1 | `packages/spill/spill` | 超限文本换成模型侧定位符 | [第9章](09-context-compaction.md) |
| `ctx.workflowEngine` | seam · 1 | `packages/workflow/workflow` | 一 context 一引擎，无具名注册表 | [第13章](13-seams-execution-world.md) |

## B.6 策略与交互

选型含义：策略挂在接缝的事件与守卫上，而不是新造包改代码；交互类接缝的缺席语义要明确——无 provider 时失败关闭，而非默认允许。

| ctx key | 角色·实现 | Owner 包 | 一句话职责 | 章节 |
| --- | --- | --- | --- | --- |
| `ctx.approval` | seam · — | `packages/interaction/user-approval` | `approval/request` 上的一次性许可 | [第7章](07-tool-pipeline.md) |
| `ctx.permissionPresets` | core · — | `packages/interaction/permission-presets` | 捆绑沙箱模式与审批旋钮 | [第16章](16-low-code-customization.md) |
| `ctx.planMode` | core · — | `packages/plan/plan-mode` | plan/mode 折叠与 `/plan` 注册 | [第6章](06-agent-loop.md) |
| `ctx.userQuestions` | seam · — | `packages/interaction/user-questions` | provider 中立的 `ask()` 应答面 | [第15章](15-platform-surfaces.md) |
| `ctx.agentTeams` | core · — | `packages/experimental/agent-team` | 名册、同伴 inbox 与共享任务 DAG | [第13章](13-seams-execution-world.md) |

## B.7 平台与接入

选型含义：平台接缝把内核能力搬上线，不拥有业务策略——拒绝分类、脱敏投影、能力门控都住在 controller 侧而非接缝 Definition 上；装配与热更新类接缝只由启动器与 profile 写入。

| ctx key | 角色·实现 | Owner 包 | 一句话职责 | 章节 |
| --- | --- | --- | --- | --- |
| `ctx.typert` | core · — | `packages/typert/registry` | 活的 zod 贡献注册 | [第15章](15-platform-surfaces.md) |
| `ctx.typertGateway` | core · — | `packages/api/gateway` | Remote 描述符到活服务的关联 | [第15章](15-platform-surfaces.md) |
| `ctx.remoteAccess` | core · — | `packages/api/remote-access` | 非属主 Peer 可调用范围的角色策略 | [第15章](15-platform-surfaces.md) |
| `ctx.connection` | core · — | `packages/client/connection` | 浏览器鉴权与共享 HTTP 派发 | [第15章](15-platform-surfaces.md) |
| `ctx.webServer` | core · — | `packages/host/webserver` | 具名路由与静态回退的载体 | [第15章](15-platform-surfaces.md) |
| `ctx.clientModules` | core · — | `packages/client/modules` | 组装并服务 `__DSH_BOOT__` 入口图 | [第18章](18-debugging-performance.md) |
| `ctx.hmr` | core · — | `packages/boot/hmr` | 模块与精确配置监视的队列 | [第5章](05-composition-root.md) |
| `ctx.configEditor` | core · — | `packages/boot/config-editor` | 在文件锁下持久 profile 补丁 | [第16章](16-low-code-customization.md) |
| `ctx.pluginManager` | core · — | `packages/boot/plugin-manager` | profile 包操作与运行态报告 | [第12章](12-capability-package.md) |
| `ctx.settings` | core · — | `packages/settings/settings` | 项目 volatile Config 字段成形 | [第16章](16-low-code-customization.md) |
| `ctx.credentials` | seam · 1 | `packages/credentials/credentials` | 配置只带引用、值归 provider | [第15章](15-platform-surfaces.md) |
| `ctx.sessionController` | core · — | `packages/api/session-controller` | 会话命令、冷读与激活策略 | [第15章](15-platform-surfaces.md) |

## B.8 可观测性

选型含义：可观测性接缝的消费者常在进程外，"没有消费方"不等于"没被使用"；仅仅挂上也不等于采集，导出要求显式提交。

| ctx key | 角色·实现 | Owner 包 | 一句话职责 | 章节 |
| --- | --- | --- | --- | --- |
| `ctx.sessionTelemetry` | seam · 1 | `packages/session/session-telemetry` | 捕获、脱敏并交给一个后端 | [第18章](18-debugging-performance.md) |
| `ctx.otel` | service · — | `packages/telemetry/otel` | 一个注入服务、多条独立通道 | [第18章](18-debugging-performance.md) |
| `ctx.productTelemetry` | service · — | `packages/host/product-telemetry-otel` | 只导出显式提交的分析事件 | [第18章](18-debugging-performance.md) |
| `ctx.productAnalytics` | service · — | `packages/client/product-analytics` | 采集策略下的桌面事件与压缩观察 | [第18章](18-debugging-performance.md) |
| `ctx.inspector` | core · — | `packages/experimental/inspector` | CDP 目标与 Cordis 树查询 API | [第18章](18-debugging-performance.md) |
| `ctx.workspaceChanges` | core · — | `packages/deliverables/workspace-changes` | 每轮变更文件摘要的按需供应 | [第18章](18-debugging-performance.md) |

## B.9 多 provider 接缝清单

同一接缝的 provider 之间不是性能好坏的差异，而是**语义归属**的差异。下面逐条写清 provider 到底改变了什么（依据生成表 `Note` 列与 Owner 包 README）。

- **`ctx.fs`**（`packages/fs/fs`；`fs-local`／`fs-sandbox`／`ssh/fs-ssh`）——操作形状一致，改变的是"哪个物理文件系统"与"写是否被围栏"：local 直连宿主，sandbox 按共享沙箱模式围栏变更（root 归 `ctx.sandboxPolicy`），ssh 把操作搬到远端 helper。观测类检查不写进 provider，由 `fs-observation-policy` 经 `fs/*` 事件门贡献。
- **`ctx.subprocess`**（`packages/subprocess/subprocess`；`subprocess-local`／`ssh/subprocess-ssh`）——服务拥有进程坐标、树与会话生命周期、stdio 处置、终端机制与 kill 升级；请求不含 shell 解释与隐藏默认，子环境先剥掉环境凭证与 `DSH_*` 再应用显式覆盖。provider 只改变"进程落在哪台机器"。
- **`ctx.shell`**（`packages/shell/shell`；`bash-local`／`bash-sandbox`／`pwsh-local`）——差异是解释器方言与是否被沙箱包裹；消费方是模型侧 shell 工具与 hook 桥，替换执行器不触碰它们。本地 shell 自己经 `ctx.subprocess` 起进程。
- **`ctx.sandbox`**（`packages/sandbox/sandbox`；`sandbox-local`／`ssh/sandbox-ssh`）——argv 包裹器：消费方交出即将 spawn 的确切 argv，同世界后端按每次调用策略包裹并报告 enforcement，无法强制时以 `SANDBOX_UNAVAILABLE` 失败关闭。远端后端把包裹与路径校验放到执行主机上做。
- **`ctx.terminals`**（`packages/terminal/terminal`；`terminal/terminal-bash`）——注册表拥有精确 Agent 的会话身份与清理（处置等到静默），后端拥有 spawn 与就绪机制，`tool-terminal` 暴露 owner-scoped 工具。会话进程本地，不跨重启。
- **`ctx.llm`**（`packages/llm/llm`；`llm-deepseek`／`llm-pi-ai`／`test-support/llm-replay`）——一次 stream 就是一次 provider 尝试，provider 特有翻译留在各自 adapter；`prepareCall()` 让循环跨模型解析、请求头记录与派发用同一次注册。第三家是测试支撑实现，即"换掉提供方以驱动确定性测试"。
- **`ctx.web`**（`packages/web/web`；`web-search-exa`／`web-search-perplexity`／`web-search-deepseek`／`web-deepseek-api`／`web-fetch-http`）——search 与 fetch 是两类能力，provider 各注册其一或两者；接缝为每次操作选一个可用后端并统一取消、错误与结果上限，包自身不发网络请求。
- **`ctx.skills`**（`packages/skill/skill`；`skill-filesystem`／`skill-office`／`experimental/skill-badge`／`sandbox-windows-acl`）——服务只合并目录、在同名上解析胜出者并暴露 summary 与 definition，本身不含 skill 内容；provider 决定"skill 从哪来"。同名按最小 rank 胜出，rank 相同再看注册顺序。
- **`ctx.subagents`**（`packages/subagent/subagent`；spawn-in-process／fork-in-process／acp／codex／claude-code／dsh-sdk）——差异最尖锐：本地 spawn 与 fork 的子级保留可续的持久会话（后续消息可达），外部后端一次执行。所有子级共享准入、取消、归属与发现，一个激活管理器同时管两种生命周期。
- **`ctx.storage`**（`packages/storage/storage`；`storage-json` 注册名 `json`／`storage-sqlite` 注册名 `sqlite`）——hub 不做任何 IO，backend 各拥一种介质；多后端按名并排挂载，"哪个后端服务哪个消费方"是消费方的配置（domain 层路由表），不是 hub 全局选择。仅宿主代码可用、无模型可见效果。
- **`ctx.sessionPersistence`**（`packages/session/session-persistence`；`session-persistence-jsonl`）——契约固定的共享语义：seq 从 0 连续、事件绝不重写、撕裂尾不外泄、`flush` 是屏障、一个 id 一个活动写句柄。provider 拥有物理 framing、压缩、代选择与独占发布，所以换后端改变的是崩溃窗口与文件形态，不是逻辑词汇。
- **`ctx.sessionQuery`**（`packages/session-query/session-query`；`session-query-sqlite`）——接口拥有精确读取、来源优先级、关系追踪与 provider 无关的过滤；后端补上具体全文索引生命周期（调和、排名、片段、游标代）。读取优先活会话，所以"无后端"不是错误，只是全文检索不可用。
- **`ctx.ptcRuntime`**（`packages/ptc-runtime/ptc-runtime`；`ptc-runtime-node`／`experimental/ptc-runtime-python`）——provider 声明源形态（async function body、REPL statements 或 script）与 `retainsState`（是否为一个显式 owner 保留内存直到释放，绝不从 Session 恢复）。语言与隔离描述符标识语法与底座，不是安全保证。
- **`ctx.directoryPicker`**（`packages/host/directory-picker`；`-native`／`-browse`）——判别式交互能力：native 在宿主显示上开一个 OS 选择器，browse 为 App 内浏览器供列目录与建目录原语、一次只暴露一棵树。dual-face 后端由浏览器半边填 `ui-workspace` 的目录流程槽位，不走 wire advertisement。

## B.10 用生成物自查

本附录每一行都该能用一条命令重新验证，以下才是权威生成物与闸门。

- **`pnpm run gen-doc-graphs`**（`scripts/gen-doc-graphs.ts`）一次性重写 `docs/capability-seams.md`、`docs/event-producer-consumer.md`、`docs/agent-lifecycle.md`、`docs/tool-execution-pipeline.md` 与索引页 `docs/graph-atlas.md`；`pnpm run verify-doc-graphs` 校验新鲜度。
- **`pnpm run gen-module-graph`** 生成 `docs/module-graph.md`。读前先记住它是 **peer 共享实例图**、不是分层规则：文件开头写明 peer 表示"消费方需要一个共享实例"，普通运行时依赖与开发期关系都不在其中，边 `a --> b` 也不构成"允许 a 依赖 b"的许可。
- **`docs/tool-catalog.md` 的真实启动式生成**：`pnpm run gen-tool-catalog` 与其他纯 AST 目录不同，它 boot 每个工具插件、读 `ctx.tools.schemas()`，因为 schema 不是静态可知的（运行期展开的枚举、拼接的描述、配置决定的名字、raw-JSON-Schema 的 MCP 工具）。其 completeness guard 把 boot 清单与磁盘上 `packages/*/tool-*` 的 glob 比对，未登记的包让生成器与 `pnpm run verify-tool-catalog` 失败。
- **`pnpm run gen-persistence-catalog`／`verify-persistence-catalog`** 写 `docs/persistence-catalog.md`、`docs/experimental-persistence-catalog.md` 与 `docs/persistence-schema.json`，枚举 `SessionEventMap` 每个成员（核心与声明合并而来的）的 payload、surface 徽章与声明处。
- **`pnpm run gen-session-format-catalog`／`verify-session-format-catalog`** 从相邻迁移包元数据生成构建期静态目录，写出 `packages/session/session-format-catalog/src/generated.ts`；离线读取者靠它组装第一方消息投影定义。
- **入口与包政策闸门**：`pnpm run verify-application-entrypoints` 把每个包 bin、可执行源码与根脚本归入显式类别，拒绝绕过 `dsh` 的 Node 应用路径；`scripts/experimental-package-policy.ts` 约束实验包。这些 verify 都归入 `pnpm run doc-sync` 与 `check:all` 的闸门（`scripts/run-gates.ts`），文档过期在 CI 里就是失败，不靠人肉比对。
