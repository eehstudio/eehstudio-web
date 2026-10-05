"""Add only documented dimensions to the orthographic SVGs (millimetres)."""
from pathlib import Path
import json,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[2]
idx=json.loads((ROOT/'public/space/cad/index.json').read_text())
# Reference extents, in model coordinates. The picture is not a scale drawing.
for key,m in idx.items():
 if not m['dimensions']:continue
 for view in m['views']:
  if view['id'] not in ['front','plan']:continue
  p=ROOT/'public'/view['svg'];s=p.read_text();w,h=view['width'],view['height']
  # Dimension summaries are deliberately outside projection geometry: known
  # source values do not silently become measurements of inferred geometry.
  ds=[d for d in m['dimensions'] if d['axis'] in (['x','z'] if view['id']=='plan' else ['x','y'])]
  text=' · '.join(d['label'] for d in ds)
  if not text:continue
  mark=f'<text data-source-dimensions="true" x="42" y="35" font-family="Arial,sans-serif" font-size="16" fill="#3f606f">SOURCE DIMENSIONS / {text}</text>'
  import re
  s=re.sub(r'<text data-source-dimensions="true".*?</text>','',s)
  p.write_text(s.replace('</svg>',mark+'</svg>'))
