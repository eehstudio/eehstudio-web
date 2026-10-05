"""Shared geometry for interactive GLB and deterministic orthographic drawings.
Coordinates: metres, +Y up, front looks along -Z. No inferred size is a survey.
"""
import json,struct,math
from pathlib import Path
from collections import defaultdict
import numpy as np

class Model:
 def __init__(self,id,title,note,sources):self.id=id;self.title=title;self.note=note;self.sources=sources;self.parts=[];self.dimensions=[];self.annotations=[]
 def mesh(self,name,v,f,color='#e6e8ea',layer='fixtures'):
  self.parts.append(dict(name=name,v=np.asarray(v,dtype=float),f=np.asarray(f,dtype=np.int32),color=color,layer=layer))
 def box(self,name,x,y,z,w,h,d,color='#e6e8ea',layer='fixtures',rot=0):
  v=np.array([[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],float)*[w/2,h/2,d/2]
  if rot:
   a=math.radians(rot);v=v@np.array([[math.cos(a),0,-math.sin(a)],[0,1,0],[math.sin(a),0,math.cos(a)]]).T
  v += [x,y+h/2,z]
  f=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[3,7,6],[3,6,2],[0,4,7],[0,7,3],[1,2,6],[1,6,5]]
  self.mesh(name,v,f,color,layer)
 def cylinder(self,name,x,y,z,r,h,color='#d4d9dd',n=20,rt=None,layer='fixtures'):
  rt=r if rt is None else rt;angles=np.arange(n)*2*math.pi/n
  v=[[x+r*math.cos(a),y,z+r*math.sin(a)] for a in angles]+[[x+rt*math.cos(a),y+h,z+rt*math.sin(a)] for a in angles]+[[x,y,z],[x,y+h,z]]
  f=[]
  for i in range(n):j=(i+1)%n;f += [[i,j,n+j],[i,n+j,n+i],[2*n,j,i],[2*n+1,n+i,n+j]]
  self.mesh(name,v,f,color,layer)
 def beam(self,name,a,b,w,color='#bcc3c8',layer='frame'):
  a,b=np.array(a,float),np.array(b,float);axis=(b-a)/np.linalg.norm(b-a);side=np.cross(axis,[0,1,0])
  if np.linalg.norm(side)<1e-6:side=np.cross(axis,[1,0,0])
  side=side/np.linalg.norm(side)*w/2;up=np.cross(axis,side)
  v=[p+u*side+v*up for p in [a,b] for u,v in [(-1,-1),(1,-1),(1,1),(-1,1)]]
  self.mesh(name,v,[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]],color,layer)
 def shelf(self,name,x,y,z,w,h,d,color='#e2e5e8',tiers=4):
  t=.025
  for dx in [-w/2,w/2]:self.box(name+' side',x+dx,y,z,t,h,d,color)
  self.box(name+' back',x,y,z-d/2,w,h,t,color)
  for yy in np.linspace(0,h,tiers+1):self.box(name+' shelf',x,y+yy,z,w,.025,d,color)
 def table(self,name,x,z,w,d,h=.75,color='#e7e8e9'):
  self.box(name+' top',x,h-.045,z,w,.045,d,color)
  for dx in [-w/2+.06,w/2-.06]:
   for dz in [-d/2+.06,d/2-.06]:self.box(name+' leg',x+dx,0,z+dz,.04,h-.04,.04,'#899097')
 def chair(self,name,x,z,h=.45,color='#e2e5e8'):
  self.cylinder(name+' seat',x,h,z,.18,.05,color)
  for dx in [-.115,.115]:
   for dz in [-.115,.115]:self.box(name+' leg',x+dx,0,z+dz,.025,h,.025,'#737d86')
  self.box(name+' back',x,h+.06,z-.16,.34,.28,.035,color)
 def crate(self,name,x,y,z,w=.53,d=.36,h=.28,color='#d64234',detail=True):
  # Hollow plastic stackable crate: perimeter rails, uprights, gridded sides.
  self.box(name+' bottom',x,y,z,w,.018,d,color)
  for yy in [y+.02,y+h-.026]:
   for dz in [-d/2,d/2]:self.box(name+' rim',x,yy,z+dz,w,.023,.018,color)
   for dx in [-w/2,w/2]:self.box(name+' rim',x+dx,yy,z,.018,.023,d,color)
  for dx in [-w/2,w/2]:
   for dz in [-d/2,d/2]:self.box(name+' corner',x+dx,y,z+dz,.019,h,.019,color)
  if detail:
   for xx in np.linspace(-w/2,w/2,10)[1:-1]:
    for dz in [-d/2,d/2]:self.box(name+' lattice',x+xx,y+.025,z+dz,.008,h-.05,.01,color)
   for yy in np.linspace(y+.025,y+h-.025,5)[1:-1]:
    for dz in [-d/2,d/2]:self.box(name+' lattice',x,yy,z+dz,w-.03,.008,.012,color)
 def woodbin(self,name,x,y,z,w=.32,d=.38,h=.22):
  wood='#b6a18a';self.box(name+' base',x,y,z,w,.018,d,wood)
  for dz in [-d/2,d/2]:
   for i in range(3):self.box(name+' slat',x,y+.02+i*.057,z+dz,w,.052,.014,wood)
   # handle opening is geometry, not a texture.
   self.box(name+' handle lower',x,y+.183,z+dz,w,.018,.014,wood)
   for dx in [-w*.34,w*.34]:self.box(name+' handle side',x+dx,y+.197,z+dz,w*.32,.027,.014,wood)
   self.box(name+' handle upper',x,y+.223,z+dz,w,.015,.014,wood)
  for dx in [-w/2,w/2]:self.box(name+' side',x+dx,y,z,.014,h,d,wood)
  self.box(name+' label',x,y+h+.027,z-d*.3,w*.72,.005,.09,'#ffffff')
 def glb(self,path):
  # Weld colour/layer batches for low draw-call count, preserving source part names in metadata.
  groups=defaultdict(list)
  for p in self.parts:groups[(p['color'],p['layer'])].append(p)
  raw=bytearray();views=[];acc=[];meshes=[];nodes=[];mats=[]
  def buffer(a,typ,component):
   while len(raw)%4:raw.append(0)
   offset=len(raw);b=a.tobytes();raw.extend(b);vi=len(views);views.append(dict(buffer=0,byteOffset=offset,byteLength=len(b)))
   ai=len(acc);v=dict(bufferView=vi,componentType=component,count=len(a),type=typ)
   if typ=='VEC3':v.update(min=a.min(0).tolist(),max=a.max(0).tolist())
   acc.append(v);return ai
  for (color,layer),parts in groups.items():
   vertices=[];normals=[]
   for p in parts:
    tris=p['v'][p['f']];n=np.cross(tris[:,1]-tris[:,0],tris[:,2]-tris[:,0]);n/=np.maximum(np.linalg.norm(n,axis=1)[:,None],1e-12)
    vertices.extend(tris.reshape(-1,3));normals.extend(np.repeat(n,3,axis=0))
   v=np.array(vertices,dtype='<f4');n=np.array(normals,dtype='<f4');idx=np.arange(len(v),dtype='<u4')
   rgb=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in hexrgb(color)];mi=len(mats);mats.append(dict(name=color,pbrMetallicRoughness=dict(baseColorFactor=[*rgb,1],metallicFactor=.08 if layer=='frame' else 0,roughnessFactor=.75),doubleSided=True))
   meshes.append(dict(name=layer,primitives=[dict(attributes={'POSITION':buffer(v,'VEC3',5126),'NORMAL':buffer(n,'VEC3',5126)},indices=buffer(idx,'SCALAR',5125),material=mi)]));nodes.append(dict(name=layer,mesh=len(meshes)-1,extras={'layer':layer}))
  g=dict(asset={'version':'2.0','generator':'EEH geometry / source-based reconstruction'},scene=0,scenes=[{'nodes':list(range(len(nodes)))}],nodes=nodes,meshes=meshes,materials=mats,accessors=acc,bufferViews=views,buffers=[{'byteLength':len(raw)}],extras={'title':self.title,'note':self.note,'sources':self.sources})
  b=json.dumps(g,separators=(',',':')).encode();b+=b' '*((-len(b))%4);raw+=b'\0'*((-len(raw))%4)
  Path(path).write_bytes(struct.pack('<III',0x46546c67,2,12+8+len(b)+8+len(raw))+struct.pack('<II',len(b),0x4e4f534a)+b+struct.pack('<II',len(raw),0x004e4942)+raw)

