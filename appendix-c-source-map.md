# 附录 C 源码阅读地图

[返回目录](README.md)

这份地图给的是**顺序**：每个主题按"先读这个 → 再读那个 → 为什么"组织。路径以仓库根为基准、只到文件级，同目录的后续文件只写文件名；行号只在少数承重处标出，会随重构漂移。原则：先读声明（形状与不变量），再读实现（谁替换了它），最后读消费方（谁依赖那个形状）。

## C.1 内核：从注册表到 realm

1. `vendor/cordis/src/registry.ts` — 服务表本体，后面每个文件都在读写它；键的构造方式是 realm 的落点。
2. `vendor/cordis/src/fiber.ts` — 顺序与生命周期的全部逻辑：`inertia`（`:200`）、`_refresh()` 拼 epoch（`:611`）、`_setEpoch()`（`:625`）、`rawConfig`／`effectiveConfig`（`:642`、`:655`）。
3. `vendor/cordis/src/reflect.ts` — `ctx.get(name, strict)`：`strict` 只认 `ACTIVE`，是"拿到 undefined"的第一站。
4. `vendor/cordis/src/events.ts` — `DispatchMode`（`:32`）与 `internal/*` 事件族；读完才知 waterfall 的 `next` 从哪来。
5. `vendor/cordis/src/service.ts` → `vendor/cordis/src/context.ts` — 服务声明面词汇（定义为什么不是 `interface`），与 realm 三兄弟 `extend()`／`isolate()`／`intercept()`（`:99`、`:121`、`:141`）。
6. `vendor/loader/src/config/tree.ts` → `vendor/loader/src/config/entry.ts` — 树形展开与条目规范化形状；排在 fiber 之后，因为要先懂"epoch 变化才重启"。
7. `vendor/loader/src/config/diff.ts` → `isolate.ts` → `group.ts` — 按 `id` 的 diff（无 `id` 每次算删除加新增）、`Realm`／`LocalRealm`／`GlobalRealm`（`:26`、`:49`、`:60`）、组内按 id `insert`。

## C.2 作用域与 agent

1. `packages/core/scope/src/index.ts` — `ScopeKey`、`Scoped<T>`、`Scope` 三条出口、`scopeTarget()`（`:170`）与 `quiesceFiber()`（`:115`）。最后一处解释 `dispose()` 为何可并发安全调用。
2. `packages/core/scope/src/store.ts` — `ScopedLayers`：全局层急切、作用域层惰性；`merge()` 的"全局在前、遮蔽在后"是 shadowing 的实现处。
3. `packages/core/agent/src/types.ts` → `packages/core/agent/src/runtime-types.ts` — 先读公共 `Agent` 形状，再读合并进来的运行面（`ctx` 在 `:203`）与 `agent/*` 事件类型。
4. `packages/core/agent/src/index.ts` — `CreateAgentOptions`（`:66`）与 `setup`（`:122`）定义 setup window；工厂在此分开"创建"与"发布"。
5. `packages/core/agent/src/dispatch.ts` — `AgentSubjectEvent` 推导与 `agentCarrier()`（`:94`）：scoped dispatch 与 registry-subject event 的分界只在这里定。
6. `packages/core/agent-loop/src/index.ts` → `packages/core/agent-loop/src/agent.ts` — 装配与准入顺序在前者，请求构造与 `prepareCall()` 绑定（`:644`）在后者。
7. `packages/core/agent-loop/src/inbox.ts` → `packages/core/agent-loop/src/runtime-context.ts` → `packages/core/agent-loop/src/assistant-stream.ts` — 依次回答"输入何时被认领""上下文何时进请求""活增量与持久结算为何分开"。

## C.3 工具与策略

