# zustand-playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Публичная репа с запускаемыми примерами public API zustand 5: vanilla в консоли, React-хук в браузере.

**Architecture:** Одна репа, один `package.json`: `vanilla/` — четыре bun-скрипта, `src/` — Vite-приложение с тремя вкладками примеров и счётчиком рендеров у каждого компонента. Тестов нет: проверка — вывод скриптов, `check`, `build` и ручной прогон вкладок в браузере.

**Tech Stack:** bun 1.4.2, zustand 5.0.15, react / react-dom 19.3.0, Vite 8.3.1, TypeScript 7.0.2, oxlint 1.86.0, oxfmt 0.71.0.

**Spec:** `docs/superpowers/specs/2026-09-30-zustand-playground-design.md`

## Global Constraints

- Версии в `package.json` закреплены точно, без `^`: `zustand` 5.0.15, `react` 19.3.0, `react-dom` 19.3.0, `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `vite` 8.3.1, `typescript` 7.0.2, `oxlint` 1.86.0, `oxfmt` 0.71.0; `engines.bun` `>=1.4.0`.
- Конфиги tsconfig, oxlint, oxfmt, vite — как во фронте (`F:/Github/2026_H2/frontend`), кроме `jsxImportSource`: здесь настоящий React, `jsx: "react-jsx"` без `jsxImportSource`.
- Код: одинарные кавычки, отступ 4, ширина 100 (oxfmt фронта).
- Комментарии в коде, вывод скриптов, тексты UI, README, сообщения коммитов — на русском. Коммиты conventional (`feat(vanilla): …`), в конце `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Каждый пример — законченный файл: стор объявлен в том же файле, комментарии «что происходит и почему» над каждым шагом.
- `main.tsx` рендерит без `StrictMode`.

## Review Focus

- Счётчики рендеров показывают неправду (двойной рендер, счётчик в `useState` вызывает лишний рендер) — ожидается ровно один прирост на рендер: счётчик на `useRef`, без `StrictMode` (Task 3, шаг проверки).
- Vite собирает JSX не под тот рантайм — ожидается, что `bun run build` и `bun run dev` работают без `@vitejs/plugin-react` (Task 1, шаг проверки; если нет — добавить плагин 5-й версии, совместимой с Vite 8, и отметить в README).
- Утверждение про бесконечный цикл селектора объекта в v5 не подтверждается — ожидается, что его проверили в браузере до того, как написать в комментарий (Task 4, шаг 2).
- Повторный клик «Загрузить» во время загрузки — ожидается неактивная кнопка, а не две гонки (Task 5).
- Скрипты на Windows: CRLF ломает oxfmt `--check` — ожидается `.gitattributes` `* text=auto eol=lf` (уже в репе) и зелёный `fmt:check` локально (Task 1).

---

### Task 1: Каркас приложения, CI и автоматизация

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `oxlint.config.ts`, `oxfmt.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/RenderCount.tsx`, `src/styles.css`, `.github/workflows/ci.yml`, `.github/workflows/automation.yml`

**Interfaces:**
- Produces: `RenderCount({ label }: { label: string }): JSX.Element` — бейдж «{label}: рендеров N»; N растёт на каждом рендере компонента, внутри которого он стоит (бейдж без пропсов-мемоизации рендерится вместе с родителем). `App` держит вкладки в массиве `{ id: 'counter' | 'selectors' | 'todos'; title: string; Component: () => JSX.Element }[]`; Task 3–5 добавляют по элементу.
- Produces: скрипты `package.json`: `vanilla`, `dev`, `build`, `typecheck`, `lint`, `fmt`, `fmt:check`, `check`.

