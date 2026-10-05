from PIL import Image, ImageDraw
from pathlib import Path
import sys

root = Path(sys.argv[1])
root.mkdir(parents=True, exist_ok=True)
palette = {'outline':'#29483f','leaf':'#4e9563','light':'#83bc70','shine':'#bbd989','trunk':'#986347','bark':'#c58c58','red':'#d86653','pink':'#efaa8c','yellow':'#f5cc66','cream':'#fff0b5','soil':'#aa7953','darksoil':'#785443','blue':'#6ab6c8'}
SCALE = 2
SIZE = 48 * SCALE
sprite_names = []

def sprite(name, paint, size=(SIZE,SIZE)):
    im=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(im)
    def r(box,color):
        x1,y1,x2,y2=box
        d.rectangle((x1*SCALE,y1*SCALE,(x2+1)*SCALE-1,(y2+1)*SCALE-1),fill=palette.get(color,color))
    paint(r)
    add_details(name,im)
    im.save(root / f'{name}.png')
    sprite_names.append(name)

def add_details(name,im):
    """Add deliberate one-pixel accents on the doubled pixel grid."""
    d=ImageDraw.Draw(im)
    def p(x,y,color):
        if 0<=x<im.width and 0<=y<im.height and im.getpixel((x,y))[3]:
            d.point((x,y),fill=palette.get(color,color))
    def q(x,y,color):
        for px in range(x,x+2):
            for py in range(y,y+2): p(px,py,color)
    def seed_detail():
        p(21*SCALE,37*SCALE,'shine'); p(28*SCALE,40*SCALE,'outline')
    if name.startswith('oak-') and name[-1].isdigit():
        stage=int(name[-1])
        if stage>=4:
            h=18 if stage==4 else 25; y=42-h
            for x,yy,c in [(18,y+5,'shine'),(24,y+3,'light'),(31,y+7,'shine'),(13,y+10,'shine'),(35,y+11,'light'),(20,y+14,'light'),(28,y+16,'shine')]: p(x*2,yy*2,c)
            for x,yy in [(22,28),(24,33),(26,37)]: p(x*2,yy*2,'outline')
        elif stage==1:
            seed_detail()
        else:
            for x,yy,c in [(16,27,'shine'),(18,29,'light'),(29,25,'shine'),(32,27,'light')]: p(x*2,yy*2,c)
    elif name.startswith(('sunflower-','wildflower-')):
        stage=int(name.rsplit('-',1)[1])
        if stage>=4:
            flower_color='cream' if name.startswith('sunflower') else 'pink'
            for x,yy in [(20,12),(27,16),(15,18),(32,23),(23,28)]: p(x*2,yy*2,flower_color)
            for x,yy in [(24,18),(24,22),(24,26),(18,33),(30,35)]: p(x*2,yy*2,'shine')
        elif stage in (2,3):
            for x,yy in [(16,23),(17,24),(31,22),(32,23),(23,30)]: p(x*2,yy*2,'shine')
        else:
            seed_detail()
    elif name.startswith('mushroom-'):
        stage=int(name.rsplit('-',1)[1])
        if stage>=2:
            for x,yy in [(21,19),(27,18),(30,21),(20,26),(28,27),(12,32),(37,29)]: q(x*2,yy*2,'cream')
            for x,yy in [(23,33),(24,36),(25,39)]: p(x*2,yy*2,'bark')
        else:
            seed_detail()
    elif name.startswith('cactus-'):
        stage=int(name.rsplit('-',1)[1])
        if stage>=2:
            for yy in range(17,38,5):
                p(24*SCALE+1,yy*SCALE,'shine')
                p(27*SCALE-1,(yy+2)*SCALE,'#397c56')
            if stage>=4:
                for x,yy in [(23,12),(24,10),(25,12),(22,13),(26,13)]: p(x*SCALE,yy*SCALE,'pink' if yy!=10 else 'cream')
        else:
            seed_detail()
    elif name=='cloud':
        for x,yy,c in [(16,12,'#ffffff'),(19,11,'#ffffff'),(29,16,'#ffffff'),(13,22,'#dce8d3'),(34,23,'#dce8d3')]: q(x*SCALE,yy*SCALE,c)
    elif name=='rock':
        for x,yy,c in [(19,32,'#e0e5d0'),(28,35,'#89988c'),(23,38,'#9eab9c'),(16,36,'#c5cdbf')]: p(x*SCALE,yy*SCALE,c)
    elif name=='grass':
        for x,yy,c in [(12,34,'shine'),(16,30,'shine'),(20,34,'#397c56'),(28,32,'light'),(32,36,'shine')]: q(x*SCALE,yy*SCALE,c)
    elif name=='butterfly':
        for x,yy,c in [(14,19,'cream'),(30,19,'cream'),(17,27,'yellow'),(28,27,'pink'),(20,14,'outline'),(27,14,'outline')]: q(x*SCALE,yy*SCALE,c)
    elif name=='drop':
        for x,yy,c in [(22,22,'#d7f4f1'),(20,25,'#a1dbe0'),(25,29,'#4e9fb7')]: p(x*SCALE,yy*SCALE,c)
    elif name=='watering-can':
        for x,yy,c in [(17,22,'#c7e5d9'),(20,21,'#e6f1d5'),(26,28,'#509ab0'),(9,20,'#83bc70')]: q(x*SCALE,yy*SCALE,c)
    elif name=='fence':
        for x in (6,24,42):
            q(x*SCALE+1,21*SCALE,'#f0d391')
            p(x*SCALE+1,40*SCALE,'#e0a06b')
    elif name=='soil':
        for x,yy,c in [(4,6,'#d1a16a'),(17,3,'#8a634a'),(31,9,'#c39461'),(42,5,'#d1a16a'),(8,18,'#8a634a'),(24,22,'#d1a16a'),(39,28,'#8a634a'),(14,36,'#d1a16a'),(33,41,'#8a634a')]: q(x*SCALE,yy*SCALE,c)
    elif name=='moon':
        for x,yy,c in [(19,15,'#fffdf0'),(27,23,'#c0d2d2'),(18,29,'#e7edce'),(31,17,'#fffdf0')]: q(x*SCALE,yy*SCALE,c)
    elif name in ('sparkle','star'):
        color='white' if name=='star' else 'cream'
        for x,yy in [(23,17),(18,23),(29,24),(24,30)]: p(x*SCALE,yy*SCALE,color)
    elif name=='firefly':
        for x,yy,c in [(18,21,'#eff8ce'),(29,22,'#eff8ce'),(21,30,'#fff0b5'),(27,29,'#efd689')]: q(x*SCALE,yy*SCALE,c)

