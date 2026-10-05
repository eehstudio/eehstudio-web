from geometry import *
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/space/cad';OUT.mkdir(parents=True,exist_ok=True)
LEGACY=json.loads((ROOT/'public/space/models.json').read_text());MODELS=[]

def add(m):MODELS.append(m);return m

def rotate_parts(m,start,cx,cz,deg):
 a=math.radians(deg);r=np.array([[math.cos(a),0,math.sin(a)],[0,1,0],[-math.sin(a),0,math.cos(a)]])
 for p in m.parts[start:]:p['v']=(p['v']-[cx,0,cz])@r.T+[cx,0,cz]

def checked_top(m,name,x,y,z,w,d):
 m.box(name,x,y,z,w,.018,d,'#f4f4f4');step=.055
 for i in range(round(w/step)):
  for j in range(round(d/step)):
   if (i+j)%2==0:m.box(name+' check',x-w/2+(i+.5)*step,y+.019,z-d/2+(j+.5)*step,step,.001,step,'#cd5149','graphic')

def label_bars(m,x,y,z,w,color='#cb493c',count=4):
 for i in range(count):m.box('Wall graphic line',x,y-i*.07,z,w*(1-i*.09),.026,.003,color,'graphic')

m=add(Model('social-value-market','SOCIAL VALUE MARKET / 2026','현장 사진으로 재구성. 부스 3×3m는 기획 규격이며 집기 높이·간격은 사진 비례 추정입니다.','images/svm-hall.jpg · svm-mission.jpg · svm-booth.jpg · svm-crates.jpg'))
m.dimensions=[{'label':'3,000 mm · 기획 규격','axis':'x','value':3},{'label':'3,000 mm · 기획 규격','axis':'z','value':3}]
red='#cb493c';silver='#aeb8c1';white='#f5f6f7'
m.box('Carpet',0,-.016,0,3,.016,3,'#616971','floor')
for i in range(3):
 x=-1+i;m.box('Rear panel '+str(i+1),x,0,-1.49,.95,2.38,.038,white,'walls')
 z=-1+i;m.box('Left panel '+str(i+1),-1.49,0,z,.038,2.38,.95,red if i<2 else white,'walls')
for x in [-1.5,-.5,.5,1.5]:m.box('Back frame',x,0,-1.5,.045,2.45,.045,silver,'frame')
for z in [-1.5,-.5,.5,1.5]:m.box('Left frame',-1.5,0,z,.045,2.45,.045,silver,'frame')
for x,z in [(1.5,1.5)]:m.box('Front receipt post',x,0,z,.065,2.9,.065,silver,'frame')
for a,b in [((-1.5,2.43,-1.5),(1.5,2.43,-1.5)),((-1.5,2.43,-1.5),(-1.5,2.43,1.5)),((-1.5,2.43,1.5),(1.5,2.43,1.5)),((1.5,2.43,-1.5),(1.5,2.43,1.5))]:m.beam('System top rail',a,b,.04,silver,'overhead')
m.box('Organizer fascia',0,2.43,1.5,3,.42,.035,'#9693b0','overhead')
label_bars(m,0,2.18,-1.465,1.9,red,3)
for i in range(5):
 for j in range(2):m.crate('Rear support',-1.07+i*.535,j*.34,-1.22,.515,.40,.34,red if (i+j)%2==0 else '#e5e9eb')
checked_top(m,'Rear gingham top',0,.68,-1.2,2.83,.48)
for i in range(8):
 x=-1.1+i*.325;m.woodbin('Rear wood bin '+str(i+1),x,.71,-1.18,.309,.37,.22)
 m.cylinder('Hanging sample',x,1.22+(i%2)*.12,-1.43,.035,.07,'#c6b39b',10)
for i in range(2):
 z=-.55+i*.4
 for j in range(2):m.crate('Left support',-1.21,j*.34,z,.4,.37,.34,red)
 checked_top(m,'Left gingham top',-1.21,.68,z,.48,.39)
 n=len(m.parts);m.woodbin('Left wood bin '+str(i+1),-1.21,.71,z,.309,.37,.22);rotate_parts(m,n,-1.21,z,90)
# START station with full-length check cloth and tablet.
m.table('Start desk',-.94,.94,.93,.52,.84,'#f6f6f6');checked_top(m,'Start tablecloth',-.94,.84,.94,.94,.54)
m.box('Start cloth',-.94,.015,1.205,.94,.827,.005,'#fafafa','graphic')
for i in range(17):
 for j in range(15):
  if (i+j)%2==0:m.box('Cloth check',-1.41+(i+.5)*.055,.015+j*.055,1.21,.055,.055,.002,'#ca544b','graphic')
