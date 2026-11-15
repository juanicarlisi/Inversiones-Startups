"""Arma index.html (un solo archivo) a partir de src/. Uso: python3 build.py"""
import pathlib
d = pathlib.Path(__file__).parent / 'src'
sh = (d / 'shell.html').read_text()
css = (d / 'style.css').read_text()
js = ''.join((d / f).read_text() + '\n' for f in ['p1_core.js', 'p1b_catalogo.js', 'p2_views.js', 'p3_forms.js', 'p4_app.js'])
(d.parent / 'index.html').write_text(sh.replace('/*CSS*/', css).replace('/*JS*/', js))
