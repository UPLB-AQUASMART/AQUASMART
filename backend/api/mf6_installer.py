"""Download a platform-correct MODFLOW 6 binary without the GitHub REST API.

flopy's get_modflow queries api.github.com, which is rate limited (60 req/hour
per IP) and fails on shared hosts like Render. Direct release-asset URLs on
github.com are not subject to that API limit.
"""

from __future__ import annotations

import os
import platform
import shutil
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

MF6_VERSION = os.getenv("MF6_VERSION", "6.7.0")
_RELEASE_BASE = "https://github.com/MODFLOW-ORG/modflow6/releases/download"


def platform_tag() -> str:
    system = sys.platform
    machine = platform.machine().lower()
    if system.startswith("linux"):
        return "linux"
    if system == "darwin":
        return "macarm" if machine in {"arm64", "aarch64"} else "mac"
    if system.startswith("win"):
        return "win64"
    raise RuntimeError(f"Unsupported platform for MODFLOW 6: {system}/{machine}")


def platform_bin_dir(backend_dir: Path) -> Path:
    """Per-platform install dir, so a Linux binary never clobbers the macOS one."""
    return backend_dir / "bin" / platform_tag()


def download_url(version: str = MF6_VERSION) -> str:
    override = os.getenv("MF6_DOWNLOAD_URL")
    if override:
        return override
    return f"{_RELEASE_BASE}/{version}/mf{version}_{platform_tag()}.zip"


def install_mf6(target_dir: Path, timeout: int = 180) -> Path:
    """Download and extract mf6 (plus shared libs) into target_dir; return mf6 path."""
    url = download_url()
    request = urllib.request.Request(url, headers={"User-Agent": "aquasmart-mf6-installer"})
    token = os.getenv("GITHUB_TOKEN")
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    exe_name = "mf6.exe" if platform_tag() == "win64" else "mf6"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / exe_name
    # Stream to disk: the release zip is ~130 MB, too large to hold in memory on small hosts.
    with tempfile.TemporaryFile() as buffer:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            shutil.copyfileobj(response, buffer, length=1024 * 1024)
        buffer.seek(0)
        with zipfile.ZipFile(buffer) as archive:
            member = next(
                (m for m in archive.infolist() if not m.is_dir() and Path(m.filename).name == exe_name),
                None,
            )
            if member is None:
                raise RuntimeError(f"{exe_name} not found in {url}")
            partial = target.with_suffix(".partial")
            with archive.open(member) as source, open(partial, "wb") as destination:
                shutil.copyfileobj(source, destination, length=1024 * 1024)
            partial.chmod(0o755)
            partial.replace(target)
    return target


if __name__ == "__main__":
    backend = Path(__file__).resolve().parents[1]
    destination = Path(sys.argv[1]) if len(sys.argv) > 1 else platform_bin_dir(backend)
    print(f"Downloading {download_url()} -> {destination}")
    print(f"Installed {install_mf6(destination)}")
