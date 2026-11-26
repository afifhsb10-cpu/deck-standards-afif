"""Inject PowerPoint click animations into a built .pptx (pptxgenjs cannot write <p:timing>).

Usage: python add_animation.py deck.pptx spec.json [-o out.pptx]

spec.json:
{
  "slides": {
    "1": [                                  # one list entry per click
      {"effects": [
        {"target": "seg-1", "type": "wipe", "dir": "left", "delay": 0,   "dur": 600},
        {"target": "plane", "type": "path", "path": "M 0 0 L 0.18 0 E", "delay": 0, "dur": 600},
        {"target": "plane", "type": "spin", "by": 90, "delay": 600, "dur": 250},
        {"target": "wp-1",  "type": "fade", "delay": 600, "dur": 300},
        {"target": "plane", "type": "fadeOut", "delay": 0, "dur": 300}
      ]}
    ]
  }
}
- target = the shape's name (pptxgenjs `objectName`), must be unique on the slide.
- wipe dir: left | right | up | down  (= the edge the wipe starts from).
- path: PowerPoint motion path, coordinates as fractions of slide width/height, relative to
  the shape's ORIGINAL position (write every segment from the origin, not from the last stop).
  Optional "accel"/"decel" (0-1) for path; default 0 so wipes and motion stay in sync.
- The first effect of a click starts on the click; the rest run with it, offset by "delay" (ms).
"""
import argparse, json, re, shutil, tempfile, zipfile, os
from xml.sax.saxutils import quoteattr

WIPE = {"left": (8, "wipe(left)"), "right": (2, "wipe(right)"), "up": (1, "wipe(up)"), "down": (4, "wipe(down)")}


class Ids:
    def __init__(self): self.n = 2
    def __call__(self): self.n += 1; return self.n


def tgt(spid): return f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'


def set_vis(i, spid, val, delay=0):
    return (f'<p:set><p:cBhvr><p:cTn id="{i()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="{delay}"/></p:stCondLst></p:cTn>'
            f'{tgt(spid)}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:to><p:strVal val="{val}"/></p:to></p:set>')


def effect(e, spid, i, node):
    t, d, dur = e["type"], int(e.get("delay", 0)), int(e.get("dur", 500))
    head = lambda pid, cls, sub, grp, extra="": (
        f'<p:par><p:cTn id="{i()}" presetID="{pid}" presetClass="{cls}" presetSubtype="{sub}" {extra}fill="hold" grpId="{grp}" nodeType="{node}">'
        f'<p:stCondLst><p:cond delay="{d}"/></p:stCondLst><p:childTnLst>')
    tail = '</p:childTnLst></p:cTn></p:par>'
    if t in ("fade", "wipe"):
        sub, filt = (0, "fade") if t == "fade" else WIPE[e.get("dir", "left")]
        pid = 10 if t == "fade" else 22
        return (head(pid, "entr", sub, 0) + set_vis(i, spid, "visible") +
                f'<p:animEffect transition="in" filter="{filt}"><p:cBhvr><p:cTn id="{i()}" dur="{dur}"/>{tgt(spid)}</p:cBhvr></p:animEffect>' + tail)
    if t == "fadeOut":
        return (head(10, "exit", 0, 1) +
                f'<p:animEffect transition="out" filter="fade"><p:cBhvr><p:cTn id="{i()}" dur="{dur}"/>{tgt(spid)}</p:cBhvr></p:animEffect>'
                + set_vis(i, spid, "hidden", max(dur - 1, 0)) + tail)
    if t == "path":
        acc, dec = int(e.get("accel", 0) * 100000), int(e.get("decel", 0) * 100000)
        extra = (f'accel="{acc}" ' if acc else "") + (f'decel="{dec}" ' if dec else "")
        return (head(0, "path", 0, 0, extra) +
                f'<p:animMotion origin="layout" path={quoteattr(e["path"])} pathEditMode="relative">'
                f'<p:cBhvr><p:cTn id="{i()}" dur="{dur}" fill="hold"/>{tgt(spid)}'
                f'<p:attrNameLst><p:attrName>ppt_x</p:attrName><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr></p:animMotion>' + tail)
    if t == "spin":
        return (head(8, "emph", 0, 0) +
                f'<p:animRot by="{int(e["by"] * 60000)}"><p:cBhvr><p:cTn id="{i()}" dur="{dur}" fill="hold"/>{tgt(spid)}'
                f'<p:attrNameLst><p:attrName>r</p:attrName></p:attrNameLst></p:cBhvr></p:animRot>' + tail)
    raise ValueError(f"unknown effect type {t}")


def timing_xml(clicks, names, kinds):
    i = Ids(); pars = []
    for c in clicks:
        effs = []
        for k, e in enumerate(c["effects"]):
            if e["target"] not in names: raise KeyError(f'shape "{e["target"]}" not found on slide')
            effs.append(effect(e, names[e["target"]], i, "clickEffect" if k == 0 else "withEffect"))
        outer, inner = i(), i()
        pars.append(f'<p:par><p:cTn id="{outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
                    f'<p:par><p:cTn id="{inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                    + "".join(effs) + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
    built = sorted({names[e["target"]] for c in clicks for e in c["effects"] if e["type"] in ("fade", "wipe")})
    bg = {"txt": "", "shape": ' animBg="1"'}
    bld = "".join(f'<p:bldP spid="{s}" grpId="0"{bg[kinds[s]]}/>' for s in built if kinds[s] != "pic")
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
            '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
            + "".join(pars) +
            '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
            '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
            '</p:childTnLst></p:cTn></p:par></p:tnLst>' + (f'<p:bldLst>{bld}</p:bldLst>' if bld else '') + '</p:timing>')


def shape_index(xml):
    names, kinds = {}, {}
    for m in re.finditer(r'<p:(sp|pic|cxnSp)>.*?</p:\1>', xml, re.S):
        block = m.group(0); c = re.search(r'<p:cNvPr id="(\d+)" name="([^"]*)"', block)
        if not c: continue
        spid, name = c.group(1), c.group(2)
        if name in names: raise ValueError(f'duplicate shape name "{name}"')
        names[name] = spid
        kinds[spid] = "pic" if m.group(1) == "pic" else ("txt" if 'txBox="1"' in block else "shape")
    return names, kinds


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("pptx"); ap.add_argument("spec"); ap.add_argument("-o")
    a = ap.parse_args(); spec = json.load(open(a.spec)); out = a.o or a.pptx
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(a.pptx) as z: z.extractall(tmp); order = z.namelist()
    for num, clicks in spec["slides"].items():
        p = os.path.join(tmp, f"ppt/slides/slide{num}.xml"); x = open(p, encoding="utf8").read()
        x = re.sub(r'<p:timing>.*?</p:timing>', '', x, flags=re.S)
        names, kinds = shape_index(x); t = timing_xml(clicks, names, kinds)
        # <p:timing> goes after cSld / clrMapOvr / transition and before extLst
        anchors = [mm.end() for mm in re.finditer(r'</p:cSld>|</p:clrMapOvr>|</p:transition>', x)]
        pos = max(anchors); x = x[:pos] + t + x[pos:]
        open(p, "w", encoding="utf8").write(x)
        print(f"slide {num}: {len(clicks)} clicks, {sum(len(c['effects']) for c in clicks)} effects")
    tmp_out = out + ".tmp"
    with zipfile.ZipFile(tmp_out, "w", zipfile.ZIP_DEFLATED) as z:
        for n in order: z.write(os.path.join(tmp, n), n)
    shutil.move(tmp_out, out); shutil.rmtree(tmp)


if __name__ == "__main__":
    main()
