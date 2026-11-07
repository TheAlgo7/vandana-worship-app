"""README screenshots, from the live app.

  python scripts/readme-shots.py            # against production
  BASE=http://localhost:3000 python scripts/readme-shots.py

Needs Python with Playwright and Chrome. Everything it sets up (a setlist of four
songs, the parchment theme) lives in the throwaway browser's localStorage.
Writes docs/readme/src/assets/*.png; the README Kit
(Work/Playbooks/README Kit/render.py) draws docs/readme/*.webp from them.
"""
import base64, os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'https://vandanaapp.vercel.app')
OUT = Path('docs/readme/src/assets')
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

    b.close()
print('written:', sorted(x.name for x in OUT.iterdir()))
