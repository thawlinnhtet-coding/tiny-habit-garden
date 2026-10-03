from PIL import Image, ImageDraw
from pathlib import Path
import sys

root = Path(sys.argv[1])
root.mkdir(parents=True, exist_ok=True)
palette = {'outline':'#29483f','leaf':'#4e9563','light':'#83bc70','shine':'#bbd989','trunk':'#986347','bark':'#c58c58','red':'#d86653','pink':'#efaa8c','yellow':'#f5cc66','cream':'#fff0b5','soil':'#aa7953','darksoil':'#785443','blue':'#6ab6c8'}

def sprite(name, paint, size=(48,48)):
    im=Image.new('RGBA',size,(0,0,0,0)); d=ImageDraw.Draw(im)
    def r(box,color): d.rectangle(box,fill=palette.get(color,color))
    paint(r)
    im.save(root / f'{name}.png')

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

contact=Image.new('RGBA',(48*5,48*6),'#e0e6bd')
for row,kind in enumerate(['oak','sunflower','mushroom','cactus','wildflower']):
    for col in range(5):contact.alpha_composite(Image.open(root / f'{kind}-{col+1}.png'),(col*48,row*48))
contact.resize((720,864),Image.Resampling.NEAREST).save(root/'contact-sheet.png')
print(f'Generated {len(list(root.glob("*.png")))} original pixel sprites in {root}')