def seed(r):
    r((18,36,29,42),'outline');r((16,38,31,40),'outline');r((19,36,28,41),'trunk');r((20,36,24,38),'bark')

def sprout(r,stage,kind):
    r((23,30-stage*3,25,42),'outline');r((24,30-stage*3,24,40),'leaf')
    r((15,29-stage*3,22,34-stage*3),'outline');r((13,27-stage*3,18,30-stage*3),'outline')
    r((15,28-stage*3,19,31-stage*3),'light');r((18,30-stage*3,22,32-stage*3),'leaf')
    r((26,25-stage*3,33,30-stage*3),'outline');r((31,23-stage*3,35,27-stage*3),'outline')
    r((27,26-stage*3,32,28-stage*3),'leaf');r((31,24-stage*3,34,26-stage*3),'shine')
    if stage==2:
        r((17,35,22,38),'leaf');r((26,32,31,35),'light')

def tree(r,s):
    h=18 if s==3 else 25; y=42-h
    r((21,y+9,27,43),'outline');r((23,y+9,25,41),'trunk');r((25,y+12,25,39),'bark')
    r((15,y+14,22,y+17),'outline');r((16,y+14,23,y+15),'trunk')
    r((9,y+4,38,y+16),'outline');r((5,y+8,42,y+13),'outline');r((14,y,33,y+20),'outline')
    r((10,y+5,37,y+15),'leaf');r((7,y+9,40,y+12),'leaf');r((15,y+1,32,y+18),'leaf')
    r((13,y+4,28,y+9),'light');r((10,y+8,22,y+12),'light');r((18,y+2,26,y+5),'shine')
    r((30,y+9,35,y+13),'#397c56');r((22,y+16,29,y+17),'#397c56')
    if s==4:r((11,y+11,13,y+12),'shine');r((30,y+3,32,y+4),'light')