m.box('QR tablet stand',-.95,.86,.96,.05,.17,.07,'#626c77');m.box('QR tablet',-.95,1.01,.96,.29,.23,.019,'#f8f9fa');m.box('QR field',-.95,1.07,.972,.145,.12,.001,'#63727b','graphic')
m.cylinder('Lamp base',-1.22,.86,.88,.07,.025,white);m.cylinder('Lamp stem',-1.22,.88,.88,.022,.11,white);m.cylinder('Lamp shade',-1.22,.99,.88,.13,.10,red,30,rt=.035)
# Counter is on the right, matching field photographs.
for i in range(2):
 for j in range(3):m.crate('Cashier support',.57+i*.53,j*.28,1.05,.51,.45,.28,red)
checked_top(m,'Counter gingham top',.835,.845,1.05,1.075,.53)
m.box('Cashier sign',.835,.59,1.285,.87,.20,.008,white,'graphic');label_bars(m,.835,.73,1.293,.6,red,1)
m.box('Receipt printer',.82,.87,1.03,.18,.14,.23,'#28343d');m.box('Receipt output',.82,1.012,1.1,.08,.004,.13,'#ffffff')
m.box('Barcode scanner base',1.12,.87,1.01,.08,.035,.1,'#34434b');m.beam('Barcode scanner', (1.12,.9,1.01),(1.10,1.06,1.02),.045,'#34434b','fixtures')
# Right-front receipt descends to floor; left and back remain independent from proposal.
m.box('Receipt vertical',1.538,0,1.2,.012,2.75,.64,'#fcfcfc','graphic');m.box('Receipt floor tail',1.93,.012,1.2,.8,.008,.64,'#fafafa','graphic')
for i in range(18):
 m.box('Receipt print',1.547,.23+i*.12,1.2,.002,.02,.5 if i%4 else .58,'#424b52','graphic')
for i in range(6):m.box('Receipt floor print',1.6+i*.11,.022,1.2,.045,.001,.49,'#424b52','graphic')
# Trolley between activity desk and left gift display.
for y in [.12,.36,.60]:m.box('Trolley tray',-1.1,y,.32,.33,.028,.31,'#d4cec3')
for x in [-1.25,-.95]:m.box('Trolley upright',x,.10,.32,.018,.60,.29,'#c3bdae')
for x in [-1,0,1]:
 m.box('Wall lamp stem',x,1.15,-1.41,.025,.18,.09,white);m.cylinder('Wall lamp shade',x,1.25,-1.35,.07,.07,white,20)
# Source sign positions above START, MARKET and FINISH.
for x,z in [(-.95,.91),(0,-1.18),(.83,.9)]:
 m.box('Hanging station sign',x,2.04,z,.43,.18,.008,white,'graphic');m.beam('Sign wire',(x-.16,2.22,z),(x-.16,2.43,z),.002,silver,'overhead')
m.annotations=[[-.95,0,.94,'01 START'],[0,0,-1.19,'02 GIFT / 8 BINS'],[.835,0,1.05,'03 COUNTER']]

# CSES prior-year proposal has a separate frame, palette and programme.
m=add(Model('cses-2025','CSES / THE BETTER, THE MORE / 2025','당시 기획안의 5패널 부스 재구성. 패널 규격은 원본 표기, 꺾임과 집기 배치는 제안 렌더 기준입니다.','images/pf/cses-proposal/04.jpg · 05.jpg · x/detail.jpg · x/front.jpg'))
m.dimensions=[{'axis':'x','value':3.01,'label':'3,010 mm · 후면 계획'},{'axis':'y','value':2.37,'label':'2,370 mm · 패널 규격'}]
m.box('Floor',0,-.02,0,3.01,.02,3,'#e1e5e8','floor')
for i in range(3):m.box('Yellow rear graphic',-1+i,0,-1.48,.95,2.37,.032,'#f1cf31','walls')
for i in range(2):m.box('Kraft value card wall',-1.49,0,-.96+i*.98,.032,2.37,.95,'#c5af8a','walls')
for x in [-1.505,-.5,.5,1.505]:m.box('Rear post',x,0,-1.5,.045,2.4,.045,'#b8c1c8','frame')
for z in [-1.5,-.51,.48]:m.box('Return post',-1.5,0,z,.045,2.4,.045,'#b8c1c8','frame')
m.beam('Back top beam',(-1.51,2.39,-1.5),(1.51,2.39,-1.5),.04,'#b8c1c8','overhead');m.beam('Return top beam',(-1.5,2.39,-1.5),(-1.5,2.39,.5),.04,'#b8c1c8','overhead')
for z in [-1.0,0.0]:
 for yy in [.75,1.05,1.35,1.65,1.95]:m.box('Card rail',-1.462,yy,z,.025,.02,.82,'#786954')
 for yy in [.78,1.08,1.38,1.68]:
  for dz in [-.29,0,.29]:m.box('Value card',-1.44,yy,z+dz,.006,.22,.18,'#eee2c7','graphic')
