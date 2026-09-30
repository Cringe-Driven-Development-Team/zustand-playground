import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { RenderCount } from '../RenderCount.tsx';

type ProfileState = {
    name: string;
    city: string;
    age: number;
    setName: (name: string) => void;
    setCity: (city: string) => void;
    birthday: () => void;
};

const useProfile = create<ProfileState>()((set) => ({
    name: 'Ерофей',
    city: 'Москва',
    age: 19,
    setName: (name) => set({ name }),
    setCity: (city) => set({ city }),
    birthday: () => set((state) => ({ age: state.age + 1 })),
}));

// Три компонента на трёх полях одного стора. Каждый перерисовывается,
// только когда меняется его поле: стор один, а подписки точечные.
function NameView() {
    const name = useProfile((state) => state.name);
    return (
        <section>
            <RenderCount label="NameView" />
            <p>name = {name}</p>
        </section>
    );
}

function CityView() {
    const city = useProfile((state) => state.city);
    return (
        <section>
            <RenderCount label="CityView" />
            <p>city = {city}</p>
        </section>
    );
}

function AgeView() {
    const age = useProfile((state) => state.age);
    return (
        <section>
            <RenderCount label="AgeView" />
            <p>age = {age}</p>
        </section>
    );
}

// Нужно несколько полей сразу — селектор возвращает объект.
//
// Так НЕЛЬЗЯ:
//     const { name, city } = useProfile((state) => ({ name: state.name, city: state.city }));
// Селектор на каждый вызов создаёт новый объект. В zustand 5 хук построен на
// useSyncExternalStore из React: новая ссылка = «состояние изменилось» = ещё рендер,
// а в рендере селектор опять создаёт новый объект — и так по кругу. В консоли:
//     The result of getSnapshot should be cached to avoid an infinite loop
//     Uncaught Error: Maximum update depth exceeded.
// и всё приложение размонтируется — страница становится пустой (error boundary нет).
//
// useShallow сравнивает результат поверхностно (по полям верхнего уровня) и отдаёт
// прежнюю ссылку, если поля те же. Компонент перерисуется от name и от city, но не от age.
function NameAndCity() {
    const { name, city } = useProfile(
        useShallow((state) => ({ name: state.name, city: state.city })),
    );
    return (
        <section>
            <RenderCount label="NameAndCity" />
            <p>
                useShallow: {name} из города {city}
            </p>
        </section>
    );
}

// Экшены создаются один раз вместе со стором, их ссылки не меняются.
// Поэтому их выбирают обычными селекторами по одному, без useShallow,
// и компонент с одними экшенами не перерисовывается от изменения данных.
function Actions() {
    const setName = useProfile((state) => state.setName);
    const setCity = useProfile((state) => state.setCity);
    const birthday = useProfile((state) => state.birthday);
    return (
        <section>
            <RenderCount label="Actions" />
            <p>
                <label>
                    name: <input onChange={(event) => setName(event.target.value)} />
                </label>{' '}
                <label>
                    city: <input onChange={(event) => setCity(event.target.value)} />
                </label>{' '}
                <button onClick={birthday}>день рождения</button>
            </p>
        </section>
    );
}

export function Selectors() {
    return (
        <>
            <p>Меняй имя, город и возраст — смотри, чьи счётчики рендеров растут.</p>
            <Actions />
            <NameView />
            <CityView />
            <AgeView />
            <NameAndCity />
        </>
    );
}