- [ ] **Step 1: Конфиги.** `package.json` (`name: zustand-playground`, `private`, `type: module`, версии из Global Constraints; `vanilla`: `bun vanilla/01-create-store.ts && bun vanilla/02-merge-replace.ts && bun vanilla/03-subscribe.ts && bun vanilla/04-actions.ts`; `check`: `bun run fmt:check && bun run lint && bun run typecheck`; остальное — как во фронте). `tsconfig.json` — копия фронтовой без `jsxImportSource`, `include: ["src", "vanilla", "vite.config.ts"]`. `vite.config.ts`, `oxlint.config.ts`, `oxfmt.config.ts` (в `ignorePatterns` добавить `docs/**`), `index.html` (`<title>zustand-playground</title>`) — копии фронтовых.
- [ ] **Step 2: `RenderCount`.** Счётчик — `useRef(0)`, инкремент в теле рендера: `useState` для счётчика сам вызвал бы рендер. Комментарий об этом в файле.
- [ ] **Step 3: `App` и `main.tsx`.** Кнопки вкладок сверху, под ними `Component` активной; пока массив вкладок пуст — строка «Примеры появятся здесь». `main.tsx`: `createRoot(...).render(<App />)` без `StrictMode`, комментарий почему. `styles.css` — минимум: системный шрифт, бейдж с рамкой, активная вкладка выделена.
- [ ] **Step 4: Workflows.** `automation.yml` — копия `F:/Github/2026_H2/openapi-playground/.github/workflows/automation.yml`. `ci.yml`: на `push` и `pull_request`, `actions/checkout@v7`, `oven-sh/setup-bun@v2` с `bun-version: 1.4.2`, затем `bun install --frozen-lockfile`, `bun run check`, `bun run build`. Шаг `bun run vanilla` (между `check` и `build`) добавляет Task 2, когда появятся скрипты.
- [ ] **Step 5: Проверка.** `bun install && bun run check && bun run build`. Expected: без ошибок, `dist/index.html` создан. `bun run dev`, открыть страницу (chrome-devtools MCP): видна строка «Примеры появятся здесь», в консоли браузера нет ошибок.
- [ ] **Step 6: Commit.** `git add -A && git commit -m "feat: каркас Vite-приложения, CI и автоматизация"`

### Task 2: Vanilla-примеры

**Files:**
- Create: `vanilla/01-create-store.ts`, `vanilla/02-merge-replace.ts`, `vanilla/03-subscribe.ts`, `vanilla/04-actions.ts`
- Modify: `.github/workflows/ci.yml` — шаг `bun run vanilla`

**Interfaces:**
- Consumes: скрипт `vanilla` из Task 1.
- Импорт только из `zustand/vanilla`. Первая строка вывода каждого скрипта — `=== 0N <тема> ===`. Состояние печатается через `console.log(шаг, store.getState())`.

- [ ] **Step 1: `01-create-store.ts`.** `createStore<{ count: number; text: string }>()(() => ({ count: 0, text: 'привет' }))`. Шаги: `getState()` → `{ count: 0, text: 'привет' }`; `setState({ count: 1 })` → `text` сохранился; `setState((s) => ({ count: s.count + 1 }))` → `count: 2`; `getInitialState()` → `{ count: 0, text: 'привет' }`.
- [ ] **Step 2: `02-merge-replace.ts`.** Стор `{ user: { name: 'Ерофей', role: 'frontend' }; theme: 'light' | 'dark'; toggleTheme: () => void }`.
  - `setState({ user: { name: 'Денис' } })` под `// @ts-expect-error` (TS требует `role`): в выводе `role` пропал — слияние только верхнего уровня.
  - Правильно: `setState((s) => ({ user: { ...s.user, name: 'Денис' } }))` — `role` на месте.
  - `setState({ user, theme: 'dark' }, true)` под `// @ts-expect-error` (нет `toggleTheme`): вывод `typeof getState().toggleTheme` → `undefined`.
  - Правильно: `setState({ ...getInitialState(), theme: 'dark' }, true)` → `toggleTheme` — функция.
