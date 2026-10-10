"""Verify source variants and decode their original images. No tracking hosts allowed."""
import sys,json,hashlib,time,threading,socket,ipaddress,urllib.request,urllib.parse,concurrent.futures,io,math
from pathlib import Path
from datetime import datetime,timezone
from PIL import Image,__version__

def stamp(): return datetime.now(timezone.utc).isoformat()
def digest(b): return hashlib.sha256(b).hexdigest()
class Redirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): raise ValueError('unexpected-redirect')
lock=threading.Lock();next_at=0
def request(url,hosts):
    global next_at
    u=urllib.parse.urlsplit(url)
    if u.scheme!='https' or u.hostname not in hosts or u.username or u.password or u.port: raise ValueError('disallowed-host')
    if not urllib.request.getproxies().get('https'):
        for item in socket.getaddrinfo(u.hostname,443):
            if not ipaddress.ip_address(item[4][0]).is_global: raise ValueError('non-public-address')
    with lock:
        delay=max(0,next_at-time.monotonic());next_at=max(next_at,time.monotonic())+.3
    time.sleep(delay)
    req=urllib.request.Request(url,headers={'User-Agent':'FundBlick-Source-Quality/2.0','Accept-Encoding':'identity'})
    with urllib.request.build_opener(Redirect).open(req,timeout=25) as res:
        body=res.read(8*1024*1024+1)
        if len(body)>8*1024*1024: raise ValueError('response-too-large')
        if res.status!=200: raise ValueError('http-'+str(res.status))
        return body,res.headers.get('Content-Type','')
