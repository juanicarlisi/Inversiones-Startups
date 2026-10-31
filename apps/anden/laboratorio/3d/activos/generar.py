"""Genera por código (Blender como módulo Python, sin interfaz) los activos 3D del centro de distribución y del hub.
Salida: salida/activos-crudos.glb. Cada pieza lleva bisel (los bordes duros son lo que delata un 3D «hecho a mano rápido»),
normales suavizadas por ángulo, UV por proyección de caja y materiales PBR (color base, metal, rugosidad, emisión).
Origen de cada pieza = el punto donde se apoya o se ancla (ver el diccionario ORIGEN al final).
Uso: .venv/bin/python activos/generar.py salida/activos-crudos.glb
"""
import math, sys
import bpy, bmesh
bpy.ops.wm.read_factory_settings(use_empty=True)  # sin cubo, cámara ni luz de fábrica
from mathutils import Vector

# ---------- materiales ----------
MATS = {}
def mat(nombre, color, metal=0.0, rug=0.6, emision=None, fuerza=0.0):
    if nombre in MATS: return MATS[nombre]
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1.0)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rug
    if emision:
        b.inputs['Emission Color'].default_value = (*emision, 1.0)
        b.inputs['Emission Strength'].default_value = fuerza
    MATS[nombre] = m
    return m

def srgb(h):  # '#rrggbb' -> lineal
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

# ---------- constructor de piezas ----------
class Pieza:
    def __init__(self, nombre):
        self.nombre = nombre; self.bm = bmesh.new(); self.slots = []
    def _slot(self, m):
        if m not in self.slots: self.slots.append(m)
        return self.slots.index(m)
    def caja(self, tam, pos, m, bisel=0.01, seg=2, rot=None, detalle=False):
        # Presupuesto de triángulos (el 3D se ejecuta también sin placa de video): bisel solo en piezas gruesas, 1 segmento salvo `detalle`.
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts: v.co.x *= tam[0]; v.co.y *= tam[1]; v.co.z *= tam[2]
        if bisel > 0 and (detalle or min(tam) >= 0.04):
            b = min(bisel, min(tam) * 0.45)
            bmesh.ops.bevel(bm, geom=list(bm.edges), offset=b, offset_type='OFFSET', segments=seg if detalle else 1, profile=0.5, affect='EDGES')
        self._agregar(bm, pos, m, rot)
    def cilindro(self, radio, largo, pos, m, eje='Y', seg=16, rot=None):
        seg = min(seg, 10); bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=radio, radius2=radio, depth=largo)  # eje Z
        rx = {'Z': (0, 0), 'Y': (math.pi / 2, 0), 'X': (0, math.pi / 2)}[eje]
        bmesh.ops.rotate(bm, verts=list(bm.verts), cent=(0, 0, 0), matrix=__import__('mathutils').Euler((rx[0], rx[1], 0)).to_matrix())
        self._agregar(bm, pos, m, rot)
    def _agregar(self, bm, pos, m, rot):
        if rot is not None:
            bmesh.ops.rotate(bm, verts=list(bm.verts), cent=(0, 0, 0), matrix=__import__('mathutils').Euler(rot).to_matrix())
        bmesh.ops.translate(bm, verts=list(bm.verts), vec=pos)
        i = self._slot(m)
        for f in bm.faces: f.material_index = i
        me = bpy.data.meshes.new('tmp'); bm.to_mesh(me); bm.free()
        self.bm.from_mesh(me)
        # from_mesh conserva material_index; ajustar índices al slot de esta pieza
        bpy.data.meshes.remove(me)
        for f in self.bm.faces[-len(self.bm.faces):]:
            pass
    def construir(self, uv_escala=1.0, uv_centrado=False, ao_angulo=40, caras_planas=False):
        bm = self.bm
        uvl = bm.loops.layers.uv.verify()
        for f in bm.faces:
            n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
            for l in f.loops:
                c = l.vert.co
                u, v = {0: (c.y, c.z), 1: (c.x, c.z), 2: (c.x, c.y)}[ax]
                if uv_centrado: u, v = u + 0.5, v + 0.5
                if caras_planas: u, v = min(max(u, 0.0), 1.0), min(max(v, 0.0), 1.0)
                l[uvl].uv = (u * uv_escala, v * uv_escala)
        me = bpy.data.meshes.new(self.nombre); bm.to_mesh(me); bm.free()
        for m in self.slots: me.materials.append(m)
        if not caras_planas:
            me.shade_smooth()
            try: me.set_sharp_from_angle(angle=math.radians(ao_angulo))
            except Exception as e: print('set_sharp_from_angle no disponible:', e)
        ob = bpy.data.objects.new(self.nombre, me); bpy.context.scene.collection.objects.link(ob)
        return ob

