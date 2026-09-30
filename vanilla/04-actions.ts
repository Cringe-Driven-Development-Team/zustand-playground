import { createStore } from 'zustand/vanilla';

console.log('=== 04 экшены ===');

// Экшены — функции прямо в состоянии. Снаружи их вызывают как store.getState().inc(),
// в React — выбирают селектором. Отдельных reducer/dispatch нет.
type CounterState = {
    count: number;
    status: 'idle' | 'loading' | 'done' | 'error';
    error: string | null;
    inc: () => void;
    double: () => void;
    load: (fail: boolean) => Promise<void>;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Каррированная форма createStore<CounterState>()(...): TS не умеет в одном вызове
// задать один дженерик (State) и вывести остальные (типы middleware).
// Первый вызов фиксирует State, второй выводит всё прочее.
const store = createStore<CounterState>()((set, get) => ({
    count: 0,
    status: 'idle',
    error: null,
    // set с функцией — новое значение из текущего.
    inc: () => set((state) => ({ count: state.count + 1 })),
    // get() читает актуальное состояние внутри экшена.
    double: () => set({ count: get().count * 2 }),
    // Async-экшен — обычная async-функция, которая вызывает set по ходу работы.
    load: async (fail) => {
        set({ status: 'loading', error: null });
        await delay(100);
        if (fail) {
            set({ status: 'error', error: 'сервер недоступен' });
        } else {
            set({ status: 'done', count: 42 });
        }
    },
}));

store.subscribe((state, prev) => {
    if (state.status !== prev.status) {
        console.log(`  status: ${prev.status} → ${state.status}`);
    }
});

store.getState().inc();
console.log('inc():', store.getState().count);

store.getState().double();
console.log('double():', store.getState().count);

console.log('await load(false):');
await store.getState().load(false);
console.log('  count:', store.getState().count);

console.log('await load(true):');
await store.getState().load(true);
console.log('  error:', store.getState().error);
