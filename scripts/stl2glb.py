import trimesh, numpy as np, sys
src = "/Users/ms/Downloads/Kralj Tomislav - Bista final_300k.stl"
m = trimesh.load(src, force='mesh')
print("loaded:", len(m.vertices), "verts,", len(m.faces), "faces, bounds", m.bounds.tolist())
# decimate to ~80k faces for web
target = 80000
if len(m.faces) > target:
    m = m.simplify_quadric_decimation(face_count=target)
    print("decimated to", len(m.faces), "faces")
# center on origin, drop any vertex colors (render with our own material)
m.visual = trimesh.visual.ColorVisuals(m)
m.apply_translation(-m.centroid)
# normalize scale so largest extent ~2 units (easy framing)
ext = m.extents.max()
m.apply_scale(2.0/ext)
m.merge_vertices()
m.export("public/models/tomislav-bista.glb")
print("exported public/models/tomislav-bista.glb")