# Corregir indices de material tras unir: se usa un truco simple, cada pieza guarda sus materiales por orden de uso.
_orig_agregar = Pieza._agregar
def _agregar(self, bm, pos, m, rot):
    if rot is not None:
        bmesh.ops.rotate(bm, verts=list(bm.verts), cent=(0, 0, 0), matrix=__import__('mathutils').Euler(rot).to_matrix())
    bmesh.ops.translate(bm, verts=list(bm.verts), vec=pos)
    i = self._slot(m)
    n0 = len(self.bm.faces)
    me = bpy.data.meshes.new('tmp'); bm.to_mesh(me); bm.free()
    self.bm.from_mesh(me); bpy.data.meshes.remove(me)
    self.bm.faces.ensure_lookup_table()
    for f in self.bm.faces[n0:]: f.material_index = i
Pieza._agregar = _agregar

# ---------- paleta ----------
ACERO = mat('acero_galvanizado', srgb('#aeb4ba'), 0.85, 0.38)
ACERO_OSC = mat('acero_oscuro', srgb('#3a3f45'), 0.7, 0.45)
PINTURA_AZ = mat('pintura_azul', srgb('#1f4e9c'), 0.2, 0.42)
GRAFITO = mat('pintura_grafito', srgb('#3b4048'), 0.35, 0.5)
PINTURA_AM = mat('pintura_amarilla', srgb('#e8b21a'), 0.15, 0.5)
GOMA = mat('goma_cinta', srgb('#1c1d1f'), 0.0, 0.85)
MADERA = mat('madera_pallet', srgb('#b98a54'), 0.0, 0.78)
BLANCO = mat('chapa_blanca', srgb('#cfd4d8'), 0.25, 0.5)
CARTON = mat('carton', srgb('#ffffff'), 0.0, 0.85)
LED = mat('led', srgb('#ffffff'), 0.0, 0.3, emision=(1.0, 0.97, 0.9), fuerza=6.0)
CHALECO = mat('chaleco_alta_visibilidad', srgb('#e5ff1a'), 0.0, 0.7)
PIEL = mat('piel', srgb('#c98f6a'), 0.0, 0.6)
JEAN = mat('pantalon', srgb('#26374f'), 0.0, 0.8)
CASCO = mat('casco', srgb('#f5f5f5'), 0.0, 0.4)
VIDRIO = mat('vidrio', srgb('#1b2a33'), 0.0, 0.08)
ROJO = mat('pintura_roja', srgb('#b3222a'), 0.2, 0.45)

obras = {}
ORIGEN = {}

# 1. paquete: cubo unitario con bisel (se escala por instancia)
p = Pieza('paquete_hd'); p.caja((1, 1, 1), (0, 0, 0), CARTON, bisel=0.05, seg=2, detalle=True); obras['paquete_hd'] = p.construir(uv_centrado=True)
ORIGEN['paquete_hd'] = 'centro del cubo unitario, con bisel real (108 triángulos)'
p = Pieza('paquete'); p.caja((1, 1, 1), (0, 0, 0), CARTON, bisel=0); obras['paquete'] = p.construir(uv_centrado=True, caras_planas=True)
ORIGEN['paquete'] = 'centro del cubo unitario, 12 triángulos (el bisel va en un mapa de normales)'

# 2. bandeja del sorter (ancho 0.50 en x, 0.42 en z) con carro; origen = cara superior de la bandeja
p = Pieza('bandeja')
p.caja((0.50, 0.012, 0.42), (0, -0.006, 0), ACERO, 0.004, 2)
for sz in (-1, 1): p.caja((0.50, 0.05, 0.012), (0, 0.019, sz * 0.204), ACERO, 0.004, 2)
p.caja((0.012, 0.05, 0.42), (-0.244, 0.019, 0), ACERO, 0.004, 2)
p.caja((0.18, 0.09, 0.26), (0, -0.07, 0), ACERO_OSC, 0.01, 2)
for sx in (-1, 1):
    p.cilindro(0.045, 0.03, (sx * 0.12, -0.14, 0.13), GOMA, 'Z', 14)
    p.cilindro(0.045, 0.03, (sx * 0.12, -0.14, -0.13), GOMA, 'Z', 14)
p.caja((0.34, 0.03, 0.05), (0, -0.115, 0), ACERO_OSC, 0.006, 1)
obras['bandeja'] = p.construir(); ORIGEN['bandeja'] = 'cara superior de la bandeja, centro'

