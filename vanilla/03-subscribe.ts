import { createStore } from 'zustand/vanilla';

console.log('=== 03 subscribe ===');

const store = createStore<{ count: number }>()(() => ({ count: 0 }));

// subscribe вызывает слушателя после каждого изменения с новым и предыдущим состоянием
// и возвращает функцию отписки. На этом построен React-хук: компонент подписывается
// и перерисовывается, когда меняется выбранная им часть состояния.
const unsubscribe = store.subscribe((state, prev) => {
    console.log(`  подписчик: ${prev.count} → ${state.count}, тот же объект: ${state === prev}`);
});

console.log('setState({ count: 1 }) — ждём вызов подписчика:');
store.setState({ count: 1 });

// Ловушка: значение не изменилось, а подписчик всё равно вызывается.
// setState ДО слияния сравнивает переданное (объект или результат функции) с текущим
// состоянием по ссылке: Object.is(next, state). Поля не сравниваются. Литерал { count: 1 }
// — новый объект, он !== state, поэтому zustand сливает его и зовёт подписчиков.
console.log('снова setState({ count: 1 }) — значение то же, но подписчик вызывается:');
store.setState({ count: 1 });

// По той же причине подписчика зовёт даже пустой объект.
console.log('setState({}) — ничего не меняем, но подписчик вызывается:');
store.setState({});

// Подписчик не вызывается, только если в setState пришёл сам текущий объект состояния:
// Object.is(state, state) — true, и zustand ничего не делает.
console.log('setState((s) => s) — ждём тишину:');
store.setState((state) => state);

unsubscribe();
console.log('после unsubscribe() setState({ count: 2 }) — ждём тишину:');
store.setState({ count: 2 });
console.log('count:', store.getState().count);