for x in [-.7,.35]:m.shelf('Paper goods cabinet',x,0,-1.13,.9,1.05,.44,'#c5af8a',3)
m.box('TV',.35,1.09,-1.14,.6,.38,.045,'#3f4950')
m.table('Event table A',-.72,.86,.72,.58,.84,'#c5af8a');m.table('Event table B',.26,.86,.72,.58,.84,'#c5af8a')
m.table('Gacha table',.99,-.08,.62,.52,.65,'#c5af8a');m.box('Capsule machine',.99,.65,-.08,.39,.43,.34,'#e9e8e2');m.cylinder('Capsule top',.99,1.08,-.08,.15,.25,'#d1dce3')
m.box('Banner',1.25,0,1.15,.62,1.8,.035,'#f1cf31');m.box('Banner foot',1.25,0,1.15,.7,.04,.35,'#c5af8a')
m.annotations=[[-1.1,0,-.7,'VALUE CARDS'],[.1,0,-1.1,'GOODS / TV'],[1,0,-.08,'GACHA']]

# Source GLB is retained exactly for Freeze Lab; no remodelling of recorded geometry.
m=add(Model('freeze-lab','LIFEMEAL / FREEZE LAB','원본 R02 GLB에서 직접 추출한 동일 형상의 정투영입니다. 실측 현황도가 아닌 제작 전 모델 기록입니다.','fl/booth.glb · fl/booth_meta.json · images/pf/fl-site/01.jpg'))
read_glb(ROOT/'public/fl/booth.glb',m)

# RECETTE: recorded facade dimensions; depth remains an explicitly inferred study.
m=add(Model('recette-booth','RECETTE / SEOUL CAFE SHOW','정면 15,000×4,000mm는 원본 표기. 깊이와 일부 집기는 원본 렌더 비례 재구성입니다. 원본 공간 렌더 DITTE, 부스 그래픽 EEH 디렉터 작업 기록.','images/pf/recette-booth/x/b04.jpg · 11.jpg · x/o1.jpg · x/o7.jpg'))
m.dimensions=[{'axis':'x','value':15,'label':'15,000 mm · 원본 정면'},{'axis':'y','value':4,'label':'4,000 mm · 원본 높이'}]
wood='#c9ad87';orange='#e37d2b'
# Preserve the prior outer footprint, replace coarse frame by source bay rhythm.
for r in LEGACY['recette-booth']['boxes']:
 if r['h']>=3.9 or r['w']>=14 or (r['h']<.15 and r.get('y',0)>2.9):continue
 m.box('Source fixture',r['x'],r.get('y',0),r['z'],r['w'],r['h'],r['d'],r['color'],'floor' if r.get('y',0)<0 else 'fixtures')
for x in np.linspace(-7.5,7.5,8):
 for z in [-2.7,2.7]:m.box('Timber column',x,0,z,.08,4,.08,wood,'frame')
 m.box('Roof crossbeam',x,3.93,0,.08,.07,5.4,wood,'overhead')
for z in [-2.7,2.7]:
 for y in [1.02,3.02,3.52,3.93]:m.box('Timber horizontal',0,y,z,15,.07,.07,wood,'frame' if y<2 else 'overhead')
 m.box('Orange fascia',0,3.07,z,14.85,.76,.022,orange,'graphic')
for x in [-7.5,7.5]:
 for y in [1.02,3.02,3.52,3.93]:m.box('Side frame',x,y,0,.07,.07,5.4,wood,'frame' if y<2 else 'overhead')
# Front opening sign panels, shelving bays, menu boards and source counter rhythm.
for x in [-3.78,3.85]:m.box('Suspended graphic',x,1.45,2.61,1.55,1.65,.032,'#fafafa','graphic')
for x in [-4.15,4.25]:m.shelf('Product shelving',x,.04,-.4,.7,2.84,.28,wood,6)
for x in [-1,0,1]:m.box('Menu board',x,2.33,-.42,.96,.57,.025,'#425747','graphic')
for x in np.linspace(-2.45,2.45,6):
 m.chair('Bar stool',x,1.80,.68,wood)
 m.cylinder('Hanging pendant',x,2.49,.42,.18,.16,'#cdb36d',24,rt=.09);m.beam('Pendant cable',(x,2.65,.42),(x,3.92,.42),.009,'#4c4f53','overhead')