# 3. jaula con ruedas (0.80 x 0.70 x 1.70); origen = piso, centro
p = Pieza('jaula')
p.caja((0.80, 0.06, 0.70), (0, 0.13, 0), ACERO_OSC, 0.01, 2)
for sx in (-1, 1):
    for sz in (-1, 1):
        p.cilindro(0.06, 0.04, (sx * 0.33, 0.06, sz * 0.28), GOMA, 'Z', 14)
        p.caja((0.03, 1.55, 0.03), (sx * 0.385, 0.95, sz * 0.335), ACERO, 0.005, 1)
for y in (0.16, 0.55, 0.95, 1.35, 1.72):
    for sz in (-1, 1): p.caja((0.80, 0.022, 0.022), (0, y, sz * 0.335), ACERO, 0.004, 1)
    for sx in (-1, 1): p.caja((0.022, 0.022, 0.70), (sx * 0.385, y, 0), ACERO, 0.004, 1)
for i in range(1, 9):  # malla: barras verticales en el fondo y a los lados
    x = -0.385 + i * 0.77 / 9; p.caja((0.008, 1.5, 0.008), (x, 0.95, -0.335), ACERO, 0.001, 1)
for i in range(1, 8):
    z = -0.335 + i * 0.67 / 8
    for sx in (-1, 1): p.caja((0.008, 1.5, 0.008), (sx * 0.385, 0.95, z), ACERO, 0.001, 1)
for j in range(1, 6):
    y = 0.16 + j * 0.25
    p.caja((0.77, 0.007, 0.007), (0, y, -0.335), ACERO, 0.001, 1)
    for sx in (-1, 1): p.caja((0.007, 0.007, 0.67), (sx * 0.385, y, 0), ACERO, 0.001, 1)
p.caja((0.30, 0.18, 0.012), (0, 1.0, 0.345), PINTURA_AM, 0.003, 1)
obras['jaula'] = p.construir(); ORIGEN['jaula'] = 'piso, centro'

# 4. pallet europeo 1.20 x 0.80 x 0.144; origen = piso, centro
p = Pieza('pallet')
for i, x in enumerate((-0.54, 0, 0.54)):
    for z in (-0.34, 0, 0.34): p.caja((0.14, 0.078, 0.14), (x, 0.039 + 0.022, z), MADERA, 0.008, 1)
for z in (-0.33, 0, 0.33): p.caja((1.2, 0.022, 0.1), (0, 0.011, z), MADERA, 0.006, 1)
for k in range(5): p.caja((0.1, 0.022, 0.8), (-0.55 + k * 0.275, 0.133, 0), MADERA, 0.006, 1) if False else None
for k in range(5): p.caja((1.2, 0.022, 0.14 if k in (0, 4) else 0.1), (0, 0.133, -0.33 + k * 0.165), MADERA, 0.006, 1)
obras['pallet'] = p.construir(uv_escala=1.0); ORIGEN['pallet'] = 'piso, centro'

# 5. módulo de cinta transportadora de 1.0 m (eje +X); origen = cara superior de la cinta, centro
p = Pieza('cinta')
p.caja((1.0, 0.012, 0.74), (0, -0.016, 0), GOMA, 0.003, 1)
for sz in (-1, 1):
    p.caja((1.0, 0.16, 0.035), (0, -0.09, sz * 0.395), PINTURA_AZ, 0.006, 2)
    p.caja((1.0, 0.03, 0.06), (0, 0.0, sz * 0.40), ACERO, 0.006, 2)
for sx in (-1, 1):
    for sz in (-1, 1): p.caja((0.05, 0.62, 0.05), (sx * 0.45, -0.40, sz * 0.38), ACERO_OSC, 0.006, 1)
p.caja((0.03, 0.03, 0.80), (-0.49, -0.10, 0), ACERO_OSC, 0.004, 1)
obras['cinta'] = p.construir(); ORIGEN['cinta'] = 'cara superior de la cinta, centro'

# 6. tolva (chute) 1.5 x 0.7 con bordes; eje +X, origen = extremo alto, centro
p = Pieza('tolva')
p.caja((1.5, 0.02, 0.7), (0.75, -0.01, 0), ACERO, 0.004, 2)
for sz in (-1, 1): p.caja((1.5, 0.12, 0.025), (0.75, 0.05, sz * 0.3625), PINTURA_AM, 0.006, 2)
obras['tolva'] = p.construir(); ORIGEN['tolva'] = 'extremo alto, centro'

# 7. viga en I unitaria (largo 1 en +X, alto 0.30, ala 0.20); origen = centro
p = Pieza('viga_I')
p.caja((1, 0.02, 0.20), (0.5, 0.14, 0), GRAFITO, 0.004, 1); p.caja((1, 0.02, 0.20), (0.5, -0.14, 0), GRAFITO, 0.004, 1)
p.caja((1, 0.26, 0.012), (0.5, 0, 0), GRAFITO, 0.002, 1)
obras['viga_I'] = p.construir(); ORIGEN['viga_I'] = 'extremo, centro de la sección'

