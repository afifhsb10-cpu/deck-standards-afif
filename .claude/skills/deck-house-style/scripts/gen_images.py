"""Generate image variants with NVIDIA FLUX klein.

Usage:
  python gen_images.py jobs.json OUT_DIR [--n 3] [--only name1,name2] [--start 1]

jobs.json:
  {"style": "<suffix appended to every prompt>",
   "jobs": {"cover": {"size": [1024, 1024], "prompt": "..."}, ...}}

Writes OUT_DIR/<name>_<i>.jpg. In Claude Code cloud sessions the proxy injects the
credential for ai.api.nvidia.com; elsewhere set NVIDIA_API_KEY.
"""
import argparse, base64, concurrent.futures as cf, json, os, urllib.request

URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux-3-image-klein"


def call(prompt, w, h, steps=28, tries=3):
    body = json.dumps({"prompt": prompt, "width": w, "height": h, "steps": steps}).encode()
    key = os.environ.get("NVIDIA_API_KEY", "proxy-injected")
    last = None
    for _ in range(tries):
        req = urllib.request.Request(URL, data=body, method="POST", headers={
            "Authorization": f"Bearer {key}", "Content-Type": "application/json", "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                a = json.load(r)["artifacts"][0]
            img = base64.b64decode(a.get("base64", ""))
            if len(img) < 1000:
                return None, a.get("finishReason", "EMPTY")
            return img, "ok"
        except Exception as e:  # network / 5xx: retry
            last = str(e)
    return None, f"FAIL {last}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("jobs"); ap.add_argument("out")
    ap.add_argument("--n", type=int, default=3); ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--only", default=""); ap.add_argument("--steps", type=int, default=28)
    a = ap.parse_args()
    spec = json.load(open(a.jobs)); style = spec.get("style", "")
    names = [n for n in spec["jobs"] if not a.only or n in a.only.split(",")]
    os.makedirs(a.out, exist_ok=True)

    def run(t):
        name, i = t; j = spec["jobs"][name]; w, h = j["size"]
        img, status = call(j["prompt"] + style, w, h, a.steps)
        if img:
            open(os.path.join(a.out, f"{name}_{i}.jpg"), "wb").write(img)
        return f"{name}_{i} {status}"

    with cf.ThreadPoolExecutor(5) as ex:
        for line in ex.map(run, [(n, i) for n in names for i in range(a.start, a.start + a.n)]):
            print(line)


if __name__ == "__main__":
    main()
