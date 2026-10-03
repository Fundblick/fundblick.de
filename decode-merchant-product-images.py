import json, hashlib, math, sys
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, __version__
base=Path(sys.argv[1]).resolve()
data=json.loads((base/'production-candidates.json').read_text(encoding='utf-8'))
results=[]; thumbnails=[]
for r in data['results']:
    if r['status']!='pass': continue
    evidence=r['image']; imagefile=base/evidence['evidenceFile']
    result={'id':r['id'],'url':evidence['url'],'bodySha256':evidence['bodySha256'],'checkedAt':__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),'status':'fail'}
    try:
        raw=imagefile.read_bytes()
        assert hashlib.sha256(raw).hexdigest()==evidence['bodySha256'] and len(raw)==evidence['bodyBytes'], 'image-body-digest-mismatch'
        with Image.open(imagefile) as image:
            image.verify()
        with Image.open(imagefile) as image:
            image.load(); width,height=image.size; format=image.format
            gray=image.convert('L').resize((128,128)); hist=gray.histogram(); total=sum(hist)
            entropy=-sum((x/total)*math.log2(x/total) for x in hist if x)
            assert format in ('JPEG','PNG','WEBP','AVIF') and min(width,height)>=200 and entropy>=0.1, 'invalid-or-blank-image'
            result.update(status='pass',decoded=True,width=width,height=height,format=format,entropy=entropy)
            thumbnails.append((r['id'],ImageOps.contain(image.convert('RGB'),(136,136))))
    except Exception as e:
        result['reason']=str(e)
    results.append(result)
report={'decoder':{'name':'Pillow','version':__version__},'results':results}
(base/'decoded-images.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for page in range((len(thumbnails)+79)//80):
    sheet=Image.new('RGB',(1440,1280),'white'); draw=ImageDraw.Draw(sheet)
    for i,(id,thumb) in enumerate(thumbnails[page*80:(page+1)*80]):
        x=(i%10)*144; y=(i//10)*160; sheet.paste(thumb,(x+(144-thumb.width)//2,y));draw.text((x+4,y+139),str(page*80+i+1)+' '+id[-8:],fill='black')
    sheet.save(base/f'product-images-{page+1}.jpg')
print(json.dumps({'checked':len(results),'passed':sum(r['status']=='pass' for r in results),'failed':[r for r in results if r['status']!='pass']},ensure_ascii=False))
