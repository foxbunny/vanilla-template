#!/usr/bin/env bash
# Add a self-hosted web font to the app. Give it either:
#
#   ./add-font.sh MyFont.ttf              a font file — converted locally to a
#   ./add-font.sh MyFont.otf              subset woff2 (needs fonttools; keeps a
#                                         variable font variable)
#
#   ./add-font.sh transfonter-kit.zip     a Transfonter download — its woff2 and
#                                         @font-face are wired in as-is (no tools)
#
# Either way the woff2 lands in public/fonts/ and an @font-face block is appended
# to public/fonts.css, which common.css already imports. Then use it by name in
# CSS (e.g. set --font in common.css). Nothing is fetched from a third party —
# that's what the self-only CSP requires, and what keeps the app private and
# offline. See skills/add-font.md for the why and the full walkthrough.

set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
fonts_dir="$here/public/fonts"
fonts_css="$here/public/fonts.css"
mkdir -p "$fonts_dir"
[ -f "$fonts_css" ] || printf '/* Self-hosted @font-face rules. common.css imports this file. */\n' > "$fonts_css"

# Latin + Latin Extended — covers English and the western/central European
# languages. Widen this if you need Cyrillic, Greek, Vietnamese, etc.
RANGES="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF"

if [ $# -lt 1 ]; then
	echo "usage: ./add-font.sh <font-file.ttf|.otf | transfonter-kit.zip>" >&2
	exit 1
fi
input="$1"
[ -f "$input" ] || { echo "error: '$input' not found" >&2; exit 1; }

# Don't add the same file twice.
already() { grep -q "fonts/$1" "$fonts_css" 2>/dev/null; }

case "$input" in

	*.zip)
		# A Transfonter kit: copy its woff2 and reuse its stylesheet.css @font-face,
		# just repointing the url() at public/fonts/. No font tooling needed.
		command -v unzip >/dev/null || { echo "error: 'unzip' is required" >&2; exit 1; }
		tmp="$(mktemp -d)"
		trap 'rm -rf "$tmp"' EXIT
		unzip -q -o "$input" -d "$tmp"

		css="$(find "$tmp" -name 'stylesheet.css' | head -1)"
		[ -f "$css" ] || { echo "error: no stylesheet.css in the zip — is it a Transfonter kit?" >&2; exit 1; }

		count=0
		for woff2 in "$tmp"/*.woff2; do
			[ -e "$woff2" ] || continue
			base="$(basename "$woff2")"
			cp "$woff2" "$fonts_dir/$base"
			count=$((count + 1))
		done
		[ "$count" -gt 0 ] || { echo "error: no .woff2 files in the zip" >&2; exit 1; }

		# Append the kit's @font-face rules, repointing each url() into fonts/.
		{ echo ""; sed "s#url('#url('fonts/#g; s#url(\"#url(\"fonts/#g" "$css"; } >> "$fonts_css"
		echo "Added $count woff2 from the Transfonter kit and its @font-face rules to public/fonts.css."
		;;

	*.ttf | *.otf | *.woff2)
		# A raw font: subset to the ranges above and emit a woff2, keeping the
		# weight axis if it's a variable font. Then generate a matching @font-face.
		command -v python3 >/dev/null || { echo "error: python3 is required" >&2; exit 1; }
		python3 -c "import fontTools, brotli" 2>/dev/null || {
			echo "error: this needs fonttools + brotli. Install once with:" >&2
			echo "    pip install --user fonttools brotli" >&2
			exit 1
		}

		stem="$(basename "$input")"; stem="${stem%.*}"
		# A URL-friendly file name.
		slug="$(printf '%s' "$stem" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9' '-' | sed 's/^-*//; s/-*$//')"
		out="$slug.woff2"

		echo "Converting $stem → public/fonts/$out (subset, woff2)…"
		python3 -m fontTools.subset "$input" \
			--unicodes="$RANGES" --layout-features='*' \
			--flavor=woff2 --output-file="$fonts_dir/$out"

		if already "$out"; then
			echo "Note: $out is already referenced in public/fonts.css — skipping the @font-face."
		else
			# Read family, weight (range if variable), and style off the font.
			read -r family weight style < <(python3 - "$fonts_dir/$out" <<'PY'
import sys
from fontTools.ttLib import TTFont
f = TTFont(sys.argv[1])
name = f['name']
def n(i):
	r = name.getName(i,3,1,0x409) or name.getName(i,1,0,0)
	return str(r) if r else ''
family = n(16) or n(1) or 'Custom Font'
italic = bool(f['OS/2'].fsSelection & 0x01) or 'italic' in (n(2) or '').lower()
if 'fvar' in f and any(a.axisTag == 'wght' for a in f['fvar'].axes):
	a = next(a for a in f['fvar'].axes if a.axisTag == 'wght')
	weight = f"{int(a.minValue)}_{int(a.maxValue)}"          # a range
else:
	weight = str(f['OS/2'].usWeightClass)
print(family.replace(' ', '~'), weight, 'italic' if italic else 'normal')
PY
			)
			family="${family//\~/ }"
			weight="${weight/_/ }"       # "300_800" → "300 800"; single stays single
			{
				echo ""
				echo "@font-face {"
				echo "	font-family: '$family';"
				echo "	src: url('fonts/$out') format('woff2');"
				echo "	font-weight: $weight;"
				echo "	font-style: $style;"
				echo "	font-display: swap;"
				echo "}"
			} >> "$fonts_css"
			echo "Added @font-face for '$family' ($weight, $style) to public/fonts.css."
		fi
		;;

	*)
		echo "error: give a .ttf, .otf, .woff2, or a Transfonter .zip" >&2
		exit 1
		;;
esac

echo "Done. Reference the family in CSS (set --font in common.css to use it everywhere)."
