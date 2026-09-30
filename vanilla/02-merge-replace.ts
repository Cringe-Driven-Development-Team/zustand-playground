import { createStore } from 'zustand/vanilla';

console.log('=== 02 слияние и replace ===');

type State = {
    user: { name: string; role: string };
    theme: 'light' | 'dark';
    toggleTheme: () => void;
};

const store = createStore<State>()((set) => ({
    user: { name: 'Ерофей', role: 'frontend' },
    theme: 'light',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

console.log('начало:', store.getState().user);

// Ловушка: setState сливает только ВЕРХНИЙ уровень (как Object.assign).
// Вложенный user заменяется целиком, поэтому role пропадает.
// TS это видит: Partial<State> не делает user частичным — отсюда @ts-expect-error.
// @ts-expect-error — в user не хватает role
store.setState({ user: { name: 'Денис' } });
console.log('setState({ user: { name } }) — role пропал:', store.getState().user);

// Правильно: вложенный объект разворачиваем руками.
store.setState({ user: { name: 'Ерофей', role: 'frontend' } });
store.setState((state) => ({ user: { ...state.user, name: 'Денис' } }));
console.log(
    'setState((s) => ({ user: { ...s.user, name } })) — role на месте:',
    store.getState().user,
);

// setState(next, true) — replace: состояние заменяется целиком, без слияния.
// TS требует полный State вместе с экшенами. Если обойти проверку типов, экшены пропадут.
// @ts-expect-error — нет toggleTheme
store.setState({ user: { name: 'Дарья', role: 'backend' }, theme: 'dark' }, true);
console.log('replace без экшенов — typeof toggleTheme:', typeof store.getState().toggleTheme);

// Правильно: собрать полное состояние, например от начального.
store.setState({ ...store.getInitialState(), theme: 'dark' }, true);
console.log(
    'replace от getInitialState() — typeof toggleTheme:',
    typeof store.getState().toggleTheme,
);
console.log('theme:', store.getState().theme);