for x in [-6.1,6.1]:
 m.table('Side consultation',x,-1.7,1.2,.65,.74,'#e3e5e6')
 for dz in [-.55,.55]:m.chair('Consultation chair',x,-1.7+dz,.44,'#edf0f1')
# Slatted counter fronts, structurally open grid instead of featureless boxes.
for x in np.arange(-2.95,2.96,.13):m.box('Front counter fluting',x,.05,2.705,.045,.88,.018,wood)
m.annotations=[[-6.1,0,2.2,'BAKERY'],[0,0,2.2,'OPEN CLASS'],[6.1,0,2.2,'BEVERAGE']]

# Shared PALCIBO plan coordinates. Explicitly NTS: no fabricated millimetre labels.
def palsibo(pid,title):
 m=add(Model(pid,title,'원본 배치안의 비례를 보존한 구조 모델. 실제 치수·천장고가 없어 높이는 시각화 가정이며 NTS로 표시합니다.','images/pf/'+pid+('/07.jpg' if pid=='king-of-kings' else '/03.jpg')+' · 원본 평면도'))
 k=10/1558;px=lambda x:(x-999)*k;pz=lambda y:(y-608.5)*k
 m.box('Venue floor',0,-.035,0,10,.035,863*k,'#e3e7e9','floor')
 def wall(x1,y1,x2,y2,h=2.55):m.box('Wall sheet',(px(x1)+px(x2))/2,0,(pz(y1)+pz(y2))/2,max(abs(x2-x1)*k,.07),h,max(abs(y2-y1)*k,.07),'#e3e7e9','walls')
 for a in [(220,177,1778,177),(220,177,220,1040),(1778,177,1778,1040),(220,1040,780,1040),(985,1040,1778,1040)]:wall(*a)
 # Front-right glazing is open frame rather than opaque scenery.
 m.parts=[p for p in m.parts if not ('Wall sheet'==p['name'] and p['v'][:,2].mean()>2.7 and p['v'][:,0].mean()>1)]
 for y in [0,2.45]:m.box('Window rail',px(1381),y,pz(1040),793*k,.045,.045,'#82919e','frame')
 for x in [985,1381,1778]:m.box('Window mullion',px(x),0,pz(1040),.035,2.49,.035,'#82919e','frame')
 for a in [(690,177,690,540),(789,177,789,474),(690,720,690,1040)]:wall(*a)
 def fx(name,x,y,w,d,h=.9,color='#d3d9df',shelf=False):
  if shelf:m.shelf(name,px(x+w/2),0,pz(y+d/2),w*k,h,d*k,color,4)
  else:m.box(name,px(x+w/2),0,pz(y+d/2),w*k,h,d*k,color)
 # Stairs remain legible treads rather than one block.
 for i in range(7):m.box('Stair tread',px(1634),i*.17,pz(194+i*44),286*k,.17,44*k,'#c5cdd3')
 if pid=='king-of-kings':
  for a in [(221,462,440,462),(555,462,689,462)]:wall(*a)
  fx('Cashier',1011,342,478,53,.93);m.table('MD island',px(1250),pz(793),546*k,170*k,.78,'#c4cbd0')
  fx('MD wall cabinet',620,690,68,205,1.55,'#9aabbd',True)
  for y in [545,650,755,860,965]:fx('Mission station',225,y,82,55,.78,'#e4d6bb')
  m.table('Myself activity table',px(470),pz(320),180*k,90*k,.7,'#cfbcab');m.chair('Myself chair',px(470),pz(397),.43)
  m.annotations=[[px(450),0,pz(290),'MYSELF ROOM'],[px(1250),0,pz(793),'MD'],[px(883),0,pz(1000),'ENTRY']]
 else:
  for a in [(221,436,488,436),(779,177,779,352),(779,352,1110,352),(1250,352,1491,352)]:wall(*a)
  fx('WBTI counter',779,420,176,53,.92,'#c96b57');fx('Cashier',955,420,338,53,.92,'#c6b296')
  fx('Refrigerator',1409,420,82,107,1.48,'#91a8b8');fx('Welcome fixture',267,469,111,117,.9,'#c96b57')
  fx('Product shelving',267,595,111,440,1.65,'#98acb9',True)
  fx('Mission fixture',608,723,82,312,.92,'#c96b57');fx('Routine station',690,723,83,259,.92,'#c96b57')
  m.table('Omakase tea table',px(1491),pz(815.5),192*k,325*k,.74,'#c6b296')
  for x in [1338,1644]:
   for y in [705,816,927]:m.chair('Omakase seat',px(x),pz(y),.43,'#c6b296')
  m.annotations=[[px(455),0,pz(740),'MART'],[px(1135),0,pz(260),'STORAGE'],[px(1491),0,pz(815),'OMAKASE / 6 SEATS']]
 return m