def hexrgb(s):
 s=s.lstrip('#');s=''.join(c*2 for c in s) if len(s)==3 else s
 return [int(s[i:i+2],16)/255 for i in [0,2,4]]

def read_glb(path,model):
 b=Path(path).read_bytes();ln=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+ln]);offset=20+ln;raw=b[offset+8:];dt={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'};nc={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
 def acc(i):
  a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];dtype=np.dtype(dt[a['componentType']]);n=nc[a['type']];return np.ndarray((a['count'],n),dtype=dtype,buffer=raw,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',dtype.itemsize*n),dtype.itemsize)).copy()
 def node(i,parent):
  n=g['nodes'][i];mat=np.eye(4)
  if 'matrix' in n:mat=np.array(n['matrix']).reshape(4,4).T
  else:
   q=n.get('rotation',[0,0,0,1]);x,y,z,w=q;rot=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
   mat[:3,:3]=rot@np.diag(n.get('scale',[1,1,1]));mat[:3,3]=n.get('translation',[0,0,0])
  mat=parent@mat
  if 'mesh' in n:
   for pr in g['meshes'][n['mesh']]['primitives']:
    v=acc(pr['attributes']['POSITION']);v=np.c_[v,np.ones(len(v))]@mat.T;idx=acc(pr['indices']).ravel() if 'indices' in pr else np.arange(len(v));col=g['materials'][pr.get('material',0)].get('pbrMetallicRoughness',{}).get('baseColorFactor',[.8,.8,.8,1]);color='#'+''.join(f'{round(c*255):02x}' for c in col[:3]);name=n.get('name','source');model.mesh(name,v[:,:3],idx.reshape(-1,3),color,'floor' if name.lower() in ['overall','floor'] else 'source')
  for j in n.get('children',[]):node(j,mat)
 for i in g['scenes'][g.get('scene',0)]['nodes']:node(i,np.eye(4))
 return model