def flower(r,s,wild=False):
    sprout(r,2,'flower');cy=17 if s==3 else 12
    centers=[(24,cy)] if not wild else [(17,17),(30,12),(27,25)]
    for cx,cy in centers:
        r((cx-1,cy+6,cx+1,40),'outline');r((cx,cy+5,cx,39),'leaf')
        r((cx-6,cy-3,cx+6,cy+3),'outline');r((cx-3,cy-6,cx+3,cy+6),'outline')
        r((cx-5,cy-2,cx+5,cy+2),'pink' if wild else 'yellow');r((cx-2,cy-5,cx+2,cy+5),'pink' if wild else 'yellow')
        r((cx-2,cy-2,cx+2,cy+2),'trunk' if not wild else 'yellow');r((cx-1,cy-1,cx,cy),'cream')

def mushroom(r,s):
    centers=[(24,29-s*4,9+s*2)]
    if s>=3:centers += [(11,35,7),(36,32,7)]
    for cx,y,w in centers:
        r((cx-3,y+5,cx+3,43),'outline');r((cx-2,y+5,cx+2,41),'cream');r((cx+1,y+6,cx+2,41),'bark')
        r((cx-w,y,cx+w,y+6),'outline');r((cx-w+3,y-3,cx+w-3,y+7),'outline');r((cx-4,y-5,cx+4,y+7),'outline')
        r((cx-w+1,y+1,cx+w-1,y+4),'red');r((cx-w+4,y-2,cx+w-4,y+5),'red');r((cx-3,y-4,cx+3,y+5),'red')
        r((cx-6,y+1,cx-3,y+3),'cream');r((cx+2,y-2,cx+5,y),'cream');r((cx+5,y+3,cx+7,y+4),'pink')

def cactus(r,s):
    y=33-s*5
    r((20,y,29,42),'outline');r((22,y-2,27,42),'outline');r((22,y,27,40),'leaf');r((22,y+2,23,38),'light')
    if s>=2:
        r((12,y+8,19,y+21),'outline');r((15,y+18,23,y+22),'outline');r((14,y+9,17,y+19),'light');r((16,y+19,23,y+20),'leaf')
        r((30,y+5,35,y+15),'outline');r((26,y+13,34,y+17),'outline');r((31,y+6,33,y+14),'leaf');r((28,y+14,33,y+15),'light')
    for yy in range(y+6,40,7):r((26,yy,27,yy+1),'shine')
    if s==4:r((22,y-5,27,y-2),'pink');r((24,y-7,25,y-1),'yellow')

for kind in ['oak','sunflower','mushroom','cactus','wildflower']:
    for stage in range(5):
        def paint(r,kind=kind,s=stage):
            if s==0:seed(r)
            elif kind=='mushroom':mushroom(r,s-1)
            elif kind=='cactus':cactus(r,s)
            elif s<3:sprout(r,s,kind)
            elif kind=='oak':tree(r,s)
            else:flower(r,s,kind=='wildflower')
        sprite(f'{kind}-{stage+1}',paint)

