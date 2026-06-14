import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
    title: (title) => title,
    resolve: (name) => {
        const page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page();
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
        window.requestAnimationFrame(() => {
            document.getElementById('app-loading-fallback')?.remove();
        });
    },
    progress: {
        color: '#059669',
    },
});
