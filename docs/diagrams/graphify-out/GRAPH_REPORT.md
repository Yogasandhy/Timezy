# Graph Report - task  (2026-10-20)

## Corpus Check
- 78 files · ~31,090 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 30 file(s) not represented in the graph (top: .xml 10, (none) 6, .properties 2)

## Summary
- 472 nodes · 1038 edges · 31 communities (20 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5d28575`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TasksScreen.tsx
- TaskContext.tsx
- TaskFormScreen.tsx
- package.json
- .scene
- AppBootstrap.tsx
- devDependencies
- PRD — Timezy Task Management
- AppNavigation.tsx
- UI Design Specification — Timezy
- dependencies
- MainApplication.kt
- MainActivity.kt
- Technical Architecture — Timezy MVP
- Development setup — Timezy
- Timezy bare React Native MVP — implementation plan
- Timezy — Logo Exploration Brief
- Firebase setup
- Implementation Plan — Timezy
- Timezy
- MVP Backlog — Timezy
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `react` - 33 edges
2. `react-native` - 27 edges
3. `colors` - 23 edges
4. `Surface()` - 20 edges
5. `spacing` - 20 edges
6. `PrimaryButton()` - 18 edges
7. `parseLocalDateKey()` - 15 edges
8. `InsightsScreen()` - 15 edges
9. `TaskFormScreen()` - 15 edges
10. `useTasks()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Prinsip` --references--> `TaskProvider()`  [INFERRED]
  docs/ARCHITECTURE.md → src/features/tasks/state/TaskContext.tsx
- `Domain dan tanggal` --references--> `Task`  [INFERRED]
  docs/ARCHITECTURE.md → src/features/tasks/domain/task.ts
- `Domain dan tanggal` --references--> `parseLocalDateKey()`  [INFERRED]
  docs/ARCHITECTURE.md → src/features/tasks/domain/task.ts
- `App()` --calls--> `AppBootstrap()`  [EXTRACTED]
  App.tsx → src/app/AppBootstrap.tsx
- `App()` --calls--> `AuthProvider()`  [EXTRACTED]
  App.tsx → src/features/auth/state/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (31 total, 11 thin omitted)

### Community 0 - "TasksScreen.tsx"
Cohesion: 0.11
Nodes (51): react, react-native, styles, TabScreenProps, styles, styles, ProfileScreen(), ProfileStat() (+43 more)

### Community 1 - "TaskContext.tsx"
Cohesion: 0.07
Nodes (39): @react-native-async-storage/async-storage, @react-native-firebase/firestore, createFirebaseTaskRepository(), createId(), FirebaseTaskRepository, migrateLocalTasksToCloud(), parseSnapshot(), sortTasks() (+31 more)

### Community 2 - "TaskFormScreen.tsx"
Cohesion: 0.09
Nodes (33): react-native-safe-area-context, TaskFormScreenProps, getWeeklyInsights(), InsightCategory, InsightDay, WeeklyInsights, CompletionSummary, getCompletionSummary() (+25 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (38): config, { getDefaultConfig }, { mergeConfig }, engines, node, @react-native/typescript-config, name, private (+30 more)

### Community 4 - ".scene"
Cohesion: 0.07
Nodes (9): Expo, Firebase, GoogleSignIn, AppDelegate, SceneDelegate, React, React_RCTAppDelegate, ReactAppDependencyProvider (+1 more)

### Community 5 - "AppBootstrap.tsx"
Cohesion: 0.15
Nodes (21): App(), displayName, name, @react-native-firebase/auth, react-native-nitro-google-signin, AppBootstrap(), styles, LoadingScreen() (+13 more)

### Community 6 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, @babel/core, @babel/preset-env, babel-preset-expo, @babel/runtime, eslint, jest, prettier (+17 more)

### Community 7 - "PRD — Timezy Task Management"
Cohesion: 0.08
Nodes (25): 10. Persyaratan non-fungsional, 11. Acceptance criteria, 12. Risiko dan mitigasi, 13. Definisi selesai MVP, 1. Ringkasan, 2. Masalah dan peluang, 3. Pengguna sasaran, 4. Tujuan produk dan metrik MVP (+17 more)

### Community 8 - "AppNavigation.tsx"
Cohesion: 0.18
Nodes (13): @react-navigation/bottom-tabs, @react-navigation/native, @react-navigation/native-stack, renderTabBar(), Stack, Tabs, icons, NeumorphicTabBar() (+5 more)

### Community 9 - "UI Design Specification — Timezy"
Cohesion: 0.12
Nodes (16): Aksesibilitas, Arah visual, Calendar, Informasi layar, Insights, Motion dan feedback, Navigasi, Pola komponen (+8 more)

### Community 10 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, expo, expo-dev-client, react, react-native, @react-native-async-storage/async-storage, @react-native-firebase/app, @react-native-firebase/auth (+8 more)

### Community 13 - "Technical Architecture — Timezy MVP"
Cohesion: 0.22
Nodes (9): Alur data, Batas platform, Dependency utama, Domain dan tanggal, Navigasi dan UI, Persistence dan kegagalan, Prinsip, Struktur implementasi (+1 more)

### Community 14 - "Development setup — Timezy"
Cohesion: 0.22
Nodes (9): Build an APK, Dependency audit note, Development setup — Timezy, First install, Implemented stack, iOS, Quality checks, Real Android device (+1 more)

### Community 15 - "Timezy bare React Native MVP — implementation plan"
Cohesion: 0.25
Nodes (7): Architecture and stack, Environment constraints known at planning time, Execution tasks, Goal and scope, Outcome, TDD and verification detail, Timezy bare React Native MVP — implementation plan

### Community 16 - "Timezy — Logo Exploration Brief"
Cohesion: 0.29
Nodes (7): Brief, Category guardrails, Selected direction, Three concepts, Timezy — Logo Exploration Brief, Word map, Working recommendation

### Community 18 - "Firebase setup"
Cohesion: 0.33
Nodes (5): Data safety and migration, Enable sign-in providers, Finish cloud provisioning, Firebase setup, Project and app registrations

### Community 19 - "Implementation Plan — Timezy"
Cohesion: 0.33
Nodes (6): Definition of done, Implementation Plan — Timezy, Keputusan produk dan teknis, Pekerjaan yang tersisa, Status, Toolchain yang digunakan

### Community 20 - "Timezy"
Cohesion: 0.33
Nodes (6): Checks and Android build, Product and implementation docs, Project layout, Run on a real Android phone, Timezy, What works

### Community 21 - "MVP Backlog — Timezy"
Cohesion: 0.40
Nodes (4): Bukan scope MVP, MVP Backlog — Timezy, QA terbuka, Selesai

### Community 22 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): exclude, extends, include, @react-native/typescript-config

## Knowledge Gaps
- **28 isolated node(s):** `Expo`, `Firebase`, `React`, `React_RCTAppDelegate`, `ReactAppDependencyProvider` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 257 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Technical Architecture — Timezy MVP` connect `Technical Architecture — Timezy MVP` to `README.md`?**
  _High betweenness centrality (0.257) - this node is a cross-community bridge._
- **What connects `Expo`, `Firebase`, `React` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TasksScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11304347826086956 - nodes in this community are weakly interconnected._
- **Why does `Domain dan tanggal` connect `Technical Architecture — Timezy MVP` to `TaskFormScreen.tsx`?**
  _High betweenness centrality (0.210) - this node is a cross-community bridge._
- **Should `TaskContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0734006734006734 - nodes in this community are weakly interconnected._
- **Why does `Task` connect `TaskFormScreen.tsx` to `TasksScreen.tsx`, `TaskContext.tsx`, `Technical Architecture — Timezy MVP`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Should `TaskFormScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09494949494949495 - nodes in this community are weakly interconnected._