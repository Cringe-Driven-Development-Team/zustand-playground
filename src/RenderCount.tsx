import { useRef } from 'react';

// Бейдж «сколько раз перерисовался компонент, внутри которого он стоит».
// Счётчик в useRef, а не в useState: изменение ref не вызывает рендер,
// а setState внутри рендера сам вызвал бы ещё один рендер и счётчик врал бы.
export function RenderCount({ label }: { label: string }) {
    const renders = useRef(0);
    renders.current += 1;

    return (
        <span className="render-count">
            {label}: рендеров {renders.current}
        </span>
    );
}
