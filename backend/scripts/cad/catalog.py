"""Connect CAD projections to portfolio tabs, retaining client context and source images."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
p=ROOT/'public/spatial-data.js';data=json.loads(p.read_text().split('=',1)[1].strip().rstrip(';'))
index=json.loads((ROOT/'public/space/cad/index.json').read_text())
labels={'iso':'01 아이소','plan':'02 평면','front':'03 정면','left':'04 좌측','right':'05 우측'}
source={
 'social-value-market':[('images/svm-hall.jpg','현장 전경','현장 사진 · 후면과 왼쪽 벽체, 전면·우측 개방 구조를 대조했습니다.'),('images/svm-crates.jpg','진열 상세','현장 사진 · 목재 진열함과 크레이트, 체크 패브릭을 구조 모델에 반영했습니다.')],
 'cses-2025':[('images/pf/cses-proposal/x/booth3d.jpg','원본 제안','2025년 당시 제안 렌더. 2026 SOCIAL VALUE MARKET과 별개 프로젝트입니다.')],
 'freeze-lab':[('images/pf/fl-site/01.jpg','실제 현장','용산 FREEZE LAB 현장 사진. 위 도면은 원본 R02 모델에서 추출했습니다.')],
 'recette-booth':[('images/pf/recette-booth/x/b05.jpg','실제 현장','2023 서울카페쇼 부스 현장. 원공간 렌더 DITTE · 부스 그래픽·ISP 황윤희, 신세계푸드 브랜드디자인팀.')],
 'king-of-kings':[('images/pf/king-of-kings/07.jpg','원본 배치안','공간별 프로그램과 배치를 담은 원본 기획안.')],
 'lifemeal-yeonnam':[('images/pf/lifemeal-yeonnam/03.jpg','원본 배치안','연남 팝업 원본 배치안. 마트·루틴 체험·6인 오마카세 구성을 대조했습니다.')],
 'immersive-2021':[('images/pf/immersive-2021/03.jpg','원본 배치안','전시 구획과 집기 위치를 담은 원본 기획안.')],
 'hotel-1997':[('images/pf/hotel-1997/04.jpg','원본 로비안','벽면 가구와 아트워크를 구성한 원본 로비 연출안.')]
}
from PIL import Image
for key,m in index.items():
 pr=data['projects'].setdefault(key,{'assets':[]});pr['cad']=True;pr['note']=m['note']
 assets=[]
 for v in m['views']:
  assets.append({'src':v['src'],'drawing':v['svg'],'label':labels[v['id']],'caption':m['note'],'kind':v['label'],'width':v['width'],'height':v['height'],'view':v['id']})
 assets.append({'src':m['views'][0]['src'],'label':'06 직접 돌려보기','model':'space/viewer.html?project='+key,'glb':m['glb'],'caption':'드래그로 회전하고, 휠로 확대합니다. 재질·백색 모형·선 도면을 선택할 수 있습니다. '+m['note'],'kind':'INTERACTIVE 3D'})
 for src,label,cap in source[key]:
  w,h=Image.open(ROOT/'public'/src).size
  assets.append({'src':src,'label':label,'caption':cap,'kind':'SOURCE / REFERENCE','width':w,'height':h})
 pr['assets']=assets
p.write_text('window.EEH_SPATIAL_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
