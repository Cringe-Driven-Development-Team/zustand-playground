import { useState } from 'react';
import { create } from 'zustand';
import { RenderCount } from '../RenderCount.tsx';

type Todo = { id: number; title: string; done: boolean };

type TodosState = {
    todos: Todo[];
    status: 'idle' | 'loading' | 'error';
    error: string | null;
    add: (title: string) => void;
    toggle: (id: number) => void;
    remove: (id: number) => void;
    load: (fail: boolean) => Promise<void>;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let nextId = 1;

// Все обновления создают НОВЫЕ массивы и объекты (spread, map, filter).
// Если мутировать todos.push(...) и вернуть тот же массив, ссылка не изменится,
// селектор (s) => s.todos вернёт прежнее значение, и React ничего не перерисует.
const useTodos = create<TodosState>()((set) => ({
    todos: [],
    status: 'idle',
    error: null,
    add: (title) =>
        set((state) => ({ todos: [...state.todos, { id: nextId++, title, done: false }] })),
    toggle: (id) =>
        set((state) => ({
            todos: state.todos.map((todo) =>
                todo.id === id ? { ...todo, done: !todo.done } : todo,
            ),
        })),
    remove: (id) => set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) })),
    // Async-экшен: в zustand нет ничего особенного для асинхронности —
    // обычная async-функция, которая зовёт set до и после ожидания.
    load: async (fail) => {
        set({ status: 'loading', error: null });
        await delay(800);
        if (fail) {
            set({ status: 'error', error: 'сервер недоступен' });
            return;
        }
        set({
            status: 'idle',
            todos: ['Прочитать vanilla-примеры', 'Пройти вкладку Selectors', 'Взяться за #11'].map(
                (title) => ({ id: nextId++, title, done: false }),
            ),
        });
    },
}));

// Выбирает только экшен add — не перерисовывается от изменений списка.
// Текст поля — локальный useState: не всё состояние должно жить в сторе.
// Поэтому счётчик AddTodo растёт, пока печатаешь, — это его собственный стейт, не стор.
function AddTodo() {
    const add = useTodos((state) => state.add);
    const [title, setTitle] = useState('');

    return (
        <section>
            <RenderCount label="AddTodo" />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (title.trim()) {
                        add(title.trim());
                        setTitle('');
                    }
                }}
            >
                <input value={title} onChange={(event) => setTitle(event.target.value)} />{' '}
                <button type="submit">добавить</button>
            </form>
        </section>
    );
}

function TodoList() {
    const todos = useTodos((state) => state.todos);
    const toggle = useTodos((state) => state.toggle);
    const remove = useTodos((state) => state.remove);

    return (
        <section>
            <RenderCount label="TodoList" />
            {todos.length === 0 ? <p>список пуст</p> : null}
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={todo.done}
                                onChange={() => toggle(todo.id)}
                            />{' '}
                            {todo.done ? <s>{todo.title}</s> : todo.title}
                        </label>{' '}
                        <button onClick={() => remove(todo.id)}>удалить</button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

// Кнопка неактивна, пока идёт загрузка: второй клик не запустит вторую загрузку.
function Loader() {
    const status = useTodos((state) => state.status);
    const error = useTodos((state) => state.error);
    const load = useTodos((state) => state.load);
    const [fail, setFail] = useState(false);

    return (
        <section>
            <RenderCount label="Loader" />
            <label>
                <input
                    type="checkbox"
                    checked={fail}
                    onChange={(event) => setFail(event.target.checked)}
                />{' '}
                уронить загрузку
            </label>{' '}
            <button disabled={status === 'loading'} onClick={() => load(fail)}>
                загрузить
            </button>{' '}
            <span>
                status: {status}
                {error ? `, error: ${error}` : ''}
            </span>
        </section>
    );
}

// Стор доступен и вне React: useTodos.getState() и useTodos.setState() без хука.
// Так с ним работает код, который не компонент: API-клиент, роутер, обработчик WebSocket.
// Компонент не подписан на стор (хук не вызывается), но TodoList увидит изменение.
function OutsideReact() {
    return (
        <section>
            <RenderCount label="OutsideReact" />
            <button
                onClick={() => {
                    useTodos.setState({ todos: [] });
                    console.log('todos после очистки:', useTodos.getState().todos.length);
                }}
            >
                очистить вне хука
            </button>
        </section>
    );
}

export function Todos() {
    return (
        <>
            <p>Добавь, загрузи, урони загрузку, очисти вне хука — смотри счётчики и консоль.</p>
            <AddTodo />
            <Loader />
            <TodoList />
            <OutsideReact />
        </>
    );
}