def run(candidates,feed,output,host):
    products=json.loads(Path(candidates).read_text());source_sha=digest(Path(feed).read_bytes())
    out=Path(output);out.parent.mkdir(parents=True,exist_ok=True)
    cache=out.parent/'source-evidence';cache.mkdir(exist_ok=True)
    report={'sourceSha256':source_sha,'startedAt':stamp(),'status':'incomplete','decoder':{'name':'Pillow','version':__version__},'trackingRequests':0,'transport':'runtime-proxy-or-public-dns','results':[],'blocked':{}}
    if out.exists():
        old=json.loads(out.read_text())
        if old['sourceSha256']!=source_sha: raise ValueError('source-checkpoint-mismatch')
        report=old
    age=(datetime.now(timezone.utc)-datetime.fromisoformat(report['startedAt'])).total_seconds()
    if age<0 or age>7*24*3600: raise ValueError('stale-or-future-source-checkpoint')
    covered=set(report['blocked'])|{r['variantId'] for r in report['results']}
    grouped={}
    for p in products:
        if p['merchantVariantId'] in covered: continue
        if type(p['inStock']) is not bool: report['blocked'][p['merchantVariantId']]='source-availability-unknown';continue
        base=p['directUrl'].split('?')[0];grouped.setdefault(base,[]).append(p)
    url_cache={}
    cache_file=out.parent/'response-cache.json'
    if cache_file.exists():
        cached=json.loads(cache_file.read_text())
        if cached.get('sourceSha256')==source_sha and cached.get('startedAt')==report['startedAt']: url_cache=cached['entries']
    for r in report['results']:
        url_cache[r['finalProductUrl'].split('?')[0]+'.js']={'sha':r['metadataSha256'],'contentType':'application/json'}
        url_cache[r['image']['url']]={'sha':r['image']['bodySha256'],'contentType':'image/'+r['image']['format'].lower()}
    fetches={};cache_lock=threading.Lock()
    def evidence(url,hosts):
        with cache_lock:
            old=url_cache.get(url)
            if old and (cache/(old['sha']+'.bin')).exists():
                raw=(cache/(old['sha']+'.bin')).read_bytes()
                if digest(raw)!=old['sha']: raise ValueError('cached-body-digest-mismatch')
                return raw,old['sha'],old['contentType']
            future=fetches.get(url)
            owner=future is None
            if owner: future=concurrent.futures.Future();fetches[url]=future
        if not owner: return future.result()
        try:
            raw,content_type=request(url,hosts);sha=digest(raw);(cache/(sha+'.bin')).write_bytes(raw)
            with cache_lock:
                url_cache[url]={'sha':sha,'contentType':content_type};cache_file.write_text(json.dumps({'sourceSha256':source_sha,'startedAt':report['startedAt'],'entries':url_cache}))
            value=(raw,sha,content_type);future.set_result(value);return value
        except Exception as error:
            future.set_exception(error);raise
    def verify(group):
        base,items=group;passed=[];blocked={}
        try:
            raw,sha,_=evidence(base+'.js',[host,'www.'+host]);live=json.loads(raw)
            if urllib.parse.urljoin(base,live['url']).split('?')[0]!=base: raise ValueError('metadata-product-path-mismatch')
            variants={str(v['id']):v for v in live['variants']}
            for p in items:
                try:
                    v=variants.get(p['merchantVariantId'])
                    if not v or v.get('requires_selling_plan'): raise ValueError('variant-missing-or-subscription')
                    if type(v.get('available')) is not bool or v['available'] != p['inStock']: raise ValueError('source-availability-mismatch')
                    if v['price']/100!=p['price']: raise ValueError('source-price-mismatch')
                    # The full source title must preserve the same current model and options.
                    if p['name']!=v['name']: raise ValueError('source-variant-title-mismatch')
                    source_image=urllib.parse.urlsplit(p['image']);live_image=urllib.parse.urlsplit(urllib.parse.urljoin(base,(v.get('featured_image') or {}).get('src') or live['featured_image']))
                    if (source_image.hostname,source_image.path)!=(live_image.hostname,live_image.path): raise ValueError('source-variant-image-mismatch')
                    image,imsha,ctype=evidence(p['image'],['cdn.shopify.com'])
                    if len(image)<1000 or not ctype.startswith('image/'): raise ValueError('invalid-image-response')
                    with Image.open(io.BytesIO(image)) as im: im.verify()
                    with Image.open(io.BytesIO(image)) as im:
                        im.load();w,h=im.size;fmt=im.format;hist=im.convert('L').resize((128,128)).histogram();total=sum(hist);entropy=-sum((n/total)*math.log2(n/total) for n in hist if n)
                    if min(w,h)<200 or fmt not in ('JPEG','PNG','WEBP','AVIF') or entropy<.1: raise ValueError('invalid-or-blank-image')
                    passed.append({'id':p['id'],'variantId':p['merchantVariantId'],'merchantProductId':str(live['id']),'status':'pass','checkedAt':stamp(),'price':p['price'],'currency':'EUR','available':v['available'],'finalProductUrl':p['directUrl'],'metadataSha256':sha,'barcode':v.get('barcode',''),'sku':v.get('sku',''),'sourceProductType':live.get('type',''),'image':{'url':p['image'],'status':'pass','httpStatus':200,'decoded':True,'format':fmt,'width':w,'height':h,'bodyBytes':len(image),'bodySha256':imsha,'entropy':entropy}})
                except Exception as e: blocked[p['merchantVariantId']]=str(e)
        except Exception as e:
            for p in items: blocked[p['merchantVariantId']]=str(e)
        return passed,blocked
    def save(): out.write_text(json.dumps(report,ensure_ascii=False)+'\n')
    save()
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        for future in concurrent.futures.as_completed([pool.submit(verify,g) for g in grouped.items()]):
            passed,blocked=future.result();report['results'].extend(passed);report['blocked'].update(blocked);save();print('Verified',len(report['results']),'blocked',len(report['blocked']),flush=True)
    report['completedAt']=stamp();report['status']='complete';save()
    print(json.dumps({'verified':len(report['results']),'blocked':len(report['blocked']),'trackingRequests':0}))
if __name__=='__main__': run(*sys.argv[1:])
