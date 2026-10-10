"""Runtime proxy transport for direct merchant HTTP evidence; never follows redirects."""
import sys,json,urllib.request,urllib.error,urllib.parse,base64
class Redirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None
url=sys.argv[1];u=urllib.parse.urlsplit(url)
policy=json.load(open('destination-link-policy.json'))
hosts={h for p in policy['merchants'].values() for h in p['merchantHosts']}
tracking={h for p in policy['merchants'].values() for h in p['affiliateHosts']+p['redirectHosts']}
hosts-=tracking
if u.scheme!='https' or u.hostname not in hosts or u.username or u.password or u.port: raise ValueError('invalid-direct-host')
req=urllib.request.Request(url,headers={'User-Agent':'FundBlick-Destination-Audit/2.0','Accept':'text/html','Accept-Encoding':'identity'})
try: res=urllib.request.build_opener(Redirect).open(req,timeout=15)
except urllib.error.HTTPError as error: res=error
with res:
    body=res.read(4*1024*1024+1)
    if len(body)>4*1024*1024: raise ValueError('response-too-large')
    print(json.dumps({'status':res.code,'headers':{k.lower():v for k,v in res.headers.items()},'body':base64.b64encode(body).decode()}))
