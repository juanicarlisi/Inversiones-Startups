import { h, render } from 'preact';
import { useState } from 'preact/hooks';
function App() { const [n, setN] = useState(0); return h('button', { onClick: () => setN(n + 1) }, 'n=' + n); }
render(h(App), document.body);