sprite('cloud',lambda r:[r((5,18,41,27),'#e9f1dd'),r((10,13,34,29),'#e9f1dd'),r((15,9,27,27),'#f9f9eb'),r((8,20,38,25),'#f9f9eb')])
sprite('rock',lambda r:[r((13,33,34,42),'outline'),r((17,29,30,42),'outline'),r((14,34,33,40),'#8e9c91'),r((18,30,29,39),'#b4beb0'),r((18,31,25,33),'#d7dcc4')])
sprite('grass',lambda r:[r((11,34,13,40),'leaf'),r((15,29,17,40),'light'),r((19,33,21,40),'leaf'),r((27,31,29,40),'leaf'),r((31,35,33,40),'light')])
sprite('butterfly',lambda r:[r((21,21,25,31),'outline'),r((11,17,20,25),'outline'),r((26,17,35,25),'outline'),r((13,18,19,23),'yellow'),r((27,18,33,23),'pink'),r((16,26,20,30),'pink'),r((26,26,30,30),'yellow'),r((19,15,20,19),'outline'),r((26,15,27,19),'outline')])
sprite('drop',lambda r:[r((22,17,25,21),'blue'),r((19,22,28,29),'blue'),r((21,30,26,32),'blue'),r((21,24,22,28),'#c4eced')])
sprite('watering-can',lambda r:[r((13,18,30,34),'outline'),r((15,20,28,32),'blue'),r((17,21,21,24),'#a7d5d0'),r((30,16,36,26),'outline'),r((32,18,34,23),'#00000000'),r((6,20,14,24),'outline'),r((3,17,7,21),'outline'),r((13,15,27,17),'outline')])
sprite('fence',lambda r:[r((0,24,47,28),'outline'),r((0,25,47,26),'bark'),r((0,35,47,39),'outline'),r((0,36,47,37),'trunk')]+[v for x in [5,23,41] for v in [r((x,18,x+5,45),'outline'),r((x+1,16,x+4,45),'outline'),r((x+1,19,x+3,43),'bark'),r((x+1,19,x+1,41),'cream')]])
sprite('soil',lambda r:[r((0,0,47,47),'soil')]+[r((x,y,x+2,y+1),'darksoil' if (x+y)%3 else 'bark') for y in range(4,48,8) for x in range(2+(y%3)*4,48,12)])
sprite('sparkle',lambda r:[r((23,16,24,31),'cream'),r((17,23,30,24),'cream'),r((21,21,26,26),'yellow')])
sprite('moon',lambda r:[r((13,7,34,40),'#a7b9d2'),r((7,13,40,34),'#a7b9d2'),r((10,10,37,37),'#dce6de'),r((14,7,29,38),'#f8f1cd'),r((7,14,34,29),'#f8f1cd'),r((12,11,30,33),'#f8f1cd'),r((13,18,18,22),'#c0d2d2'),r((24,28,29,32),'#c0d2d2'),r((27,12,31,15),'#d3dfd6'),r((14,29,16,31),'#d3dfd6')])
sprite('star',lambda r:[r((23,15,24,32),'#f6ecc1'),r((15,23,32,24),'#f6ecc1'),r((20,20,27,27),'#f6ecc1'),r((23,20,24,27),'#fffdf0')])
sprite('firefly',lambda r:[r((22,21,25,30),'#294f4f'),r((18,20,21,24),'#c5dbc1'),r((26,20,29,24),'#c5dbc1'),r((22,26,25,30),'#efd689'),r((23,27,24,29),'#fff0b3')])

contact=Image.new('RGBA',(SIZE*5,SIZE*6),'#e0e6bd')
for row,kind in enumerate(['oak','sunflower','mushroom','cactus','wildflower']):
    for col in range(5):contact.alpha_composite(Image.open(root / f'{kind}-{col+1}.png'),(col*SIZE,row*SIZE))
contact.save(root/'contact-sheet.png')
print(f'Generated {len(sprite_names)} crisp {SIZE}x{SIZE} pixel sprites and a contact sheet in {root}')
