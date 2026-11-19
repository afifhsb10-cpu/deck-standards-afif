#!/usr/bin/env bash
# Make LibreOffice-based QA renders honest for heavy display type.
# Arial Black is not available in Linux containers; LibreOffice silently falls back to a
# thin, narrow sans, so overflow looks fine in QA and breaks in PowerPoint.
# Archivo Black (OFL) has a similar weight/width and is aliased in its place.
set -euo pipefail
mkdir -p "$HOME/.fonts" "$HOME/.config/fontconfig"
if [ ! -f "$HOME/.fonts/ArchivoBlack-Regular.ttf" ]; then
  curl -sSfL -m 60 -o "$HOME/.fonts/ArchivoBlack-Regular.ttf" \
    https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/ArchivoBlack-Regular.ttf
fi
cat > "$HOME/.config/fontconfig/fonts.conf" <<'EOF'
<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>~/.fonts</dir>
  <alias binding="same"><family>Arial Black</family><prefer><family>Archivo Black</family></prefer></alias>
</fontconfig>
EOF
fc-cache -f >/dev/null
echo "Arial Black -> $(fc-match 'Arial Black')"