- [ ] **Step 3: `03-subscribe.ts`.** Стор `{ count: number }`; подписчик печатает `подписчик: prev.count → state.count, тот же объект: state === prev`. Шаги: `setState({ count: 1 })` → подписчик вызван; снова `setState({ count: 1 })` → вызван (новый объект); `setState((s) => s)` → не вызван; `unsubscribe()`, `setState({ count: 2 })` → не вызван. Перед каждым шагом строка, что ожидаем.
- [ ] **Step 4: `04-actions.ts`.** Тип `CounterState = { count: number; status: 'idle' | 'loading' | 'done' | 'error'; error: string | null; inc(): void; double(): void; load(fail: boolean): Promise<void> }`. `inc` через `set((s) => …)`, `double` через `get()`, `load`: `status: 'loading'` → задержка 100 мс → `done` c `count: 42` или `error` c `error: 'сервер недоступен'`. Подписчик печатает `status`. Шаги: `inc`, `double`, `await load(false)`, `await load(true)`. Комментарий над `createStore<CounterState>()(…)`: каррированная форма нужна, потому что TS не умеет задать один дженерик (`T`) и вывести остальные (middleware) в одном вызове.
- [ ] **Step 5: Проверка.** `bun run vanilla` — выводы совпадают с ожидаемыми из шагов 1–4 (сверить каждое «ожидаем» с фактом); `bun run check` зелёный (`@ts-expect-error` не лишние).
- [ ] **Step 6: Commit.** `git add -A && git commit -m "feat(vanilla): createStore, слияние и replace, subscribe, экшены"`

### Task 3: Вкладка Counter

**Files:**
- Create: `src/examples/Counter.tsx`
- Modify: `src/App.tsx` — вкладка `{ id: 'counter', title: 'Counter', Component: Counter }`

**Interfaces:**
- Consumes: `RenderCount` из Task 1.
- Produces: `export function Counter(): JSX.Element`.

- [ ] **Step 1: Стор и компоненты.** `useCounter = create<{ count: number; step: number; inc(): void; setStep(step: number): void }>()(…)`. Компоненты: `WholeStore` (`useCounter()` без селектора, показывает `count`), `CountOnly` (`useCounter((s) => s.count)`), `StepControl` (`useCounter((s) => s.step)` и `setStep`, поле ввода шага), `IncButton` (`useCounter((s) => s.inc)`). У каждого `RenderCount`, над каждым — комментарий, от чего он перерисуется.
- [ ] **Step 2: Проверка в браузере.** `bun run dev`, вкладка Counter. Клик `+`: растут бейджи `WholeStore` и `CountOnly`, `IncButton` и `StepControl` — нет. Смена шага: растут `WholeStore` и `StepControl`, `CountOnly` — нет. Если не так — чинить до совпадения. `bun run check` зелёный.
- [ ] **Step 3: Commit.** `git add -A && git commit -m "feat(react): вкладка Counter — хук стора и селекторы"`

### Task 4: Вкладка Selectors

**Files:**
- Create: `src/examples/Selectors.tsx`
- Modify: `src/App.tsx` — вкладка `selectors`

**Interfaces:**
- Produces: `export function Selectors(): JSX.Element`.

- [ ] **Step 1: Стор и компоненты.** `useProfile = create<{ name: string; city: string; age: number; setName(v: string): void; setCity(v: string): void; birthday(): void }>()(…)`. Компоненты: `NameView`, `CityView`, `AgeView` — по одному полю; `NameAndCity` — `useProfile(useShallow((s) => ({ name: s.name, city: s.city })))`; `Actions` — три экшена отдельными селекторами (`useProfile((s) => s.birthday)` и т.д.) без `useShallow`, с комментарием, что ссылки стабильны. Поля ввода имени и города, кнопка «день рождения».
- [ ] **Step 2: Проверить утверждение про цикл.** Временно заменить в `NameAndCity` селектор на `useProfile((s) => ({ name: s.name, city: s.city }))`, открыть вкладку. Expected: ошибка в консоли браузера «Maximum update depth exceeded» (или предупреждение React «The result of getSnapshot should be cached» и цикл). Записать фактический текст ошибки, вернуть `useShallow`. Над `NameAndCity` — комментарий со сломанным вариантом, фактическим текстом ошибки и причиной: хук строится на `useSyncExternalStore`, новый объект на каждый вызов — «состояние изменилось». Если цикла нет — комментарий описывает то, что на самом деле произошло, и об этом сказать ментору.
- [ ] **Step 3: Проверка в браузере.** Ввод имени: растут `NameView` и `NameAndCity`; `CityView`, `AgeView`, `Actions` — нет. «День рождения»: растёт только `AgeView`. `bun run check` зелёный.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat(react): вкладка Selectors — useShallow и стабильные экшены"`