1. `packages/core/tools/src/index.ts` — `register()`（`:128`）、`restrict()`（`:162`）、`guard()`（`:384`）、`checkGuards()`（`:393`）、`setExecutor()`（`:325`）：策略三条入口在此定形。
2. `packages/core/tools/src/contracts.ts` → `packages/core/tools/src/schema.ts` — 先读契约，才分得清 provider 义务与共享管线义务。
3. `packages/core/tools/src/pipeline.ts` — 编排实况：快照与 token → `tools/pre-execute` → 审批 → `checkGuards()`（`:213`）→ 派发 → `post-execute` → `tools/result`。
4. `packages/core/tools/src/batch.ts` → `packages/core/tools/src/executor.ts` → `packages/core/tools/src/events.ts` — 并发与 `maxParallelToolCalls`、默认执行器接线、`tool/*` 持久面。
5. `packages/core/tool-executor-native/src/index.ts` → `packages/core/tool-executor-ptc/src/index.ts` — 对照读才见"换执行器不换策略"：PTC 内层调用带 `parent` token，模型直调的 native 名在管线前就被拒。
6. `packages/interaction/user-approval/src/index.ts` — 一次性许可经 `approval/request` 派发、接缝缺席即失败关闭；管线用 `ctx.get('approval')` 机会式消费它（`packages/core/tools/src/pipeline.ts:436`）。
7. `packages/sandbox/sandbox/src/index.ts` → `packages/sandbox/sandbox-policy/src/index.ts` — argv 包裹器与 enforcement 报告，加默认模式与工作区 root 的唯一归属处；后者拒绝在本地 canonicalize 远端路径。
8. `packages/spill/spill/src/types.ts` → `packages/spill/spill-policy/src/index.ts` — `saveText` 的唯一操作形状，与"何时落盘"的位置（`tools/post-execute` 消费者）。

## C.4 会话：日志、格式与持久化

1. `packages/core/session/src/index.ts` → `packages/core/session/src/types.ts` — 先读 `append()` 入口形状，再读 `SurfaceEventType`（`:447`）、`SurfaceOp`（`:470`）、`ignorable`（`:519`）、`EpochHeader`（`:246`）：日志三条分类全在这两处。
2. `packages/core/session/src/surface.ts` — 表面折叠与替换校验：节点 0 的系统消息只能被替换成新的系统节点。
3. `packages/core/session/src/request-header.ts` → `packages/core/session/src/repair.ts` — `foldRequestHeader()`（`:63`）的选择规则，与谁补 `interrupted` 的 `turn/end`。
4. `packages/session/session-format/src/filename.ts` → `packages/session/session-format/src/chain.ts` → `packages/session/session-format/src/types.ts` — 版本命名文件形状、静态相邻链组合、"消费者只知当前逻辑格式"的类型边界。
5. `packages/session/session-format-v3-to-v4/src/index.ts` — 一条真实边的样子：一个包恰好一个 `vN -> vN+1`（配 `migration.ts`、`codec.ts`、`validation.ts`）。
6. `packages/session/session-persistence/src/index.ts` → `packages/session/session-persistence/src/handle.ts` → `packages/session/session-persistence/src/storage-contract.ts` — 契约、"一个 id 一个活动写句柄"、后端必须遵守的共享语义。
7. `packages/session/session-persistence-jsonl/src/index.ts` → `packages/session/session-persistence-jsonl/src/storage.ts` → `packages/session/session-persistence-jsonl/src/generation.ts` → `packages/session/session-persistence-jsonl/src/lease.ts` — 物理 framing 与压缩、代选择与独占发布、跨进程租约。
8. `packages/session/session-projection/src/index.ts` → `packages/session/session-projection-cache/src/index.ts` — 驱动与句柄保留语义，再看检查点、缓存视图与 prepared 水合。

## C.5 上下文与模型

1. `packages/core/system-prompt/src/index.ts` — 提示词段与工具 schema 组装、`system-prompt/assemble` waterfall、变量替换、persona 槽如何被 preset 遮蔽。
2. `packages/context/agent-instructions/src/index.ts` → `packages/context/time-context/src/index.ts` → `packages/context/session-reference/src/index.ts` — 三个真实贡献者：指令文件折叠、对 `agent/pre-step` 的时间投影、会话快照落成不可信消息上下文。
3. `packages/compaction/compaction/src/index.ts` → `packages/compaction/compaction-basic/src/index.ts`（配 `region.ts`、`summarizer.ts`）— 接缝形状与策略分工：区域边界保留调用／结果配对但不保留整轮。
4. `packages/llm/llm/src/index.ts` — provider 中立运行时：`prepareCall()`（`:960`）、`llm/stream` 末端查找、`resolveModel()`。
5. `packages/llm/llm-deepseek/src/host.ts` → `packages/llm/token-meter/src/types.ts` — 适配器宿主半边（信封到 wire），与不可变测量形状和 `ContextPressureProjection`。
6. `packages/llm/llm-retry/src/index.ts` — 收尾看重试策略与 `agent/request-error` 的分工：为什么失败恢复不重复组装。

## C.6 装配与平台

