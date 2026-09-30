import { createStore } from 'zustand/vanilla';

console.log('=== 01 createStore, getState, setState ===');

// createStore принимает функцию, которая возвращает начальное состояние.
// Стор — обычный объект с четырьмя методами: getState, setState, subscribe, getInitialState.
// React тут не нужен: zustand/vanilla работает в любом JS.
type State = { count: number; text: string };

const store = createStore<State>()(() => ({ count: 0, text: 'привет' }));

console.log('getState():', store.getState());

// setState с объектом — частичное обновление: переданные поля сливаются с текущим
// состоянием, остальные (text) сохраняются.
store.setState({ count: 1 });
console.log('setState({ count: 1 }):', store.getState());

// setState с функцией — когда новое значение зависит от текущего.
// Функция получает актуальное состояние и возвращает часть для слияния.
store.setState((state) => ({ count: state.count + 1 }));
console.log('setState((s) => ({ count: s.count + 1 })):', store.getState());

// getInitialState — состояние, с которого стор начинал. Пригодится для сброса.
console.log('getInitialState():', store.getInitialState());
