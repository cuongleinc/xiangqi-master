#!/usr/bin/env python3
"""Generate the Chu-Han War epic battle background (1920x1080)."""

from PIL import Image, ImageDraw, ImageFilter
import math, random

W, H = 1920, 1080
img = Image.new('RGBA', (W, H), (0, 0, 0, 255))
draw = ImageDraw.Draw(img, 'RGBA')

def rgba(r, g, b, a=255):
    return (r, g, b, a)

def rect(xy, fill):
    draw.rectangle(xy, fill=fill)

def ellipse(xy, fill):
    draw.ellipse(xy, fill=fill)

def polygon(pts, fill):
    draw.polygon(pts, fill=fill)

def line(xy, fill, w=1):
    draw.line(xy, fill=fill, width=w)

def circle(cx, cy, r, fill):
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill)

def glow(cx, cy, r, color, steps=6):
    for i in range(steps):
        radius = r + i * (r * 0.5)
        alpha = int(255 * (1 - i/steps) * (color[3]/255) * 0.3)
        if alpha > 0:
            circle(cx, cy, int(radius), (color[0], color[1], color[2], alpha))

# ═══════════════════════════════════════════
# LAYER 1: Sky — dark turbulent crimson-black
# ═══════════════════════════════════════════
for y in range(0, 400, 4):
    t = y / 400
    r = int(26 + (10-26) * t)
    g = int(0 + (2-0) * t)
    b = int(5 + (0-5) * t)
    a = 255
    rect([0, y, W, y+4], rgba(r, g, b, a))