1. `packages/boot/app-boot/src/index.ts` → `packages/boot/app-boot/src/profile.ts` → `packages/boot/app-boot/src/profile-context.ts` — 组合根：启动器只给数据型 profile 输入，档案重建（清单加 patch、替换变更模块、发布解析）在 `profile.ts`。
2. `apps/cli/src/bin.ts` → `apps/cli/src/args.ts` → `apps/cli/src/profile-boot.ts` → `apps/cli/src/plugin.ts` — 唯一启动路径；配 `apps/cli/src/dump-config.ts` 打印真会 boot 的树。
3. `packages/bundle/base/package.json` → `packages/bundle/base/cordis.patch.yml` → `packages/bundle/web-app/presets/standard.patch.yml` — `dsh` 字段声明 bundle 与叠加顺序、patch 注释解释分层、出厂 preset 本身就是 patch 行。
4. `packages/preset/agent-preset/src/index.ts` → `packages/preset/agent-preset-registry/src/index.ts` → `packages/preset/agent-preset-registry/src/mount.ts` — preset 是普通插件、注册表拥有挂载与世代（`serviceFor()` 在 `src/index.ts:340`）、`leakedServices()`（`:69`）与启动即抛（`:211-213`）。
5. `packages/typert/registry/src/index.ts` → `packages/typert/loader/src/index.ts` → `packages/typert/generator/src/index.ts`（配 `packages/typert/protocol/src/index.ts`）— 类型化 Remote 的三个面：活贡献、从条目生成、产出描述符。
6. `packages/api/gateway/src/index.ts` → `packages/api/gateway/src/access.ts` → `packages/api/remote-access/src/index.ts` — 网关关联描述符与活服务；访问决定与拒绝分类由业务注册的角色策略给出。
7. `packages/sdk/client/src/index.ts`（配 `packages/sdk/client/src/launch.ts`）→ `packages/sdk/server/src/index.ts` → `packages/sdk/protocol/src/index.ts` — SDK 选 `sdk` profile 启动同一 CLI；自定义组合仍是"profile 加有序 patch"。
8. `packages/host/webserver/src/index.ts` → `packages/client/modules/src/index.ts` → `packages/boot/hmr/src/index.ts` — 具名路由与静态回退、`__DSH_BOOT__` 入口图、模块与配置监视：三者一起解释热更新后谁被重挂。
9. `packages/skill/skill/src/index.ts` → `packages/skill/skill-filesystem/src/index.ts` → `packages/interaction/commands/src/index.ts` — 扩展面三件套：目录合并与同名胜出、发现根与 rank、人类命令注册表。

## C.7 生成物与闸门

先读生成器再读产物：产物给结论，生成器给"结论为什么成立、新条目怎样才不被漏掉"。

- `scripts/gen-doc-graphs.ts` — 产出 `docs/capability-seams.md`、`docs/event-producer-consumer.md`、`docs/agent-lifecycle.md`、`docs/tool-execution-pipeline.md`、`docs/graph-atlas.md`；角色分类与 completeness guard 在此。
- `scripts/gen-module-graph.ts` — 产出 `docs/module-graph.md`（peer 共享实例图，不是分层规则）。
- `scripts/gen-tool-catalog.ts` — 真 boot 每个工具插件读 `ctx.tools.schemas()`，并用 `packages/*/tool-*` 的 glob 兜完整性。
- `scripts/gen-persistence-catalog.ts` — 产出 `docs/persistence-catalog.md`、`docs/experimental-persistence-catalog.md`、`docs/persistence-schema.json`。
- `scripts/gen-session-format-catalog.ts` — 产出 `packages/session/session-format-catalog/src/generated.ts`，供离线读取者组装第一方投影定义。
- `scripts/verify-application-entrypoints.ts` — 每个 bin／可执行源码／根脚本必须归入显式类别，拒绝绕过 `dsh` 的路径。
- `scripts/experimental-package-policy.ts` → `scripts/run-gates.ts` — 实验包政策，与 `doc-sync`、`hygiene`、`ci-*`、`check-all` 的闸门编排。

## C.8 决策记录与事故档案

`.agents/notes/implemented/architecture/` 是设计权威；遇到"为什么非要这样"先来这里。三份与本书直接对应：

- `2026-09-01-v2-embedded-assistant-streams.md` — 为什么完整 provider 流嵌进 `assistant/message`、`assistant/attempt` 只留已结算的失败与取消（第 8、14 章）。
- `2026-08-31-released-session-format-migrations.md` — 为什么每个相邻迁移包恰好一步、只有写开启才发布后继（第 17 章）。
- `2026-09-02-system-prompt-as-surface-node.md` — 为什么系统提示词是派生历史而不是 `EpochHeader` 字段（第 9 章）。

