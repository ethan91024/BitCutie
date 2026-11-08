"""Generate the small pixel-cat ICO needed by the Windows Tauri resource build."""

from pathlib import Path
import struct


SIZE = 32
SCALE = 2
GRID = 16
TRANSPARENT = (0, 0, 0, 0)

palette = {
    "body": (142, 212, 166, 255),
    "outline": (33, 72, 62, 255),
    "cream": (255, 240, 209, 255),
    "eye": (36, 61, 57, 255),
    "pink": (231, 127, 112, 255),
    "gold": (240, 196, 109, 255),
}

grid = [[None for _ in range(GRID)] for _ in range(GRID)]


def paint(x: int, y: int, color: str) -> None:
    grid[y][x] = color


# Pixel silhouette, face, feet, and a tiny gold collar.
rows = {
    2: (5, 6),
    3: (4, 7),
    4: (3, 8),
    5: (2, 9),
    6: (2, 9),
    7: (1, 10),
    8: (1, 10),
    9: (1, 10),
    10: (2, 9),
    11: (2, 9),
    12: (2, 9),
    13: (3, 4),
}
for y, (start, end) in rows.items():
    for x in range(start, end + 1):
        paint(x, y, "outline" if y in (2, 3, 4, 13) or x in (start, end) else "body")
for x in range(7, 9):
    paint(x, 13, "outline")
for x in (4, 8):
    paint(x, 7, "cream")
    paint(x, 8, "eye")
paint(6, 9, "pink")
for x in (3, 4, 7, 8):
    paint(x, 12, "cream")
for x in (2, 3, 8, 9):
    paint(x, 13, "outline")
paint(9, 9, "gold")

rgba = bytearray()
for y in range(SIZE - 1, -1, -1):
    gy = y // SCALE
    for x in range(SIZE):
        gx = x // SCALE
        entry = grid[gy][gx]
        red, green, blue, alpha = palette[entry] if entry else TRANSPARENT
        rgba.extend((blue, green, red, alpha))

mask_stride = ((SIZE + 31) // 32) * 4
and_mask = bytes(mask_stride * SIZE)
image_size = 40 + len(rgba) + len(and_mask)
dib = struct.pack(
    "<IiiHHIIiiII",
    40,
    SIZE,
    SIZE * 2,
    1,
    32,
    0,
    len(rgba) + len(and_mask),
    2835,
    2835,
    0,
    0,
) + bytes(rgba) + and_mask

ico_header = struct.pack("<HHH", 0, 1, 1)
ico_entry = struct.pack("<BBBBHHII", SIZE, SIZE, 0, 0, 1, 32, image_size, 22)
output = Path(__file__).resolve().parents[1] / "src-tauri" / "icons" / "icon.ico"
output.parent.mkdir(parents=True, exist_ok=True)
output.write_bytes(ico_header + ico_entry + dib)
print(f"Generated {output}")
