"""Checks PowerPoint cares about that LibreOffice and XSD validation miss.

Usage: python check_pptx.py deck.pptx
Exit code 1 on any error.
  - negative <a:ext>/<a:off> (e.g. a line drawn right-to-left) -> PowerPoint "repair" prompt
  - leftover placeholder text ([ISI ...], lorem, TODO, xxx)   -> warning, list them
  - slides without speaker notes                              -> warning
"""
import re, sys, zipfile

def main(path):
    z = zipfile.ZipFile(path); errors = warnings = 0
    slides = sorted((n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
                    key=lambda n: int(re.findall(r"\d+", n)[-1]))
    for n in z.namelist():
        if not n.endswith(".xml"): continue
        x = z.read(n).decode("utf8", "ignore")
        for m in re.finditer(r'<a:(ext|off) [^>]*?(cx|cy|x|y)="-\d+"', x):
            print(f"ERROR {n}: negative {m.group(1)} ({m.group(0)[:60]}...) -> normalise and use flipH/flipV")
            errors += 1
    notes = {n for n in z.namelist() if n.startswith("ppt/notesSlides/")}
    for n in slides:
        x = z.read(n).decode("utf8", "ignore")
        text = " ".join(re.findall(r"<a:t>([^<]*)</a:t>", x))
        for m in re.findall(r"\[(?:ISI|NAMA|UNIT|TANGGAL|INSERT|TODO)[^\]]*\]|lorem|ipsum|\bTODO\b|\bxxx+\b", text, re.I):
            print(f"WARN  {n}: placeholder '{m}'"); warnings += 1
        rels = z.read(n.replace("slides/", "slides/_rels/") + ".rels").decode()
        if "notesSlide" not in rels:
            print(f"WARN  {n}: no speaker notes"); warnings += 1
    print(f"{len(slides)} slides, {errors} error(s), {warnings} warning(s)")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
