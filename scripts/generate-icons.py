#!/usr/bin/env python3
"""Generate Luna Client icons without external dependencies.

Creates PNGs in src-tauri/icons plus a Windows .ico container.
Run with: npm run icons
"""

from __future__ import annotations

import math
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src-tauri", "icons")

SIZES = [16, 32, 48, 64, 128, 256, 512]


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return low if value < low else high if value > high else value


def lerp(a: tuple[float, float, float], b: tuple[float, float, float], t: float):
    t = clamp(t)
    return (
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
    )


def blend(base, top, alpha: float):
    return (
        base[0] * (1 - alpha) + top[0] * alpha,
        base[1] * (1 - alpha) + top[1] * alpha,
        base[2] * (1 - alpha) + top[2] * alpha,
    )


def render(size: int):
    s = float(size)
    half = s / 2.0
    inset = s * 0.028
    radius = s * 0.235
    corner = half - inset - radius

    cx = s * 0.455
    cy = s * 0.505
    moon_r = s * 0.275
    bite_x = s * 0.60
    bite_y = s * 0.395
    bite_r = s * 0.235

    ring_cx = s * 0.505
    ring_cy = s * 0.545
    ring_rx = s * 0.365
    ring_ry = s * 0.145
    angle = math.radians(-22.0)
    ca, sa = math.cos(angle), math.sin(angle)

    pixels = []
    for py in range(size):
        row = []
        ny = py + 0.5
        for px in range(size):
            nx = px + 0.5

            qx = abs(nx - half) - corner
            qy = abs(ny - half) - corner
            dist = math.hypot(max(qx, 0.0), max(qy, 0.0)) + min(max(qx, qy), 0.0) - radius
            alpha = clamp(0.5 - dist)
            if alpha <= 0.0:
                row.append((0, 0, 0, 0))
                continue

            gradient = clamp((nx / s) * 0.55 + (ny / s) * 0.60)
            color = lerp((16, 21, 38), (4, 6, 13), gradient)

            glow_distance = math.hypot(nx - s * 0.42, ny - s * 0.42) / (s * 0.62)
            glow = max(0.0, 1.0 - glow_distance) ** 2.1
            color = (
                color[0] + 58 * glow,
                color[1] + 30 * glow,
                color[2] + 118 * glow,
            )

            d1 = math.hypot(nx - cx, ny - cy) - moon_r
            d2 = math.hypot(nx - bite_x, ny - bite_y) - bite_r
            moon = clamp(0.5 - max(d1, -d2))
            if moon > 0.0:
                moon_color = lerp((190, 174, 255), (34, 211, 238), clamp((ny / s) * 0.9 - 0.05))
                color = blend(color, moon_color, moon * 0.97)

            ux = nx - ring_cx
            uy = ny - ring_cy
            ex = ux * ca + uy * sa
            ey = -ux * sa + uy * ca
            normalized = math.hypot(ex / ring_rx, ey / ring_ry)
            ring = clamp((0.013 - abs(normalized - 1.0)) / 0.013) * 0.75
            if ring > 0.0:
                color = blend(color, (150, 240, 255), ring)

            star_distance = math.hypot(nx - s * 0.745, ny - s * 0.335)
            star = clamp((s * 0.022 - star_distance) / (s * 0.012))
            if star > 0.0:
                color = blend(color, (220, 250, 255), star)

            row.append(
                (
                    int(clamp(color[0], 0, 255)),
                    int(clamp(color[1], 0, 255)),
                    int(clamp(color[2], 0, 255)),
                    int(clamp(alpha) * 255),
                )
            )
        pixels.append(row)
    return pixels


def png_bytes(size: int, pixels) -> bytes:
    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for r, g, b, a in row:
            raw.extend((r, g, b, a))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return header + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")


def write_png(path: str, data: bytes) -> None:
    with open(path, "wb") as handle:
        handle.write(data)


def write_icns(path: str, entries) -> None:
    body = b""
    for icon_type, data in entries:
        body += icon_type + struct.pack(">I", len(data) + 8) + data
    payload = b"icns" + struct.pack(">I", len(body) + 8) + body
    with open(path, "wb") as handle:
        handle.write(payload)


def write_ico(path: str, entries) -> None:
    header = struct.pack("<HHH", 0, 1, len(entries))
    offset = 6 + 16 * len(entries)
    table = b""
    payload = b""
    for size, data in entries:
        table += struct.pack(
            "<BBBBHHII",
            size % 256,
            size % 256,
            0,
            0,
            1,
            32,
            len(data),
            offset,
        )
        offset += len(data)
        payload += data
    with open(path, "wb") as handle:
        handle.write(header + table + payload)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    encoded = {}
    for size in SIZES:
        pixels = render(size)
        data = png_bytes(size, pixels)
        encoded[size] = data
        print(f"rendered {size}x{size}")

    write_png(os.path.join(OUT, "32x32.png"), encoded[32])
    write_png(os.path.join(OUT, "128x128.png"), encoded[128])
    write_png(os.path.join(OUT, "128x128@2x.png"), encoded[256])
    write_png(os.path.join(OUT, "icon.png"), encoded[512])
    for size in (16, 32, 48, 64, 128, 256):
        write_png(os.path.join(OUT, f"{size}x{size}.png"), encoded[size])

    write_ico(
        os.path.join(OUT, "icon.ico"),
        [(size, encoded[size]) for size in (16, 32, 48, 64, 128, 256)],
    )
    write_icns(
        os.path.join(OUT, "icon.icns"),
        [
            (b"ic07", encoded[128]),
            (b"ic08", encoded[256]),
            (b"ic09", encoded[512]),
        ],
    )
    print(f"icons written to {OUT}")


if __name__ == "__main__":
    main()
