import sys, os, glob
from playwright.sync_api import sync_playwright
from PIL import Image
src='/tmp/lm-svg'; dst='/home/claude/lumiere/public/images'
os.makedirs(dst+'/products',exist_ok=True); os.makedirs(dst+'/editorial',exist_ok=True)
only=sys.argv[1] if len(sys.argv)>1 else ''
files=sorted(f for f in glob.glob(src+'/*.svg') if only in f)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1200,'height':1500})
    for f in files:
        name=os.path.basename(f)[:-4]
        pg.goto('file://'+f); 
        tmp='/tmp/_r.png'; pg.screenshot(path=tmp)
        im=Image.open(tmp).convert('RGB')
        folder='editorial' if name.startswith('ed-') else 'products'
        base=f'{dst}/{folder}/{name}'
        im.save(base+'-1200.jpg',quality=86,optimize=True,progressive=True)
        for w in (800,480):
            im.resize((w,int(w*1.25)),Image.LANCZOS).save(f'{base}-{w}.jpg',quality=84,optimize=True,progressive=True)
    b.close()
print('rendered',len(files))