palsibo('king-of-kings','KING OF KINGS / PALCIBO')
palsibo('lifemeal-yeonnam','LIFEMEAL / YEONNAM')

m=add(Model('immersive-2021','IMMERSIVE EXHIBITION / 2021','원본 전시 평면의 구획과 배치 비례를 보존했습니다. 높이는 시각화 가정이며 NTS입니다.','images/pf/immersive-2021/03.jpg · 원본 전시 배치안'))
d=LEGACY['immersive-2021'];vx,vy,vw,vh=d['viewBox'];k=10/vw;m.box('Venue floor',0,-.02,0,10,.02,vh*k,'#e3e7e9','floor')
for i,r in enumerate(d['rects']):
 if r['w']>vw*.95 and r['h']>vh*.95:continue
 x=(r['x']+r['w']/2-vx-vw/2)*k;z=(r['y']+r['h']/2-vy-vh/2)*k;w=r['w']*k;dep=r['h']*k
 if min(w,dep)<.15:m.box('Exhibition partition',x,0,z,max(w,.06),2.2,max(dep,.06),'#e3e7e9','walls')
 else:
  h=.75 if w*dep<.6 else .95;m.box('Exhibit plinth '+str(i),x,0,z,w,h,dep,'#bac7cc')
for x in [-5,5]:m.box('Side enclosure',x,0,0,.055,2.2,vh*k,'#e3e7e9','walls')
m.box('Rear enclosure',0,0,-vh*k/2,10,2.2,.055,'#e3e7e9','walls')

# Hotel is explicitly one documented wall composition, not a fictitious whole venue.
m=add(Model('hotel-1997','THE HOTEL 1997 / LOBBY WALL','원본 3,030×2,180mm 벽면 구성의 부분 모델. 전체 행사장 평면이나 실측 시공도가 아닙니다.','images/pf/hotel-1997/04.jpg · 05.jpg · 로비 입면 계획'))
m.dimensions=[{'axis':'x','value':3.03,'label':'3,030 mm · 원본 벽면'},{'axis':'y','value':2.18,'label':'2,180 mm · 원본 벽면'}]
m.box('Wall',0,0,-.6,3.03,2.18,.065,'#e9eced','walls');m.box('Floor segment',0,-.025,0,3.1,.025,1.3,'#e3e7e9','floor')
m.shelf('Display shelf',-1.0075,0,-.32,.875,1.8,.36,'#9ca79b',5)
m.box('Sofa seat',.065,.30,.16,1,.18,.6,'#849f91');m.box('Sofa back',.065,.46,-.12,1,.26,.13,'#849f91')
for x in [-.45,.58]:m.box('Sofa arm',x,.27,.16,.09,.32,.60,'#849f91')
m.table('Coffee table',.18,.53,1.2,.36,.42,'#c1b69e');m.cylinder('Lamp base',1.12,0,-.1,.16,.035,'#78858a');m.cylinder('Floor lamp stem',1.12,.03,-.1,.012,1.60,'#78858a');m.cylinder('Lamp shade',1.12,1.63,-.1,.21,.17,'#e2d9c7',24,rt=.13)
for x in [-.185,.40]:m.box('Framed artwork',x,1.30,-.555,.48,.64,.028,'#d8cec0','graphic')

if __name__=='__main__':
 from render import render_views
 import sys
 wanted=set(sys.argv[1:])
 index={}
 for m in MODELS:
  if wanted and m.id not in wanted:continue
  dest=OUT/m.id;dest.mkdir(exist_ok=True)
  if m.id=='freeze-lab':glb='fl/booth.glb'
  else:m.glb(dest/'model.glb');glb='space/cad/'+m.id+'/model.glb'
  views=render_views(m,dest)
  index[m.id]={'title':m.title,'note':m.note,'sources':m.sources,'glb':glb,'views':views,'dimensions':m.dimensions,'partCount':len(m.parts)}
  print(m.id,len(m.parts),'parts',flush=True)
 ip=OUT/'index.json';prev=json.loads(ip.read_text()) if ip.exists() and wanted else {};prev.update(index);ip.write_text(json.dumps(prev,ensure_ascii=False,indent=2)+'\n')
