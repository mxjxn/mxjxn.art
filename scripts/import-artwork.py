"""Build the public artwork catalog from reviewed research snapshots, without credentials."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
research=root.parent/'neynar/catalog'
minted=json.loads((research/'minted-artworks.json').read_text())
daily=json.loads((research/'daily-renders.json').read_text())
reviews=json.loads((research/'media-review.json').read_text())
local={
 'muse-editions-33':'/muse-editions/chromaticsymphony.gif',
 'muse-editions-31':'/muse-editions/forgedimbalance.jpg',
 'muse-editions-29':'/muse-editions/obsidianbloom.jpg',
 **{f'meditative-blackletter-{i}':f'/meditations/m{i}.png' for i in range(1,7)},
 'reaching-the-source-47':'/srclensx.jpg','reaching-the-source-49':'/srclensz.jpg','reaching-the-source-60':'/source.jpg',
 'degen-ghouls-99':'/degenghouls/degenghoul99.jpg','degen-cats-44':'/degencats/degencat44.png',
}
local_video={'muse-editions-30':'/muse-editions/phoenixlens.mp4','muse-editions-28':'/muse-editions/processmorph.mp4'}
works=[]
for r in minted['artworks']:
 slug=r['slug']; image=local.get(slug,r['image']); fmt=(r.get('animation_details') or {}).get('format','').upper()
 media=[]
 if r['animation_url']:
  media.append({'type':{'MP4':'video','HTML':'interactive','GLB':'model'}.get(fmt,'video'),'src':local_video.get(slug,r['animation_url']), 'poster':image,
   'unavailable':reviews.get(r['id'],{}).get('animation_status')=='unavailable'})
 elif image:media.append({'type':'image','src':image})
 works.append({'slug':slug,'title':r['title'].strip(),'series':r['collection_slug'],'description':r['description'],
   'year':2023 if r['collection_slug']=='meditative-blackletter' else 2021 if r['collection_slug']=='reaching-the-source' else None,
   'media':media,'thumbnail':image,'animatedImage':(r.get('image_details') or {}).get('format')=='GIF',
   'provenance':{'chain':r['chain'],'contract':r['contract'],'tokenId':r['token_id'],'url':r['provenance_url']}})
seen={}
for w in daily['works']:
 day=w['catalog_day']; seen[day]=seen.get(day,0)+1
 slug=f'daily-{day}'+(f'-{seen[day]}' if seen[day]>1 else '')
 media=[{'type':'hls' if m['type']=='video' else 'image','src':f'/daily/day-{day}.jpg' if i==0 and m['type']=='image' and day in [5,40,48,50,59] else m['url']} for i,m in enumerate(w['media'])]
 works.append({'slug':slug,'title':f'Day {day}','series':'render-till-december','description':w['caption'],'year':2026,'media':media,'thumbnail':next((m['src'] for m in media if m['type']=='image'),None),'animatedImage':False,'source':w['url']})
for num in [26,62,74,58,95,100]:
 path=f'/calligrapics/c{num}.'+('png' if num==74 else 'jpg')
 works.append({'slug':f'calligra-pic-{num}','title':f'Calligra Pic {num}','series':'calligra-pics','description':'From a series of 100 calligraphic abstracts made in the summer of 2021.','year':2021,'media':[{'type':'image','src':path}],'thumbnail':path,'animatedImage':False})
for slug,title,series,path,desc in [('ethereal-realm-viii','Ethereal Realm VIII','ethereal-realms','/ethereal-realms/ethereal-realm-viii.png','From Ethereal Realms.'),('weeping-crimson-ceremony','Weeping Crimson Ceremony','hyper-ghouls','/hyper-ghouls/weeping-crimson-ceremony.png','From Hyper Ghouls.')]:
 works.append({'slug':slug,'title':title,'series':series,'description':desc,'year':None,'media':[{'type':'image','src':path}],'thumbnail':path,'animatedImage':False})
first=['daily-48','muse-editions-33','meditative-blackletter-6','daily-50','reaching-the-source-47','calligra-pic-58','muse-editions-30','daily-59']
works.sort(key=lambda w:first.index(w['slug']) if w['slug'] in first else len(first))
assert len({w['slug'] for w in works})==len(works)
assert all(w['media'] for w in works)
layout_path=root/'src/data/media-layout.json'
layout=json.loads(layout_path.read_text()) if layout_path.exists() else {}
for work in works:
 prepared=layout.get(work['slug'],{})
 for dimension in ('width','height'):
  if prepared.get(dimension):work[dimension]=prepared[dimension]
 if prepared.get('poster'):
  work['thumbnail']=prepared['poster']
  work['media'][0]['poster']=prepared['poster']
(root/'src/data/artworks.json').write_text(json.dumps(works,ensure_ascii=False,indent=2)+'\n')
print(f'Imported {len(works)} artwork pages; no credentials or private profile data included.')
