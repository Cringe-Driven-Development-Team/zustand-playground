import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles.css';

// Без StrictMode: в dev он рендерит каждый компонент дважды,
// и бейджи «рендеров: N» показывали бы удвоенные числа.
createRoot(document.getElementById('root')!).render(<App />);
