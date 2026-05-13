"""
Generate 4 cinematic beverage videos for La Fuente Supermarket Hero
using KIE AI (Bytedance V1 Pro Image-to-Video API).
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv


def log(msg: str):
    """Print with flush to ensure output appears in real time."""
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode(), flush=True)

# -- Load API key from .env (project root's parent) --
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

API_KEY = os.getenv("KIE_API_KEY", "").strip()
if not API_KEY:
    log("[ERROR] KIE_API_KEY not found in .env")
    sys.exit(1)

# -- Config --
BASE_URL = "https://api.kie.ai/api/v1/jobs"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "videos" / "bebidas"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

POLL_INTERVAL = 10  # seconds
TIMEOUT = 600       # 10 minutes max per video

# -- Beverages --
BEVERAGES = [
    {
        "name": "brugal-doble-reserva",
        "image_url": "https://raw.githubusercontent.com/dantegalansisa-sudo/lafuente/main/public/imagenes/brugal-doble-reserva.png",
        "prompt": (
            "Cinematic product showcase of a premium Dominican rum bottle, "
            "slow 360 degree rotation on a reflective dark surface, "
            "warm amber studio lighting with dramatic rim light, "
            "subtle golden particles floating in the air, "
            "ultra smooth slow motion, commercial advertisement quality, "
            "dark luxurious background with soft bokeh"
        ),
    },
    {
        "name": "johnnie-walker-black",
        "image_url": "https://raw.githubusercontent.com/dantegalansisa-sudo/lafuente/main/public/imagenes/johnnie-walker-black.png",
        "prompt": (
            "Cinematic product showcase of a premium Scotch whisky bottle, "
            "elegant slow rotation on a polished black marble surface, "
            "dramatic side lighting with golden highlights, "
            "wisps of subtle smoke drifting across the frame, "
            "ultra smooth slow motion, luxury commercial style, "
            "deep dark background with refined atmosphere"
        ),
    },
    {
        "name": "cerveza-presidente",
        "image_url": "https://raw.githubusercontent.com/dantegalansisa-sudo/lafuente/main/public/imagenes/cerveza-presidente.png",
        "prompt": (
            "Cinematic product showcase of a cold beer bottle, "
            "condensation droplets running down the glass, "
            "slow rotation on a wet reflective surface with ice nearby, "
            "fresh cool blue-white lighting, "
            "water droplets splashing in slow motion, "
            "refreshing summer commercial style, bright clean background"
        ),
    },
    {
        "name": "red-bull",
        "image_url": "https://raw.githubusercontent.com/dantegalansisa-sudo/lafuente/main/public/imagenes/red-bull.png",
        "prompt": (
            "Cinematic product showcase of an energy drink can, "
            "dynamic slow rotation with electric blue and silver lighting, "
            "energy sparks and subtle light streaks around the can, "
            "sleek modern reflective surface, "
            "ultra smooth slow motion, high energy commercial style, "
            "dark background with vibrant accent lights"
        ),
    },
]


def create_task(beverage: dict) -> str | None:
    """Submit an image-to-video task. Returns taskId or None."""
    payload = {
        "model": "bytedance/v1-pro-image-to-video",
        "input": {
            "prompt": beverage["prompt"],
            "image_url": beverage["image_url"],
            "resolution": "720p",
            "duration": 5,
            "camera_fixed": True,
            "seed": 42,
            "enable_safety_checker": False,
        },
    }

    try:
        resp = requests.post(f"{BASE_URL}/createTask", headers=HEADERS, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        if data.get("code") == 200 and data.get("data", {}).get("taskId"):
            task_id = data["data"]["taskId"]
            log(f"   >> Task created: {task_id}")
            return task_id
        else:
            log(f"   [FAIL] API error: {json.dumps(data, indent=2)}")
            return None
    except Exception as e:
        log(f"   [FAIL] Request failed: {e}")
        return None


def poll_task(task_id: str, name: str) -> str | None:
    """Poll until success/fail. Returns video URL or None."""
    start = time.time()
    last_status = ""

    while time.time() - start < TIMEOUT:
        try:
            resp = requests.get(
                f"{BASE_URL}/recordInfo",
                headers=HEADERS,
                params={"taskId": task_id},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            status = data.get("status", "unknown")

            if status != last_status:
                elapsed = int(time.time() - start)
                log(f"   ... [{name}] {status} ({elapsed}s)")
                last_status = status

            if status == "success":
                result_json = data.get("resultJson", "")
                if result_json:
                    result = json.loads(result_json)
                    urls = result.get("resultUrls", [])
                    if urls:
                        return urls[0]
                log(f"   [FAIL] [{name}] Success but no URL in response")
                return None

            if status == "fail":
                log(f"   [FAIL] [{name}] Task failed: {data.get('failReason', 'unknown')}")
                return None

        except Exception as e:
            log(f"   [WARN] [{name}] Poll error: {e}")

        time.sleep(POLL_INTERVAL)

    log(f"   [FAIL] [{name}] Timeout after {TIMEOUT}s")
    return None


def download_video(url: str, name: str) -> Path | None:
    """Download MP4 to output directory."""
    output_path = OUTPUT_DIR / f"{name}.mp4"
    try:
        log(f"   >> Downloading {name}.mp4 ...")
        resp = requests.get(url, stream=True, timeout=120)
        resp.raise_for_status()

        with open(output_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        size_mb = output_path.stat().st_size / (1024 * 1024)
        log(f"   [OK] {name}.mp4 ({size_mb:.1f} MB)")
        return output_path
    except Exception as e:
        log(f"   [FAIL] Download failed: {e}")
        return None


def process_beverage(beverage: dict) -> dict:
    """Full pipeline for one beverage: create > poll > download."""
    name = beverage["name"]
    log(f"\n{'='*50}")
    log(f">> Processing: {name}")
    log(f"{'='*50}")

    # Step 1: Create task
    task_id = create_task(beverage)
    if not task_id:
        return {"name": name, "success": False, "error": "Failed to create task"}

    # Step 2: Poll for completion
    video_url = poll_task(task_id, name)
    if not video_url:
        return {"name": name, "success": False, "error": "Generation failed or timed out"}

    # Step 3: Download
    output_path = download_video(video_url, name)
    if not output_path:
        return {"name": name, "success": False, "error": "Download failed"}

    return {"name": name, "success": True, "path": str(output_path)}


def main():
    log("=" * 60)
    log("LA FUENTE SUPERMARKET -- Video Generator")
    log(f"   Generating {len(BEVERAGES)} beverage videos via KIE AI")
    log(f"   Output: {OUTPUT_DIR}")
    log("=" * 60)

    results = []

    # Run all 4 in parallel
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(process_beverage, bev): bev["name"]
            for bev in BEVERAGES
        }
        for future in as_completed(futures):
            results.append(future.result())

    # Summary
    log("\n" + "=" * 60)
    log("RESUMEN FINAL")
    log("=" * 60)

    successes = [r for r in results if r["success"]]
    failures = [r for r in results if not r["success"]]

    for r in successes:
        log(f"   [OK] {r['name']} -> {r['path']}")

    for r in failures:
        log(f"   [FAIL] {r['name']} -> {r['error']}")

    log(f"\n   Total: {len(successes)}/{len(results)} exitosos")
    log("=" * 60)


if __name__ == "__main__":
    main()