# Storm cloud layers
for _ in range(30):
    cx = random.randint(-200, W+200)
    cy = random.randint(-100, 350)
    rw = random.randint(200, 600)
    rh = random.randint(40, 120)
    color = rgba(random.randint(20, 40), random.randint(0, 5), random.randint(2, 10), random.randint(30, 80))
    ellipse([cx-rw//2, cy-rh//2, cx+rw//2, cy+rh//2], color)

# ═══════════════════════════════════════════
# LAYER 2: Blood Moon
# ═══════════════════════════════════════════
moon_cx, moon_cy = 1550, 140
moon_r = 110
glow(1550, 140, 110, rgba(139, 26, 0, 255), steps=8)
glow(1550, 140, 90, rgba(139, 26, 0, 255), steps=5)
circle(1550, 140, 110, rgba(139, 26, 0, 160))
circle(1550, 140, 100, rgba(170, 40, 5, 200))
circle(1550, 140, 85, rgba(200, 60, 15, 180))
# Moon craters
for _ in range(12):
    dx = random.randint(-70, 70)
    dy = random.randint(-60, 60)
    if dx*dx + dy*dy < 80*80:
        circle(moon_cx+dx, moon_cy+dy, random.randint(5, 20), rgba(100, 20, 5, 80))

# ═══════════════════════════════════════════
# LAYER 3: Distant Mountains (multiple ranges)
# ═══════════════════════════════════════════
for layer, (base_y, color, count) in enumerate([
    (320, rgba(15, 5, 2, 255), 12),
    (350, rgba(20, 8, 3, 255), 10),
    (380, rgba(26, 10, 4, 255), 8),
    (410, rgba(30, 12, 5, 255), 6),
]):
    peaks = [(i * (W // (count-1)), base_y - random.randint(40, 140)) for i in range(count)]
    pts = [(0, H)] + peaks + [(W, H)]
    polygon(pts, color)

# ═══════════════════════════════════════════
# LAYER 4: Ravens in the sky
# ═══════════════════════════════════════════
for _ in range(10):
    rx = random.randint(100, 1800)
    ry = random.randint(50, 300)
    size = random.randint(6, 14)
    wing = size * 2
    pts = [(rx, ry), (rx-wing, ry+size), (rx-size//2, ry+size//2), (rx, ry+size//3), (rx+size//2, ry+size//2), (rx+wing, ry+size)]
    polygon(pts, rgba(5, 1, 0, 200))

# ═══════════════════════════════════════════
# LAYER 5: The River — 鴻溝 (glowing gold center)
# ═══════════════════════════════════════════
river_x = W // 2
# River glow
for i in range(15):
    alpha = int(255 * (1 - i/15) * 0.3)
    w = 3 + i * 8
    rect([river_x - w//2, 300, river_x + w//2, H-100], rgba(212, 168, 67, alpha))
# River core
rect([river_x - 4, 320, river_x + 4, H-120], rgba(212, 168, 67, 120))
rect([river_x - 2, 340, river_x + 2, H-140], rgba(255, 210, 100, 180))
rect([river_x - 1, 350, river_x + 1, H-160], rgba(255, 230, 140, 220))

# River mist
for _ in range(20):
    cy = random.randint(350, H-120)
    rw = random.randint(50, 200)
    rh = random.randint(10, 30)
    ellipse([river_x - rw//2, cy - rh//2, river_x + rw//2, cy + rh//2], rgba(212, 168, 67, random.randint(8, 25)))

# ═══════════════════════════════════════════
# LAYER 6: Banners — Chu (left/crimson) & Han (right/blue)
# ═══════════════════════════════════════════
# Chu banners (left side)
chu_banners = [
    (100, 420, 160, 30), (200, 400, 200, 28), (280, 430, 180, 32),
    (360, 410, 190, 26), (480, 390, 220, 30), (580, 430, 150, 32),
]
for bx, by, bh, bw in chu_banners:
    gradient_alpha = 200
    for gy in range(by, by+bh, 2):
        t = (gy - by) / bh
        r = int(139 + (90-139) * t)
        g = int(0 + (5-0) * t)
        b = int(0 + (3-0) * t)
        rect([bx, gy, bx+bw, gy+2], rgba(r, g, b, gradient_alpha))
    # Pole
    rect([bx + bw//2 - 1, by, bx + bw//2 + 1, by+bh+40], rgba(40, 15, 5, 255))

# Han banners (right side)
han_banners = [
    (1550, 400, 170, 32), (1650, 420, 190, 28), (1750, 390, 210, 30),
    (1400, 430, 160, 32), (1300, 410, 180, 28), (1200, 440, 150, 30),
]
for bx, by, bh, bw in han_banners:
    for gy in range(by, by+bh, 2):
        t = (gy - by) / bh
        r = int(13 + (26-13) * t)
        g = int(21 + (42-21) * t)
        b = int(55 + (107-55) * t)
        rect([bx, gy, bx+bw, gy+2], rgba(r, g, b, 200))
    rect([bx + bw//2 - 1, by, bx + bw//2 + 1, by+bh+40], rgba(40, 15, 5, 255))

# ═══════════════════════════════════════════
# LAYER 7: Soldiers — helper function
# ═══════════════════════════════════════════
def draw_soldier(cx, base_y, height, color, has_spear=False, kneeling=False):
    h = height
    if kneeling:
        # Kneeling crossbowman
        body_h = int(h * 0.5)
        rect([cx - h//6, base_y - body_h, cx + h//6, base_y], color)
        circle(cx, base_y - body_h - h//7, h//7, color)
        if has_spear:
            rect([cx + h//5, base_y - body_h - h//4, cx + h//5 + 3, base_y - body_h + h//2], rgba(80, 40, 20, 200))
    else:
        # Standing soldier
        body_w = h // 5
        body_h = h // 2
        leg_h = h // 3
        # Legs
        rect([cx - body_w//2, base_y - leg_h, cx - 2, base_y], color)
        rect([cx + 2, base_y - leg_h, cx + body_w//2, base_y], color)
        # Body
        rect([cx - body_w//2, base_y - leg_h - body_h, cx + body_w//2, base_y - leg_h], color)
        # Head
        head_r = h // 8
        circle(cx, base_y - leg_h - body_h - head_r + 2, head_r, color)
        # Helmet
        rect([cx - head_r, base_y - leg_h - body_h - head_r - 4, cx + head_r, base_y - leg_h - body_h - head_r + 2], rgba(40, 20, 10, 200))
        if has_spear:
            rect([cx + body_w//2 - 1, base_y - int(h * 0.6), cx + body_w//2 + 2, base_y + 5], rgba(80, 40, 20, 220))

# Chu soldiers (left, crimson tones)
for i in range(35):
    x = random.randint(30, 700)
    y = random.randint(520, 620)
    h = random.randint(70, 130)
    col = rgba(random.randint(40, 70), random.randint(5, 15), random.randint(3, 10), random.randint(180, 255))
    draw_soldier(x, y, h, col, has_spear=random.random() > 0.5, kneeling=random.random() > 0.85)
    if random.random() > 0.7:
        circle(x + random.randint(-20, 20), y - h + random.randint(-10, 10), random.randint(6, 14), rgba(255, 140, 0, random.randint(30, 80)))

# Han soldiers (right, blue tones)
for i in range(35):
    x = random.randint(1180, 1910)
    y = random.randint(520, 620)
    h = random.randint(70, 130)
    col = rgba(random.randint(10, 25), random.randint(15, 35), random.randint(40, 70), random.randint(180, 255))
    draw_soldier(x, y, h, col, has_spear=random.random() > 0.5, kneeling=random.random() > 0.85)
    if random.random() > 0.7:
        circle(x + random.randint(-20, 20), y - h + random.randint(-10, 10), random.randint(6, 14), rgba(255, 140, 0, random.randint(30, 80)))

# ═══════════════════════════════════════════
# LAYER 8: Hạng Vũ — Chu General on horse
# ═══════════════════════════════════════════
gx, gy = 480, 380
# Golden aura
glow(gx, gy-60, 160, rgba(212, 168, 67, 60), steps=4)
# Horse body
horse_color = rgba(15, 5, 2, 255)
polygon([(gx-60, gy+80), (gx-50, gy+30), (gx-20, gy+20), (gx+20, gy+25), (gx+50, gy+35), (gx+60, gy+60), (gx+40, gy+90), (gx-40, gy+90)], horse_color)
# Horse legs
for lx in [gx-35, gx-15, gx+15, gx+40]:
    rect([lx-6, gy+85, lx+6, gy+150], rgba(12, 3, 1, 255))
# Horse head
polygon([(gx+50, gy+35), (gx+70, gy+15), (gx+85, gy+10), (gx+80, gy+30), (gx+60, gy+50)], horse_color)
# Front legs raised
rect([gx-30, gy+20, gx-20, gy+70], rgba(12, 3, 1, 255))
rect([gx-10, gy+15, gx, gy+65], rgba(12, 3, 1, 255))
# Rider — Hạng Vũ
polygon([(gx-20, gy-20), (gx+20, gy-15), (gx+25, gy+20), (gx+15, gy+50), (gx-15, gy+50), (gx-25, gy+20)], rgba(20, 8, 3, 255))
# Head
circle(gx, gy-35, 18, rgba(15, 5, 2, 255))
# Cape
polygon([(gx-20, gy-10), (gx-60, gy+30), (gx-50, gy+70), (gx-10, gy+40)], rgba(80, 15, 10, 180))
# Sword arm (y values small→large)
rect([gx+15, gy-65, gx+20, gy-20], rgba(20, 8, 3, 255))
rect([gx+18, gy-100, gx+22, gy-65], rgba(180, 160, 140, 220))
rect([gx+17, gy-68, gx+23, gy-55], rgba(212, 168, 67, 200))

# ═══════════════════════════════════════════
# LAYER 9: Lưu Bang — Han General on horse
# ═══════════════════════════════════════════
hx, hy = 1440, 390
glow(hx, hy-50, 140, rgba(26, 50, 120, 40), steps=3)
# Horse
polygon([(hx-55, hy+80), (hx-45, hy+35), (hx-15, hy+25), (hx+25, hy+30), (hx+50, hy+40), (hx+55, hy+65), (hx+35, hy+85), (hx-35, hy+85)], rgba(12, 4, 2, 255))
for lx in [hx-30, hx-10, hx+15, hx+35]:
    rect([lx-5, hy+85, lx+5, hy+145], rgba(10, 3, 1, 255))
polygon([(hx+50, hy+40), (hx+65, hy+20), (hx+78, hy+15), (hx+75, hy+35), (hx+55, hy+55)], rgba(12, 4, 2, 255))
rect([hx-25, hy+25, hx-15, hy+70], rgba(10, 3, 1, 255))
rect([hx-5, hy+20, hx+5, hy+65], rgba(10, 3, 1, 255))
# Rider
polygon([(hx-18, hy-15), (hx+18, hy-10), (hx+22, hy+25), (hx+12, hy+50), (hx-12, hy+50), (hx-22, hy+25)], rgba(15, 12, 25, 255))
circle(hx, hy-30, 16, rgba(10, 8, 15, 255))
polygon([(hx-18, hy-5), (hx-55, hy+35), (hx-45, hy+65), (hx-8, hy+45)], rgba(15, 20, 50, 160))
# Banner in hand
rect([hx+10, hy-55, hx+14, hy+10], rgba(60, 40, 20, 255))
rect([hx+14, hy-55, hx+40, hy-40], rgba(26, 42, 107, 200))
rect([hx+30, hy-55, hx+44, hy-35], rgba(26, 42, 107, 220))

# ═══════════════════════════════════════════
# LAYER 10: Foreground debris & terrain
# ═══════════════════════════════════════════
for _ in range(15):
    pts = [(random.randint(0, W), H - random.randint(0, 30)) for _ in range(4)]
    polygon(pts, rgba(random.randint(5, 15), random.randint(3, 8), random.randint(2, 5), 255))

# Fallen banners
for fx, fy, fw, fh in [(300, 700, 80, 12), (1400, 720, 90, 10), (800, 710, 60, 10)]:
    polygon([(fx, fy), (fx+fw, fy), (fx+fw+10, fy+fh), (fx+10, fy+fh)], rgba(60, 20, 10, 200))
    rect([fx, fy-30, fx+2, fy], rgba(40, 15, 5, 255))

# ═══════════════════════════════════════════
# LAYER 11: Battle dust atmosphere
# ═══════════════════════════════════════════
for _ in range(25):
    cx = random.randint(-100, W+100)
    cy = random.randint(350, 650)
    rw = random.randint(150, 500)
    rh = random.randint(20, 60)
    ellipse([cx-rw//2, cy-rh//2, cx+rw//2, cy+rh//2], rgba(139, 115, 85, random.randint(5, 15)))

# ═══════════════════════════════════════════
# LAYER 12: Final vignette (dark edges)
# ═══════════════════════════════════════════
# Top
for y in range(0, 200, 2):
    alpha = int(255 * (1 - y/200))
    rect([0, y, W, y+2], rgba(5, 2, 0, alpha))
# Bottom
for y in range(H-200, H, 2):
    alpha = int(255 * ((y - (H-200)) / 200))
    rect([0, y, W, y+2], rgba(5, 2, 0, alpha))
# Left
for x in range(0, 100, 2):
    alpha = int(255 * (1 - x/100))
    rect([x, 0, x+2, H], rgba(5, 2, 0, alpha))
# Right
for x in range(W-100, W, 2):
    alpha = int(255 * ((x - (W-100)) / 100))
    rect([x, 0, x+2, H], rgba(5, 2, 0, alpha))

# ═══════════════════════════════════════════
# FINAL: Convert to RGB and apply subtle blur
# ═══════════════════════════════════════════
img_rgb = Image.new('RGB', (W, H), (0, 0, 0))
img_rgb.paste(img, (0, 0), img)
img_rgb = img_rgb.filter(ImageFilter.GaussianBlur(radius=0.6))

# Sharpen center river area
crop = img_rgb.crop((river_x-60, 300, river_x+60, H-100))
img_rgb.paste(crop, (river_x-60, 300))

# Save
output_path = '/Users/cuong.le/Documents/PythonChineseChess/apps/web/public/battle_bg.jpg'
img_rgb.save(output_path, 'JPEG', quality=92)
print(f'Saved to {output_path}')
print(f'Size: {W}x{H}')
