import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
function App() { const [n, setN] = useState(0); return h('button', { onClick: () => setN(n + 1) }, 'n=' + n); }
createRoot(document.body).render(h(App));
