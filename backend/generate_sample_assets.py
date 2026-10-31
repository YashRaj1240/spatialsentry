import os
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

DATA_DIR = Path("C:/Yashs_Project/spatialrecall/backend/data")
THUMBS = DATA_DIR / "thumbnails"
SCENES = DATA_DIR / "sample_scenes"

THUMBS.mkdir(parents=True, exist_ok=True)
SCENES.mkdir(parents=True, exist_ok=True)

# Generate sample scenes (640x400)
scenes = [
    ("kitchen_counter.jpg", (45, 52, 54), (108, 92, 231), "KITCHEN COUNTER - 11:42 AM", "Keys detected near Toaster"),
    ("entryway.jpg", (30, 39, 46), (0, 206, 201), "ENTRYWAY CONSOLE - 09:25 AM", "Wallet detected in Catch-all Bowl"),
    ("office_desk.jpg", (44, 62, 80), (253, 121, 168), "OFFICE WORKSTATION - 12:50 PM", "AirPods Pro on Notebook"),
    ("living_room.jpg", (53, 59, 72), (253, 203, 110), "LIVING ROOM COFFEE TABLE - 10:45 AM", "Reading Glasses near Mug"),
    ("garage_bench.jpg", (47, 53, 66), (255, 71, 87), "GARAGE WORKBENCH - 01:15 PM", "Screwdriver on Blue Towel"),
]

for filename, bg_color, accent, title, sub in scenes:
    img = Image.new("RGB", (720, 480), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Grid lines to simulate camera sensor / spatial grid
    for x in range(0, 720, 60):
        draw.line([(x, 0), (x, 480)], fill=(bg_color[0]+15, bg_color[1]+15, bg_color[2]+15), width=1)
    for y in range(0, 480, 60):
        draw.line([(0, y), (720, y)], fill=(bg_color[0]+15, bg_color[1]+15, bg_color[2]+15), width=1)
        
    # Draw a simulated object bounding box with SAM 3.1 glowing style
    draw.rectangle([320, 180, 440, 290], outline=accent, width=4)
    draw.text((325, 160), "SAM 3.1: DETECTED OBJECT", fill=accent)
    
    # HUD text
    draw.text((30, 30), f"[META SPATIAL STREAM] {title}", fill=(245, 246, 250))
    draw.text((30, 55), sub, fill=(180, 180, 180))
    draw.text((30, 440), "LATENCY: 12ms | FPS: 30 | SAM 3.1 CONFIDENCE: 98.4%", fill=(150, 150, 150))
    
    img.save(SCENES / filename, "JPEG", quality=85)

# Generate sample thumbnails (120x120)
thumbs = [
    ("keys.jpg", (108, 92, 231), "KEYS"),
    ("wallet.jpg", (0, 206, 201), "WALLET"),
    ("airpods.jpg", (253, 121, 168), "AIRPODS"),
    ("glasses.jpg", (253, 203, 110), "GLASSES"),
    ("screwdriver.jpg", (255, 71, 87), "TOOL")
]

for filename, color, label in thumbs:
    img = Image.new("RGB", (160, 160), color=(30, 30, 35))
    draw = ImageDraw.Draw(img)
    draw.rectangle([10, 10, 150, 150], outline=color, width=3)
    draw.rectangle([40, 40, 120, 120], fill=color)
    draw.text((50, 130), label, fill=(255, 255, 255))
    img.save(THUMBS / filename, "JPEG", quality=85)

print("Sample scenes and thumbnails generated successfully.")
