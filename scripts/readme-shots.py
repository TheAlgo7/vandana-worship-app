"""README screenshots and hero banner, from the live app.

  python scripts/readme-shots.py            # against production
  BASE=http://localhost:3000 python scripts/readme-shots.py

Needs Python with Playwright and Chrome. Everything it sets up (a setlist of four
songs, the parchment theme) lives in the throwaway browser's localStorage.
Writes docs/readme/{home,song,hindi,setlist,present,light,desktop,hero}.png.
"""
import base64, os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'https://vandanaapp.vercel.app')
OUT = Path('docs/readme')
OUT.mkdir(parents=True, exist_ok=True)
UA = 'Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36'
SONG = 'aadi-aur-anth'
SETLIST = [SONG, 'yeshu-gharana', 'aag-mein-ek-aur', 'aadar-ke-yogya']
PREP = "localStorage.setItem('vandana-setlist-enabled', 'true'); localStorage.setItem('vandana-hint-longpress', '1');"

with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome')
    ctx = b.new_context(viewport={'width': 393, 'height': 852}, device_scale_factor=2, user_agent=UA,
                        is_mobile=True, has_touch=True, service_workers='block')
    ctx.add_init_script(PREP)
    page = ctx.new_page()
    shot = lambda name, wait=1200: (page.wait_for_timeout(wait), page.screenshot(path=str(OUT / f'{name}.png')))

    page.goto(BASE + '/app'); shot('home', 3000)
    page.goto(BASE + f'/song/{SONG}'); shot('song', 2500)
    page.get_by_role('button', name='Hindi', exact=True).click(); shot('hindi')

    for s in SETLIST:
        page.goto(BASE + f'/song/{s}')
        page.get_by_role('button', name='Add to setlist').click()
        page.wait_for_timeout(300)
    page.goto(BASE + '/setlist'); shot('setlist', 2500)
    page.goto(BASE + f'/present/{SONG}'); shot('present', 2500)

    page.evaluate("localStorage.setItem('theme', 'light')")
    page.goto(BASE + f'/song/{SONG}'); shot('light', 2500)
    page.evaluate("localStorage.setItem('theme', 'dark')")
    ctx.close()

    desk = b.new_context(viewport={'width': 1440, 'height': 900}, service_workers='block')
    d = desk.new_page(); d.goto(BASE + f'/song/{SONG}'); d.wait_for_timeout(3000)
    d.screenshot(path=str(OUT / 'desktop.png'))
    desk.close()

    # Hero: the mark, the promise, and three real screens.
    img = lambda n: 'data:image/png;base64,' + base64.b64encode((OUT / n).read_bytes()).decode()
    icon = 'data:image/png;base64,' + base64.b64encode(Path('public/icons/icon-192.png').read_bytes()).decode()
    brand = 'data:font/otf;base64,' + base64.b64encode(Path('public/styles/Cathez-0vAm4.otf').read_bytes()).decode()
    hero = f'''<html><head>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Plus+Jakarta+Sans:wght@400;500&display=block" rel="stylesheet">
<style>
@font-face {{ font-family: Cathez; src: url('{brand}'); }}
body {{ margin: 0; width: 1600px; height: 820px; background: #0A0A0E; font-family: 'Plus Jakarta Sans'; color: #F2EEE6; overflow: hidden; position: relative; }}
.glow {{ position: absolute; right: -160px; top: -200px; width: 1000px; height: 1000px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(196,170,126,0.17), rgba(196,170,126,0)); }}
.copy {{ position: absolute; left: 110px; top: 190px; width: 660px; }}
.wm {{ display: flex; align-items: center; gap: 18px; font-family: Cathez; font-size: 54px; color: #C4AA7E; }}
.wm img {{ width: 64px; height: 64px; border-radius: 16px; }}
h1 {{ margin: 54px 0 0; font-family: Lora; font-size: 64px; line-height: 1.08; font-weight: 600; letter-spacing: -0.02em; }}
h1 em {{ font-style: italic; font-weight: 500; color: #C4AA7E; }}
p {{ margin: 28px 0 0; font-size: 24px; line-height: 1.5; color: #A8A399; max-width: 30ch; }}
.phone {{ position: absolute; width: 300px; border-radius: 38px; overflow: hidden; border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 40px 90px -30px rgba(0,0,0,0.9); background: #0A0A0E; }}
.phone img {{ display: block; width: 100%; }}
.a {{ left: 800px; top: 120px; transform: rotate(-4deg); }}
.b {{ left: 1040px; top: 70px; z-index: 2; }}
.c {{ left: 1280px; top: 140px; transform: rotate(4deg); }}
</style></head><body><div class="glow"></div>
<div class="copy"><div class="wm"><img src="{icon}">Vandana</div>
<h1>Every song in two scripts, <em>one worship.</em></h1>
<p>Hindi and Hinglish lyrics for dim rooms, late prayers and Sundays without WiFi.</p></div>
<div class="phone a"><img src="{img('home.png')}"></div>
<div class="phone b"><img src="{img('hindi.png')}"></div>
<div class="phone c"><img src="{img('light.png')}"></div>
</body></html>'''
    pg = b.new_page(viewport={'width': 1600, 'height': 820})
    pg.set_content(hero, wait_until='networkidle')
    pg.evaluate('document.fonts.ready')
    pg.wait_for_timeout(800)
    pg.screenshot(path=str(OUT / 'hero.png'))
    b.close()
print('written:', sorted(x.name for x in OUT.iterdir()))
