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

// Ловушка: значение не изменилось, но слияние создаёт НОВЫЙ объект состояния,
// поэтому подписчик всё равно вызывается. zustand сравнивает не поля, а ссылки.
console.log('снова setState({ count: 1 }) — значение то же, но подписчик вызывается:');
store.setState({ count: 1 });

// Подписчик не вызывается, только если setState вернул то же самое состояние
// (Object.is(next, current)).
console.log('setState((s) => s) — ждём тишину:');
store.setState((state) => state);

unsubscribe();
console.log('после unsubscribe() setState({ count: 2 }) — ждём тишину:');
store.setState({ count: 2 });
console.log('count:', store.getState().count);
