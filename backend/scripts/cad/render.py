"""CPU depth-buffer renderer + visible-edge SVG from the identical GLB source mesh.
This creates architectural projections, not image edits or AI-generated illustrations.
"""
import math,html
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from geometry import hexrgb
VIEWS={'iso':([1,1,1],'AXONOMETRIC'),'plan':([0,1,0],'PLAN / TOP'),'front':([0,0,1],'FRONT ELEVATION'),'left':([-1,0,0],'LEFT ELEVATION'),'right':([1,0,0],'RIGHT ELEVATION')}

def edges(part):
 v=part['v'];tri=part['f'];weld={};mapv=[];vv=[]
 for p in v:
  key=tuple(np.round(p,6));i=weld.get(key)
  if i is None:i=len(vv);weld[key]=i;vv.append(p)
  mapv.append(i)
 fs=np.asarray(mapv)[tri];v=np.array(vv);norm=np.cross(v[fs[:,1]]-v[fs[:,0]],v[fs[:,2]]-v[fs[:,0]]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-12);es={}
 for face,n in zip(fs,norm):
  for a,b in zip(face,np.roll(face,-1)):es.setdefault(tuple(sorted([int(a),int(b)])),[]).append(n)
 out=[]
 for (a,b),ns in es.items():
  if a!=b and (len(ns)==1 or any(abs(float(np.dot(ns[0],n)))<.92 for n in ns[1:])):out.append([v[a],v[b]])
 return np.asarray(out).reshape(-1,2,3)

def render_views(m,dest):
 allv=np.vstack([p['v'] for p in m.parts]);results=[]
 edgecache=[edges(p) for p in m.parts];center=(allv.min(0)+allv.max(0))/2
 for mode,(vec,label) in VIEWS.items():
  direction=np.array(vec,float);direction/=np.linalg.norm(direction);up=np.array([0,0,-1.]) if mode=='plan' else np.array([0.,1,0]);right=np.cross(up,direction);right/=np.linalg.norm(right);up=np.cross(direction,right);basis=np.stack([right,-up,direction],axis=1)
  proj=(allv-center)@basis;lo=proj[:,:2].min(0);hi=proj[:,:2].max(0);span=hi-lo;W=1800;scale=(W-180)/max(span[0],1e-4);H=int(np.clip(span[1]*scale+170,540,1500));scale=min(scale,(H-160)/max(span[1],1e-4));origin=np.array([W/2,H/2-8])-(lo+hi)/2*scale
  depth=np.full((H,W),-np.inf,dtype=np.float32);im=np.full((H,W,3),255,dtype=np.uint8);pv=[]
  for part in m.parts:
   p=(part['v']-center)@basis;p[:,:2]=p[:,:2]*scale+origin;pv.append(p)
   tris=p[part['f']];world=part['v'][part['f']];ns=np.cross(world[:,1]-world[:,0],world[:,2]-world[:,0]);ns/=np.maximum(np.linalg.norm(ns,axis=1)[:,None],1e-12)
   col=np.array(hexrgb(part['color']))*255
   for t,n in zip(tris,ns):
    xmin=max(0,int(np.floor(t[:,0].min())));xmax=min(W-1,int(np.ceil(t[:,0].max())));ymin=max(0,int(np.floor(t[:,1].min())));ymax=min(H-1,int(np.ceil(t[:,1].max())))
    if xmin>xmax or ymin>ymax:continue
    ax,ay,az=t[0];bx,by,bz=t[1];cx,cy,cz=t[2];den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy)
    if abs(den)<1e-7:continue
    xx,yy=np.meshgrid(np.arange(xmin,xmax+1,dtype=np.float32)+.5,np.arange(ymin,ymax+1,dtype=np.float32)+.5)
    aa=((by-cy)*(xx-cx)+(cx-bx)*(yy-cy))/den;bb=((cy-ay)*(xx-cx)+(ax-cx)*(yy-cy))/den;cc=1-aa-bb
    z=aa*az+bb*bz+cc*cz;patch=depth[ymin:ymax+1,xmin:xmax+1];inside=(aa>=-.00001)&(bb>=-.00001)&(cc>=-.00001)&(z>patch)
    patch[inside]=z[inside]
    shade=.78+.22*abs(np.dot(n,np.array([.25,.87,.42])));c=np.clip(col*shade,0,255).astype(np.uint8);im[ymin:ymax+1,xmin:xmax+1][inside]=c
  color=Image.fromarray(im);draw=ImageDraw.Draw(color);lineimage=Image.new('RGB',(W,H),'white');linedraw=ImageDraw.Draw(lineimage);paths=[];epsilon=max(np.ptp(proj[:,2])*.0008,.001)
  for part,ee in zip(m.parts,edgecache):
   if len(ee)==0:continue
   ev=(ee-center)@basis;ev[:,:,:2]=ev[:,:,:2]*scale+origin
   for a,b in ev:
    length=np.linalg.norm(b[:2]-a[:2]);n=max(2,int(length/1.25)+1);t=np.linspace(0,1,n);p=a+(b-a)*t[:,None];xx=np.clip(np.round(p[:,0]).astype(int),0,W-1);yy=np.clip(np.round(p[:,1]).astype(int),0,H-1)
    visible=p[:,2]>=depth[yy,xx]-epsilon
    starts=np.where(visible & np.r_[True,~visible[:-1]])[0];ends=np.where(visible & np.r_[~visible[1:],True])[0]
    for st,en in zip(starts,ends):
     if en<=st:continue
     u,v=p[st,:2],p[en,:2]
     if np.linalg.norm(v-u)<1.5:continue
     draw.line([tuple(u),tuple(v)],fill=(71,79,86),width=1);linedraw.line([tuple(u),tuple(v)],fill=(44,56,65),width=1)
     paths.append(f'M{u[0]:.1f} {u[1]:.1f}L{v[0]:.1f} {v[1]:.1f}')
  # Minimal viewport labels: view, orientation, provenance. No decorative board.
  footer=f'{label}   /   '+('SOURCE MODEL R02' if m.id=='freeze-lab' else 'PHOTO RECONSTRUCTION / NTS' if m.id=='social-value-market' else 'SOURCE PLAN RECONSTRUCTION / NTS')
  text=f'<text x="42" y="{H-27}" font-family="Arial,sans-serif" font-size="14" letter-spacing="1.3" fill="#65727b">{html.escape(footer)}</text>'
  if mode=='plan':
   for x,y,z,t in m.annotations:
    pp=(np.array([x,y,z])-center)@basis;xx,yy=pp[:2]*scale+origin
    text+=f'<text x="{xx:.1f}" y="{yy:.1f}" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#172c3a" stroke="white" stroke-width="5" paint-order="stroke">{html.escape(t)}</text>'
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="{html.escape(m.title+" "+label)}"><rect width="100%" height="100%" fill="white"/><path d="'+''.join(paths)+'" fill="none" stroke="#2c3841" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"/>'+text+'</svg>'
  (dest/(mode+'.svg')).write_text(svg)
  if mode=='iso':color.save(dest/'iso.webp','WEBP',quality=96,method=6)
  preview=Path('/workspace/scratch/2f3c5131a869/cad-preview');preview.mkdir(exist_ok=True);(color if mode=='iso' else lineimage).save(preview/(m.id+'-'+mode+'.png'))
  results.append({'id':mode,'label':label,'svg':'space/cad/'+m.id+'/'+mode+'.svg','src':'space/cad/'+m.id+('/iso.webp' if mode=='iso' else '/'+mode+'.svg'),'width':W,'height':H})
 return results