### Task 5: Вкладка Todos

**Files:**
- Create: `src/examples/Todos.tsx`
- Modify: `src/App.tsx` — вкладка `todos`

**Interfaces:**
- Produces: `export function Todos(): JSX.Element`.

- [ ] **Step 1: Стор.** `type Todo = { id: number; title: string; done: boolean }`; `useTodos = create<{ todos: Todo[]; status: 'idle' | 'loading' | 'error'; error: string | null; add(title: string): void; toggle(id: number): void; remove(id: number): void; load(fail: boolean): Promise<void> }>()(…)`. `load`: `loading` → задержка 800 мс → три заготовленных todo и `idle`, или `error` с `error: 'сервер недоступен'`. Все обновления — новые массивы (`map`/`filter`/spread), комментарий почему: мутация не меняет ссылку, и селектор не увидит изменения.
- [ ] **Step 2: Компоненты.** `AddTodo` (поле и кнопка, только `add`), `TodoList` (`todos`, `toggle`, `remove`), `Loader` (чекбокс «уронить загрузку», кнопка «Загрузить», `disabled` при `status === 'loading'`, текст статуса и ошибки), `OutsideReact` — кнопка «Очистить вне хука», обработчик вызывает `useTodos.setState({ todos: [] })` и печатает `useTodos.getState().todos.length` в `console.log`; комментарий: так со стором работает код вне компонентов (API-клиент, роутер). У каждого `RenderCount`.
- [ ] **Step 3: Проверка в браузере.** Добавить, переключить, удалить — список обновляется, `AddTodo` не перерисовывается. «Загрузить» — кнопка неактивна ~0,8 с, затем три todo. С чекбоксом — текст ошибки. «Очистить вне хука» — список пуст, в консоли `0`. `bun run check` и `bun run build` зелёные.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat(react): вкладка Todos — async-экшен и стор вне React"`

### Task 6: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Текст по §7 спеки.** Разделы: заголовок и ссылка на zustand; «Зачем» (знакомство перед [frontend#11](https://github.com/Cringe-Driven-Development-Team/frontend/issues/11)); «Быстрый старт»; «Порядок чтения» (таблица: шаг → что увидишь, 4 скрипта и 3 вкладки); «Команды»; «Путь — что внутри»; «Подводные камни» (все шесть пунктов спеки, у каждого ссылка на файл-пример); «Версии». Факты — из фактического вывода Task 2 и проверок Task 3–5, в том числе текст ошибки из Task 4.
- [ ] **Step 2: Проверка.** Каждая команда и путь из README существуют (`bun run <cmd>` для всех из таблицы команд проходят).
- [ ] **Step 3: Commit.** `git add README.md && git commit -m "docs: README playground"`

### Task 7: Публикация

- [ ] **Step 1: Репа.** `gh repo create Cringe-Driven-Development-Team/zustand-playground --public --description "Playground: public API zustand для знакомства перед стейт-менеджером в нашем React" --source . --push`.
- [ ] **Step 2: Проверка CI.** `gh run watch` на последний прогон `CI`. Expected: зелёный. `Автоматизация` запускается только не на `main` и на issue/PR — её прогона сейчас нет, это нормально.
- [ ] **Step 3: Память.** Добавить ссылку на репу и локальный путь в `reference-cdd-links.md` в памяти.
