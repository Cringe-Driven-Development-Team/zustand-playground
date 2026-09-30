# zustand-playground

Playground: public API [zustand](https://github.com/pmndrs/zustand) на запускаемых примерах — vanilla-стор в консоли, React-хук в браузере.

Зачем: Ерофей пишет стейт-менеджер в духе zustand для нашего React ([frontend#11](https://github.com/Cringe-Driven-Development-Team/frontend/issues/11)). Здесь можно сначала посмотреть, как устроен и как ведёт себя оригинал. Репа только для знакомства: это не эталон и не приёмка своей реализации.

## Быстрый старт

```bash
bun install
bun run vanilla
bun run dev
```

Нужен bun >= 1.4.0. `dev` открывает браузер на `http://127.0.0.1:5173`.

## Порядок чтения

Сначала vanilla — ядро без React, потом вкладки в браузере. Читай файл сверху вниз и сверяй с выводом: комментарии объясняют каждый шаг.

| Шаг | Файл | Что увидишь |
| --- | --- | --- |
| 1 | `vanilla/01-create-store.ts` | `createStore`, `getState`, `setState` объектом и функцией, `getInitialState` |
| 2 | `vanilla/02-merge-replace.ts` | Слияние только верхнего уровня: вложенный `user` теряет `role`; `replace` без экшенов теряет `toggleTheme` |
| 3 | `vanilla/03-subscribe.ts` | Подписчик зовётся на `setState({ count: 1 })`, даже если `count` уже 1, и даже на `setState({})`; молчит на `setState((s) => s)` и после отписки |
| 4 | `vanilla/04-actions.ts` | Экшены через `set` и `get`, async-экшен `idle → loading → done / error`, каррированный `createStore<T>()(…)` |
| 5 | вкладка Counter, `src/examples/Counter.tsx` | `create` и хук стора: без селектора компонент перерисовывается от всего, с селектором — только от своего поля, компонент с одним экшеном — изменения стора его не трогают |
| 6 | вкладка Selectors, `src/examples/Selectors.tsx` | Точечные подписки на поля, `useShallow` для объекта из нескольких полей, экшены без `useShallow` |
| 7 | вкладка Todos, `src/examples/Todos.tsx` | Неизменяемые обновления массива, async-загрузка с `loading`/`error`, `getState`/`setState` вне React |

Каждый vanilla-пример запускается и отдельно: `bun vanilla/02-merge-replace.ts`.

У каждого компонента в браузере бейдж «рендеров: N» — по нему видно, кого перерисовало изменение стора.

## Команды

| Команда | Что делает |
| --- | --- |
| `bun run vanilla` | Все vanilla-примеры по порядку |
| `bun run dev` | Vite dev-сервер с React-примерами |
| `bun run build` | `vite build` в `dist/` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | oxlint |
| `bun run fmt` / `bun run fmt:check` | oxfmt: отформатировать / проверить |
| `bun run check` | `fmt:check`, `lint`, `typecheck` |

CI (`.github/workflows/ci.yml`): `bun install --frozen-lockfile`, `check`, `vanilla`, `build`.

## Путь — что внутри

| Путь | Что внутри |
| --- | --- |
| `vanilla/` | Примеры `zustand/vanilla` для bun |
| `src/main.tsx` | Точка входа, рендер без `StrictMode` |
| `src/App.tsx` | Вкладки примеров |
| `src/RenderCount.tsx` | Бейдж «рендеров: N» на `useRef` |
| `src/examples/` | Вкладки Counter, Selectors, Todos: стор и компоненты в одном файле |
| `docs/superpowers/` | Спека и план этой репы |

## Подводные камни

- **`set` сливает только верхний уровень.** `setState({ user: { name } })` заменяет `user` целиком, и `role` пропадает. Вложенное разворачивай руками: `set((s) => ({ user: { ...s.user, name } }))`. → `vanilla/02-merge-replace.ts`
- **`replace: true` требует полное состояние вместе с экшенами.** TS не даст забыть экшены, а без проверки типов они пропадут. Для сброса удобно `setState({ ...getInitialState(), … }, true)`. → `vanilla/02-merge-replace.ts`
- **Подписчик зовётся на каждый `set`, даже если значения не изменились.** До слияния zustand сравнивает переданный объект с текущим состоянием по ссылке (`Object.is`), поля не сравниваются: `{ count: 1 }` и даже `{}` — новые объекты. Молчит только `set((s) => s)`. В React каждый хук подписан на весь стор, а лишний рендер отсекает селектор: его результат сравнивается с прошлым через `Object.is`. → `vanilla/03-subscribe.ts`, `src/examples/Selectors.tsx`
- **Хук без селектора перерисовывает компонент от любого изменения стора.** Выбирай нужное поле: `useStore((s) => s.count)`. → `src/examples/Counter.tsx`
- **Селектор, который возвращает новый объект, без `useShallow` — бесконечный цикл.** zustand 5 построен на `useSyncExternalStore`: новая ссылка на каждый вызов означает «состояние изменилось». В консоли `The result of getSnapshot should be cached to avoid an infinite loop`, затем `Maximum update depth exceeded`, и приложение размонтируется. Решение — `useShallow((s) => ({ … }))` или несколько селекторов по одному полю. → `src/examples/Selectors.tsx`
- **Экшены — стабильные ссылки.** Они создаются один раз вместе со стором, поэтому их выбирают обычным селектором без `useShallow`, и изменения стора не перерисовывают компонент с одними экшенами. → `src/examples/Counter.tsx`, `src/examples/Selectors.tsx`
- **Стор работает вне React.** `useStore.getState()` и `useStore.setState()` вызываются без хука — из API-клиента, роутера, обработчика событий. Подписанные компоненты увидят изменение. → `src/examples/Todos.tsx`

## Особенности окружения

- `StrictMode` выключен: в dev он рендерит каждый компонент дважды, и бейджи показывали бы удвоенные числа.
- Если Vite в открытой сессии доустанавливает зависимость в `optimizeDeps` («dependency optimized … reloading»), до перезагрузки страницы может вылететь `Invalid hook call` — это два разных чанка React. Помогает обновить страницу.
- JSX собирается без `@vitejs/plugin-react`: Vite 8 сам понимает `jsx: "react-jsx"` из `tsconfig.json`. Fast Refresh поэтому нет — при правке файла страница перезагружается целиком.

## Версии

zustand 5.0.15, React 19.3.0, Vite 8.3.1, TypeScript 7.0.2, bun 1.4.2. Стек тот же, что во фронте, только React настоящий, а не `@maninthecoat/react`.
