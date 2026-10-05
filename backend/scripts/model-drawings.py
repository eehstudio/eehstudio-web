from pathlib import Path
import struct,json,math,html
ROOT=Path(__file__).resolve().parents[1]/'dist/fl'
raw=(ROOT/'booth.glb').read_bytes();length=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+length]);pos=20+length
blen=struct.unpack_from('<I',raw,pos)[0];buf=raw[pos+8:pos+8+blen]
meta=json.loads((ROOT/'booth_meta.json').read_text())
formats={5120:'b',5121:'B',5122:'h',5123:'H',5125:'I',5126:'f'};sizes={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def accessor(i):
 a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];fmt='<'+formats[a['componentType']]*sizes[a['type']];step=v.get('byteStride',struct.calcsize(fmt));start=v.get('byteOffset',0)+a.get('byteOffset',0)
 return [struct.unpack_from(fmt,buf,start+n*step) for n in range(a['count'])]
triangles=[]
for node in g['nodes']:
 if 'mesh' not in node:continue
 assert not any(x in node for x in ['matrix','rotation','translation','scale']), 'Expected baked coordinates in source R02'
 for p in g['meshes'][node['mesh']]['primitives']:
  verts=accessor(p['attributes']['POSITION']);ids=[x[0] for x in accessor(p['indices'])] if 'indices' in p else list(range(len(verts)))
  c=g.get('materials',[{}])[p.get('material',0)].get('pbrMetallicRoughness',{}).get('baseColorFactor',[.76,.76,.72,1]);color='#'+''.join(f'{round(max(0,min(1,n))*255):02x}' for n in c[:3])
  for k in range(0,len(ids)-2,3):triangles.append(([verts[ids[k+i]] for i in range(3)],color,node['name']))
def render(mode):
 if mode=='plan':axes=(0,2);invert=False;depth=1;W,H=1200,950
 else:axes=(0,1);invert=True;depth=2;W,H=1200,520
 points=[v for t,c,n in triangles for v in t];mins=[min(p[a] for p in points) for a in axes];maxs=[max(p[a] for p in points) for a in axes]
 scale=min((W-120)/(maxs[0]-mins[0]),(H-150)/(maxs[1]-mins[1]));ox=60;oy=100
 def project(v):return (ox+(v[axes[0]]-mins[0])*scale,oy+((maxs[1]-v[axes[1]]) if invert else (v[axes[1]]-mins[1]))*scale)
 shapes=[]
 for t,c,n in sorted(triangles,key=lambda it:sum(v[depth] for v in it[0])/3):
  xy=[project(v) for v in t];area=abs((xy[1][0]-xy[0][0])*(xy[2][1]-xy[0][1])-(xy[2][0]-xy[0][0])*(xy[1][1]-xy[0][1]))
  if area<.02:continue
  shapes.append('<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in xy)+f'" fill="{c}"/>')
 title='PLAN / TOP PROJECTION' if mode=='plan' else 'ELEVATION / FRONT PROJECTION'
 s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="FREEZE LAB {title}"><rect width="{W}" height="{H}" fill="#f8f6f0"/><g font-family="Arial,sans-serif" fill="#262622"><text x="60" y="45" font-size="24">FREEZE LAB / {title}</text><text x="60" y="71" font-size="12">EEH STUDIO · ORIGINAL MODEL R02 · VECTOR PROJECTION</text></g>'+''.join(shapes)+f'<text x="60" y="{H-24}" font-family="Arial,sans-serif" font-size="12" fill="#777">Model extent: {round((maxs[0]-mins[0])*1000):,} × {round((maxs[1]-mins[1])*1000):,} mm · Source model coordinates</text></svg>'
 (ROOT/f'{mode}-r02.svg').write_text(s)
render('plan');render('elevation')
zones=[(k,v) for k,v in meta['zones'].items() if k!='overall'];b=meta['zones']['overall'];xmin,zmin=b['min'][0],b['min'][2];xmax,zmax=b['max'][0],b['max'][2];scale=min(780/(xmax-xmin),610/(zmax-zmin));parts=[]
for i,(key,z) in enumerate(zones):
 x=60+(z['min'][0]-xmin)*scale;y=110+(z['min'][2]-zmin)*scale;w=(z['max'][0]-z['min'][0])*scale;h=(z['max'][2]-z['min'][2])*scale
 parts.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="#e1ded3" fill-opacity=".7" stroke="#6c685e" stroke-width="1"/><circle cx="{x+w/2:.2f}" cy="{y+h/2:.2f}" r="12" fill="#e65c42"/><text x="{x+w/2:.2f}" y="{y+h/2+4:.2f}" text-anchor="middle" fill="white" font-size="11">{i+1}</text>')
 dims=[round((v-u)*1000) for u,v in zip(z['min'],z['max'])];ly=120+i*47
 parts.append(f'<text x="840" y="{ly}" font-size="14">{i+1:02}. {html.escape(z["ko"])}</text><text x="840" y="{ly+19}" font-size="11" fill="#777">'+ ' × '.join(f'{d:,}' for d in dims)+' mm (X / Y / Z)</text>')
s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850" role="img" aria-label="FREEZE LAB 존별 모델 바운딩 영역"><rect width="1200" height="850" fill="#f8f6f0"/><g font-family="Arial, sans-serif" fill="#262622"><text x="60" y="45" font-size="24">FREEZE LAB / ZONING R02</text><text x="60" y="71" font-size="12">MODEL BOUNDING REGIONS · Dimensions from original model</text>'+''.join(parts)+'<text x="60" y="822" font-size="12" fill="#777">존별 바운딩 영역 · 집기 개별 실측 치수와 구분됩니다.</text></g></svg>'
(ROOT/'zoning-r02.svg').write_text(s)
print(json.dumps({'source_triangles':len(triangles),'drawings':3,'model_revision':meta['revision']}))
