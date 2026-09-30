# zustand-playground: знакомство с public API zustand

Дата: 2026-09-30. Статус: утверждено в чате, ждёт ревью спеки.

## 1. Цель и рамки

Ерофей пишет Context API для нашего React (`@maninthecoat/react`), а после него — свой
стейт-менеджер в духе zustand
([frontend#11](https://github.com/Cringe-Driven-Development-Team/frontend/issues/11)).
С zustand он не знаком. Playground знакомит его с public API zustand на запускаемых
примерах: vanilla-стор в консоли, React-хук в браузере.

Только знакомство: репа не служит эталоном поведения и приёмкой его реализации, ветки
под его стор нет.

Критерий успеха: Ерофей клонирует репу, `bun install`, `bun run vanilla`, `bun run dev`
и проходит примеры в порядке из README. В консоли видит, как меняется состояние и когда
зовутся подписчики; в браузере — какие компоненты перерисовываются от каких селекторов.
CI зелёный.

В рамках: новая публичная репа `Cringe-Driven-Development-Team/zustand-playground`,
README, CI, автоматизация доски и Telegram.

Вне рамок:

- middleware (`persist`, `devtools`, `immer`, `subscribeWithSelector`, `combine`);
- стор через React Context (`createStore` + Context + `useStore`);
- паттерны: slices, сброс стора, стор из API-клиента;
- упражнения и сравнение с `useState`;
- тесты: примеры проверяются запуском vanilla-скриптов и сборкой;
- комментарий в frontend#11 со ссылкой на репу — после того, как ментор посмотрит репу.

## 2. Проверенные факты

- npm, 2026-09-30: `zustand` 5.0.15, `react` 19.3.0, `vite` 8.3.1. У zustand
  peer-зависимости `react >=18`, `@types/react >=18`, `immer`, `use-sync-external-store`
  (все, кроме `react`, опциональные для ядра).
- Фронт (`frontend-park-mail-ru/2026_2_Cringe_Driven_Development`, пакет `cellestial`):
  bun >= 1.4.0, Vite ^8.3.1, TypeScript ^7.0.2, oxlint, oxfmt. Playground берёт тот же
  стек, чтобы окружение было привычным.
- Наш React 1.1.0 экспортирует `useState`, `useEffect`, `useLayoutEffect`, `useMemo`,
  `useCallback`, `memo`, JSX-рантайм; Context и `useSyncExternalStore` нет. Playground
  работает на настоящем React, наш React в нём не участвует.
- Секреты `ADD_TO_PROJECT_PAT` и `TELEGRAM_BOT_TOKEN` заданы на уровне org с
  видимостью `all`: новая репа получает их без настройки.
- Локально bun 1.4.2.

## 3. Структура

Одна репа, один `package.json`, один `tsconfig.json`: `vanilla/` — bun-скрипты,
`src/` — Vite-приложение.

```
vanilla/
  01-create-store.ts
  02-merge-replace.ts
  03-subscribe.ts
  04-actions.ts
  run-all.ts
src/
  main.tsx
  App.tsx
  RenderCount.tsx
  examples/
    Counter.tsx
    Selectors.tsx
    Todos.tsx
index.html
```

Каждый пример — законченный файл с комментариями «что происходит и почему». Сторы
объявлены в том же файле, что и компоненты примера: так пример читается сверху вниз
без прыжков по файлам.

## 4. Vanilla-примеры (`zustand/vanilla`)

Каждый скрипт печатает шаги в консоль: действие и состояние после него.

| Файл | Что показывает |
| --- | --- |
| `01-create-store.ts` | `createStore`, `getState`, `getInitialState`, `setState` объектом-частью и функцией `(state) => part` |
| `02-merge-replace.ts` | `setState` сливает только верхний уровень: вложенный объект затирается целиком; `setState(next, true)` заменяет всё состояние, и экшены пропадают, если их не передать |
| `03-subscribe.ts` | `subscribe((state, prev) => …)`, отписка через возвращённую функцию; если `setState` вернул то же состояние (`Object.is`), подписчик не вызывается |
| `04-actions.ts` | экшены внутри стора через `set` и `get`, async-экшен (задержка, `loading`/`error`), типизация `createStore<State>()(…)` и почему форма каррированная |

`run-all.ts` запускает четыре скрипта по порядку с заголовком перед каждым;
`bun run vanilla` вызывает его, а отдельный скрипт — `bun vanilla/01-create-store.ts`.

## 5. React-примеры (`zustand`)

`App.tsx` — вкладки на `useState`, без роутера. `main.tsx` рендерит `App` без
`StrictMode`: в dev он рендерит компоненты дважды, и счётчики рендеров врали бы.

`RenderCount` — бейдж «рендеров: N» на `useRef`-счётчике, стоит в каждом компоненте
примеров.

| Вкладка | Что показывает |
| --- | --- |
| Counter | `create<State>()(…)`, хук стора, экшены; компонент на `useCounter()` без селектора перерисовывается при любом изменении, компонент на `useCounter((s) => s.count)` — только при изменении `count` |
| Selectors | несколько компонентов на разных полях одного стора: меняешь одно поле — перерисовывается один компонент; селектор, который возвращает новый объект, и исправление через `useShallow`; экшены — стабильные ссылки, их выбирают селектором без `useShallow` |
| Todos | экшены добавления, переключения и удаления; async-экшен фейковой загрузки с задержкой и состояниями `loading`/`error`; `getState` и `setState` вне React — из обработчика кнопки, минуя хук |

Сломанный селектор объекта без `useShallow` есть только в комментарии: в zustand 5 хук
строится на `useSyncExternalStore`, новый объект на каждый вызов означает «состояние
изменилось», и React падает с «Maximum update depth exceeded». В комментарии —
почему так и чем чинится.

## 6. Команды и CI

| Команда | Что делает |
| --- | --- |
| `bun run vanilla` | Все vanilla-примеры по порядку |
| `bun run dev` | Vite dev-сервер с React-примерами |
| `bun run build` | `vite build` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | oxlint |
| `bun run fmt` / `fmt:check` | oxfmt |
| `bun run check` | `fmt:check`, `lint`, `typecheck` |

`.github/workflows/ci.yml` на push и pull_request: bun 1.4.2,
`bun install --frozen-lockfile`, `bun run check`, `bun run vanilla`, `bun run build`.

`.github/workflows/automation.yml` — копия из openapi-playground: доска проекта и
Telegram через общие workflow из `Cringe-Driven-Development-Team/.github`.

Версии закреплены точно (`zustand` 5.0.15, `react`/`react-dom` 19.3.0 и т.д.), как в
openapi-playground: примеры не должны меняться от минорного релиза.

## 7. README

На русском, по образцу openapi-playground:

- зачем: знакомство перед frontend#11, ссылка на таску;
- быстрый старт: `bun install`, `bun run vanilla`, `bun run dev`; нужен bun >= 1.4.0;
- порядок чтения: `vanilla/01` → `04`, затем вкладки Counter → Selectors → Todos; у
  каждого шага строка «что увидишь»;
- таблица команд и таблица «Путь — что внутри»;
- «Подводные камни»: `set` сливает только верхний уровень; `replace: true` стирает
  экшены, если их не передать; селектор нового объекта без `useShallow` —
  бесконечный цикл; хук без селектора перерисовывает при любом изменении; экшены —
  стабильные ссылки; `getState`/`setState` работают вне React;
- версии: zustand 5.0.15, React 19.3, TypeScript 7.

## 8. Репа

- `Cringe-Driven-Development-Team/zustand-playground`, публичная; локально
  `F:/Github/2026_H2/zustand-playground`.
- `.gitignore` и `.gitattributes` (`* text=auto eol=lf`) как в openapi-playground,
  плюс `dist/`.
- Спека и план — в `docs/superpowers/`. Коммиты в `main`, conventional-сообщения на
  русском.
