import { create } from 'zustand';
import { RenderCount } from '../RenderCount.tsx';

type CounterState = {
    count: number;
    step: number;
    inc: () => void;
    setStep: (step: number) => void;
};

// create — то же, что createStore из vanilla, но возвращает React-хук.
// У хука есть и методы стора: useCounter.getState(), useCounter.setState(), useCounter.subscribe().
// Провайдер не нужен: стор живёт в модуле, любой компонент просто вызывает хук.
const useCounter = create<CounterState>()((set) => ({
    count: 0,
    step: 1,
    inc: () => set((state) => ({ count: state.count + state.step })),
    setStep: (step) => set({ step }),
}));

// Хук без селектора возвращает всё состояние. Компонент перерисовывается
// при ЛЮБОМ изменении стора — и count, и step, хотя показывает только count.
function WholeStore() {
    const state = useCounter();

    return (
        <section>
            <RenderCount label="WholeStore" />
            <p>useCounter() без селектора: count = {state.count}</p>
        </section>
    );
}

// Селектор выбирает кусок состояния. Компонент перерисовывается, только когда
// результат селектора изменился (сравнение через Object.is). Смена step его не трогает.
function CountOnly() {
    const count = useCounter((state) => state.count);

    return (
        <section>
            <RenderCount label="CountOnly" />
            <p>useCounter((s) =&gt; s.count): count = {count}</p>
        </section>
    );
}

// Перерисовывается только при смене step.
function StepControl() {
    const step = useCounter((state) => state.step);
    const setStep = useCounter((state) => state.setStep);

    return (
        <section>
            <RenderCount label="StepControl" />
            <label>
                шаг:{' '}
                <input
                    type="number"
                    value={step}
                    onChange={(event) => setStep(Number(event.target.value))}
                />
            </label>
        </section>
    );
}

// Экшен — функция, созданная один раз при создании стора. Её ссылка не меняется,
// поэтому изменения стора не перерисовывают компонент, который выбрал только экшен.
// (Родитель при своём рендере перерисует его, как любой компонент без memo.)
function IncButton() {
    const inc = useCounter((state) => state.inc);

    return (
        <section>
            <RenderCount label="IncButton" />
            <button onClick={inc}>+ шаг</button>
        </section>
    );
}

export function Counter() {
    return (
        <>
            <p>Нажми «+ шаг» и поменяй шаг — смотри, чьи счётчики рендеров растут.</p>
            <WholeStore />
            <CountOnly />
            <StepControl />
            <IncButton />
        </>
    );
}
