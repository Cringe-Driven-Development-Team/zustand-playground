import { useState, type JSX } from 'react';
import { Counter } from './examples/Counter.tsx';

type Tab = {
    id: 'counter' | 'selectors' | 'todos';
    title: string;
    Component: () => JSX.Element;
};

// Вкладки примеров в порядке чтения из README.
const tabs: Tab[] = [{ id: 'counter', title: 'Counter', Component: Counter }];

export function App() {
    const [activeId, setActiveId] = useState<Tab['id'] | undefined>(tabs[0]?.id);
    const active = tabs.find((tab) => tab.id === activeId);

    return (
        <main>
            <h1>zustand-playground</h1>
            <nav>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={tab.id === activeId ? 'active' : undefined}
                        onClick={() => setActiveId(tab.id)}
                    >
                        {tab.title}
                    </button>
                ))}
            </nav>
            {active ? <active.Component /> : <p>Примеры появятся здесь</p>}
        </main>
    );
}