# 8. luminaria LED lineal 1.2 x 0.12; origen = centro
p = Pieza('luminaria')
p.caja((1.2, 0.05, 0.14), (0, 0, 0), BLANCO, 0.01, 2); p.caja((1.12, 0.012, 0.10), (0, -0.028, 0), LED, 0.003, 1)
obras['luminaria'] = p.construir(); ORIGEN['luminaria'] = 'centro'

# 9. acoplado 13.6 m (eje +X, parte trasera en x=0, puertas abiertas hacia -X); origen = piso
p = Pieza('acoplado')
p.caja((13.6, 2.6, 2.5), (6.8, 2.1, 0), BLANCO, 0.04, 2)
p.caja((13.6, 0.22, 2.1), (6.8, 0.65, 0), ACERO_OSC, 0.02, 1)
for ex in (1.4, 2.7, 3.9): 
    for sz in (-1, 1):
        p.cilindro(0.5, 0.26, (ex + 7.3, 0.5, sz * 1.0), GOMA, 'Z', 20); p.cilindro(0.27, 0.27, (ex + 7.3, 0.5, sz * 1.0), ACERO, 'Z', 16)
p.caja((13.6, 0.04, 2.55), (6.8, 3.42, 0), BLANCO, 0.01, 1)
p.caja((0.06, 2.3, 2.3), (0.0, 2.1, 0), ACERO_OSC, 0.01, 1)  # marco trasero
obras['acoplado'] = p.construir(); ORIGEN['acoplado'] = 'piso, extremo trasero, centro'

# 10. cabina de tractor (eje +X hacia adelante); origen = piso, eje trasero
p = Pieza('cabina')
p.caja((2.2, 0.35, 2.4), (0.6, 0.85, 0), ACERO_OSC, 0.03, 2)
p.caja((2.1, 1.8, 2.5), (1.0, 2.0, 0), PINTURA_AZ, 0.12, 3)
p.caja((0.7, 0.9, 2.3), (2.05, 2.5, 0), VIDRIO, 0.06, 2)
p.caja((0.4, 0.5, 2.5), (2.2, 1.3, 0), PINTURA_AZ, 0.08, 2)
for sx, r in ((0.0, 0.5), (2.0, 0.5)):
    for sz in (-1, 1):
        p.cilindro(r, 0.3, (sx, r, sz * 1.0), GOMA, 'Z', 20); p.cilindro(0.28, 0.31, (sx, r, sz * 1.0), ACERO, 'Z', 16)
obras['cabina'] = p.construir(); ORIGEN['cabina'] = 'piso, eje trasero, centro'

# 11. operario con chaleco (1.75 m); torso+cabeza, pierna izq. y pierna der. con origen en la cadera
p = Pieza('operario_torso')
p.caja((0.26, 0.55, 0.40), (0, 1.20, 0), CHALECO, 0.05, 2)
p.caja((0.22, 0.20, 0.22), (0, 1.62, 0), PIEL, 0.06, 2); p.caja((0.24, 0.10, 0.24), (0, 1.74, 0), CASCO, 0.045, 2)
for sz in (-1, 1): p.caja((0.12, 0.55, 0.12), (0, 1.15, sz * 0.26), JEAN if False else CHALECO, 0.04, 2)
p.caja((0.2, 0.025, 0.40), (0.012, 1.33, 0), ACERO, 0.01, 1)  # banda reflectiva
obras['operario_torso'] = p.construir(); ORIGEN['operario_torso'] = 'piso, centro'
for nombre, sz in (('operario_pierna_i', -1), ('operario_pierna_d', 1)):
    p = Pieza(nombre); p.caja((0.16, 0.86, 0.15), (0, -0.43, 0), JEAN, 0.05, 2); p.caja((0.26, 0.09, 0.17), (0.05, -0.855, 0), ACERO_OSC, 0.03, 2)
    ob = p.construir(); ob.location = (0, 0.93, sz * 0.11); obras[nombre] = ob; ORIGEN[nombre] = 'cadera (y=0.93 sobre el piso)'

# ---------- exportar ----------
salida = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else sys.argv[1]
bpy.ops.export_scene.gltf(filepath=salida, export_format='GLB', export_apply=True, export_yup=False,
                          export_materials='EXPORT', export_image_format='NONE', export_extras=False)
tri = {n: sum(len(po.vertices) - 2 for po in o.data.polygons) for n, o in obras.items()}
print('Blender', bpy.app.version_string, '| activos:', len(obras), '| triangulos aprox.:', tri)
print('ORIGENES', ORIGEN)
