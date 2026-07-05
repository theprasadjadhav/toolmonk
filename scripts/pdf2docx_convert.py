#!/usr/bin/env python3
"""PDF to DOCX conversion using pdf2docx (PyMuPDF-based)."""
import sys

from pdf2docx import Converter

if len(sys.argv) != 3:
    print("Usage: pdf2docx_convert.py <input.pdf> <output.docx>", file=sys.stderr)
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

cv = Converter(input_path)
cv.convert(output_path)
cv.close()
