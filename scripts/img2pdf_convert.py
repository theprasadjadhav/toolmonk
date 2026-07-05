#!/usr/bin/env python3
"""Lossless image to PDF conversion using img2pdf."""
import sys

import img2pdf

if len(sys.argv) != 3:
    print("Usage: img2pdf_convert.py <input_image> <output.pdf>", file=sys.stderr)
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

with open(output_path, "wb") as f:
    f.write(img2pdf.convert(input_path))
