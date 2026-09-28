"""Read artwork dimensions and make local video posters for stable, uncropped layouts."""
from pathlib import Path
import json,concurrent.futures,subprocess,urllib.request
from PIL import Image,ImageFile
root=Path(__file__).resolve().parents[1]
works=json.loads((root/'src/data/artworks.json').read_text())
out=root/'public/posters';out.mkdir(exist_ok=True)
cache=root/'src/data/media-layout.json'
known=json.loads(cache.read_text()) if cache.exists() else {}

def prepare(w):
 slug=w['slug']
 if slug in known:return slug,known[slug]
 try:
  first=w['media'][0]
  poster=w.get('thumbnail')
  if not poster and first['type'] in ['video','hls']:
   file=out/(slug+'.jpg')
   if not file.exists():
    source=str(root/'public'/first['src'][1:]) if first['src'].startswith('/') else first['src']
    result=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',source,'-frames:v','1','-vf','scale=960:-2','-q:v','4','-y',str(file)],capture_output=True,timeout=55)
    if result.returncode:raise ValueError('Poster extraction failed')
   with Image.open(file) as image:width,height=image.size
   return slug,{'width':width,'height':height,'poster':'/posters/'+file.name}
  if not poster:return slug,None
  if poster.startswith('/'):
   with Image.open(root/'public'/poster[1:]) as image:width,height=image.size
   return slug,{'width':width,'height':height}
  # Imported mint metadata already contains dimensions for most onchain work.
  source=json.loads((root.parent/'neynar/catalog/minted-artworks.json').read_text())
  r=next((x for x in source['artworks'] if x['slug']==slug),None)
  d=(r.get('image_details') or {}) if r else {}
  if d.get('width') and d.get('height'):return slug,{'width':d['width'],'height':d['height']}
  parser=ImageFile.Parser()
  req=urllib.request.Request(poster,headers={'User-Agent':'MXJXN-art-media/0.1'})
  with urllib.request.urlopen(req,timeout=20) as response:
   for _ in range(64):
    chunk=response.read(4096)
    if not chunk:break
    parser.feed(chunk)
    if parser.image:
     width,height=parser.image.size
     return slug,{'width':width,'height':height}
  raise ValueError('No image dimensions available')
 except Exception as exc:
  print(slug,type(exc).__name__,str(exc),flush=True)
  return slug,None
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for slug,result in pool.map(prepare,works):
  if result:known[slug]=result
cache.write_text(json.dumps(known,indent=2)+'\n')
print(f'Dimensions prepared for {len(known)}/{len(works)} works; {sum(bool(r.get("poster")) for r in known.values())} video posters.',flush=True)
