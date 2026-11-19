import sys, glob
from PIL import Image, ImageDraw
out, pats = sys.argv[1], sys.argv[2:]
fs=sorted(f for p in pats for f in glob.glob(p))
cols=3; W=520; H=520; rows=(len(fs)+cols-1)//cols
sh=Image.new('RGB',(cols*W,rows*(H+24)),'white'); d=ImageDraw.Draw(sh)
for i,f in enumerate(fs):
    im=Image.open(f); im.thumbnail((500,500)); x=(i%cols)*W; y=(i//cols)*(H+24)
    sh.paste(im,(x+10,y+10)); d.text((x+10,y+H+4),f.split('/')[-1],fill='black')
sh.save(out,quality=88)
