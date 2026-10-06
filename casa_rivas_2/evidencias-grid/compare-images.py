#!/usr/bin/env python3
"""Comparador reproducible RGB: píxeles con tolerancia por canal y SSIM global.
Uso: python3 compare-images.py referencia.png candidata.png [--tolerance 16] [--minimum 85]
"""
import argparse
import math
import sys
try:
    from PIL import Image
except ImportError:
    sys.exit('Dependencia faltante: Pillow. Instalar fuera del repo: python3 -m pip install --user Pillow')

p = argparse.ArgumentParser()
p.add_argument('reference'); p.add_argument('candidate')
p.add_argument('--tolerance', type=int, default=16, help='delta máximo por canal RGB (0..255)')
p.add_argument('--minimum', type=float, default=85.0, help='umbral mínimo de similitud porcentual')
a = p.parse_args()
ref, cand = Image.open(a.reference).convert('RGB'), Image.open(a.candidate).convert('RGB')
if ref.size != cand.size:
    print(f'DIMENSION_MISMATCH ref={ref.size} candidate={cand.size}'); sys.exit(2)
r = list(ref.get_flattened_data()) if hasattr(ref, 'get_flattened_data') else list(ref.getdata())
c = list(cand.get_flattened_data()) if hasattr(cand, 'get_flattened_data') else list(cand.getdata())
within = sum(max(abs(x-y) for x, y in zip(px, qx)) <= a.tolerance for px, qx in zip(r, c))
# SSIM global por canal, constante estándar para rango L=255.
def ssim(xs, ys):
    n = len(xs); mx = sum(xs)/n; my = sum(ys)/n
    vx = sum((x-mx)**2 for x in xs)/n; vy = sum((y-my)**2 for y in ys)/n
    cov = sum((x-mx)*(y-my) for x,y in zip(xs,ys))/n
    c1=(.01*255)**2; c2=(.03*255)**2
    return ((2*mx*my+c1)*(2*cov+c2))/((mx*mx+my*my+c1)*(vx+vy+c2))
score = sum(ssim([x[k] for x in r], [x[k] for x in c]) for k in range(3))/3*100
pixel_score=within/len(r)*100
print(f'size={ref.size[0]}x{ref.size[1]} tolerance={a.tolerance} pixel_similarity={pixel_score:.4f}% global_ssim={score:.4f}%')
if pixel_score < a.minimum:
    print(f'FAIL: pixel_similarity < {a.minimum:.2f}%'); sys.exit(1)
print(f'PASS: pixel_similarity >= {a.minimum:.2f}%')