三类配套档案读法不同：

- `docs/postmortem/` 回答"缺陷怎么穿过所有安全网"。例：`0004-landlock-partial-notice-misclassified-child-failures.md` 里旧 ABI 内核的良性提示被误判成 launcher 失败，ripgrep 的正常退出 1 上报成 `SANDBOX_UNAVAILABLE`。
- `docs/defensive-patterns/` 回答"改这类产物必须满足什么"。`general.md` 的"Dispose must reach quiescence, not just request it"就是第 2 章静默边界的评审条款；每页给规则、判据、边界与正反例。
- `docs/upgrade-guide/` 回答"变化打断了外部可感知的表面，升级方做什么"：按版本目录组织，每主题一份 `guide.md`／`guide.zh.md`，如 `v0.2.1-rc.2/conditional-tools/guide.md`。

## C.9 按问题查文件

| 症状 | 按顺序读 | 为什么是这几个 |
| --- | --- | --- |
| 工具没出现在提示词里 | `packages/core/tools/src/index.ts` → `packages/core/system-prompt/src/index.ts` → `packages/preset/agent-preset-registry/src/mount.ts` → `docs/tool-catalog.md` | 注册与 `restrict()` 过滤 → 步骤准入决定声明 → preset 是否挂载 → 生成清单确认出厂就该有 |
| 插件行停在 PENDING | `vendor/cordis/src/fiber.ts` → `vendor/cordis/src/reflect.ts` → `apps/cli/src/dump-config.ts` | epoch 为 `INACTIVE` 即缺注入 → 谁被拿到 → 真实会 boot 的树 |
| 配置改了没生效 | `vendor/loader/src/config/diff.ts` → `packages/boot/config-editor/src/index.ts` → `packages/boot/app-boot/src/profile.ts` → `packages/boot/hmr/src/index.ts` | 按 `id` 的 diff → 编辑落在哪层 patch → 档案重建与发布 → 谁有权触发重载 |
| 压缩不触发 | `packages/compaction/compaction-basic/src/index.ts` → `packages/llm/token-meter/src/types.ts` → `packages/core/agent/src/runtime-types.ts` | 阈值与保留尾 → 压力数字来源 → `pre-step` 与 `request-error` 两条入口 |
| 投影不更新 | `packages/session/session-projection/src/index.ts` → `packages/session/session-projection-cache/src/index.ts` → `packages/api/session-controller/src/state/controller.ts` | 驱动与折叠 → 检查点与缓存 → 基线与推送怎么发 |
| 热更新后重复注册 | `packages/client/modules/src/index.ts` → `packages/boot/hmr/src/index.ts` → `vendor/loader/src/config/isolate.ts` | 入口图重算 → 队列与文件锁 → 同名服务是否共享实现 |
| 远程方法被拒 | `packages/api/remote-access/src/index.ts` → `packages/api/gateway/src/access.ts` → `packages/typert/generator/src/index.ts` | 角色策略与拒绝分类 → 身份解析 → 方法名与描述符是否匹配 |
| 会话打不开或版本被拒 | `packages/session/session-format/src/filename.ts` → `packages/session/session-format/src/chain.ts` → `packages/session/session-persistence-jsonl/src/generation.ts` → `docs/session-format-status.md` | 代选择 → 相邻链与未来版本拒绝 → 独占发布在哪步失败 → 发布基线权威值 |
| 沙箱里命令莫名失败 | `packages/sandbox/sandbox-policy/src/index.ts` → `packages/sandbox/sandbox/src/index.ts` → `docs/postmortem/0004-landlock-partial-notice-misclassified-child-failures.md` | root 与默认模式 → 包裹与 enforcement → 提示误判的教训 |
| 工具被拒但不知被谁拒 | `packages/core/tools/src/pipeline.ts` → `packages/core/tools/src/index.ts` → `packages/interaction/user-approval/src/index.ts` | 时序 pre-execute → 审批 → guard → 谁注册了限制或守卫 → 缺席即失败关闭 |
| 执行世界像是混搭 | `packages/ssh/ssh/src/index.ts` → `packages/ssh/sandbox-ssh/src/index.ts` → `packages/sandbox/sandbox-policy/src/index.ts` | 一条连接是共同底座 → 远端包裹在哪执行 → 为何不在本地校验远端路径 |
