#!/usr/bin/env -S uv run --no-config --script
# /// script
# dependencies = ["gitignore-parser"]
# ///
"""Set up a worktree by copying or symlinking files from a root workspace."""

from __future__ import annotations

import argparse
import os
import shutil
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from gitignore_parser import parse_gitignore


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Copy or symlink files from a root workspace into the current directory."
    )
    parser.add_argument("root_path", type=Path, help="Root workspace path")
    parser.add_argument(
        "-s",
        "--symlink",
        action="append",
        default=[],
        metavar="PATTERN",
        help="Glob pattern for files to symlink (repeatable)",
    )
    parser.add_argument(
        "-c",
        "--copy",
        action="append",
        default=[],
        metavar="PATTERN",
        help="Glob pattern for files to copy (repeatable)",
    )
    return parser.parse_args()


def _canonicalize(p: Path) -> Path:
    """Canonicalize a path by resolving each symlink component via readlink."""
    result = Path(p.anchor)
    for part in p.relative_to(p.anchor).parts:
        if part == "..":
            result = result.parent
            continue
        if part == ".":
            continue
        candidate = result / part
        seen: set[Path] = set()
        while candidate.is_symlink():
            if candidate in seen:
                raise OSError(f"symlink cycle detected at {candidate}")
            seen.add(candidate)
            link = Path(os.readlink(candidate))
            candidate = link if link.is_absolute() else candidate.parent / link
        result = candidate
    return result


def _pattern_targets_dotgit(pattern: str) -> bool:
    stripped = pattern.lstrip("!").lstrip("/")
    return stripped == ".git" or stripped.startswith(".git/")


def _is_relative_to(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def _read_patterns(path: Path) -> list[str]:
    """Read gitignore-format patterns from a file, returning raw pattern lines."""
    patterns = []
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            patterns.append(stripped)
    return patterns


def _build_matcher(patterns: list[str], root: Path):
    """Build a gitignore-style matcher from a list of patterns."""
    if not patterns:
        return None
    with tempfile.NamedTemporaryFile(mode="w", suffix=".gitignore", delete=False) as f:
        for p in patterns:
            f.write(p + "\n")
        tmp_path = f.name
    try:
        return parse_gitignore(tmp_path, base_dir=str(root))
    finally:
        os.unlink(tmp_path)


def _lowest_common_ancestor(a: Path, b: Path) -> Path:
    """Return the deepest common ancestor directory of two absolute paths."""
    common: list[str] = []
    for pa, pb in zip(a.parts, b.parts):
        if pa == pb:
            common.append(pa)
        else:
            break
    return Path(*common) if common else Path("/")


def _readjust_symlink_target(link_target: Path, root: Path, cwd: Path) -> Path:
    """Decide whether a symlink target inside root should be readjusted for cwd.

    Returns the (possibly adjusted) target path.
    """
    if not _is_relative_to(cwd, root):
        return cwd / link_target.relative_to(root)
    lca = _lowest_common_ancestor(cwd, link_target)
    if lca == root:
        return cwd / link_target.relative_to(root)
    return link_target


def _dst_exists(dst: Path) -> bool:
    """Check if dst exists (includes broken symlinks)."""
    return dst.exists() or dst.is_symlink()


def copy_entry(src: Path, dst: Path, root: Path, cwd: Path) -> None:
    """Copy a file or directory from src to dst, handling symlink readjustment."""
    if src.is_symlink():
        if _dst_exists(dst):
            return

        raw_target = Path(os.readlink(src))

        if raw_target.is_absolute():
            link_target = _canonicalize(raw_target)
            if _is_relative_to(link_target, root):
                new_target = _readjust_symlink_target(link_target, root, cwd)
            else:
                new_target = link_target
        else:
            resolved = _canonicalize(src.parent / raw_target)
            if _is_relative_to(resolved, root):
                # Inside root: preserve the relative target unchanged
                new_target = raw_target
            else:
                # Outside root: convert to absolute
                new_target = resolved

        dst.parent.mkdir(parents=True, exist_ok=True)
        os.symlink(new_target, dst)
    elif src.is_dir():
        if dst.exists() and (not dst.is_dir() or any(dst.iterdir())):
            return
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst, symlinks=True, copy_function=shutil.copy2)
    else:
        if dst.exists() and (not dst.is_file() or dst.stat().st_size > 0):
            return
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)


def symlink_entry(src: Path, dst: Path) -> None:
    """Create an absolute symlink at dst pointing to src."""
    if _dst_exists(dst):
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    os.symlink(_canonicalize(src), dst)


def main() -> None:
    args = parse_args()
    root = _canonicalize(args.root_path.absolute())
    cwd = _canonicalize(Path.cwd())

    if not root.is_dir():
        print(f"error: root path is not a directory: {root}", file=sys.stderr)
        sys.exit(1)

    # Collect patterns: .worktreeinclude first, then CLI (CLI overrides)
    copy_patterns = []
    worktreeinclude = root / ".worktreeinclude"
    if worktreeinclude.is_file():
        copy_patterns.extend(_read_patterns(worktreeinclude))
    copy_patterns.extend(args.copy)
    symlink_patterns = list(args.symlink)

    if not copy_patterns and not symlink_patterns:
        print(
            "error: no patterns specified (use -c, -s, or .worktreeinclude)",
            file=sys.stderr,
        )
        sys.exit(1)

    # Build matchers
    copy_matcher = _build_matcher(copy_patterns, root)
    symlink_matcher = _build_matcher(symlink_patterns, root)
    copy_allows_dotgit = any(_pattern_targets_dotgit(p) for p in copy_patterns)
    symlink_allows_dotgit = any(_pattern_targets_dotgit(p) for p in symlink_patterns)
    any_allows_dotgit = copy_allows_dotgit or symlink_allows_dotgit

    # Determine cwd exclusion: only if cwd is inside root
    cwd_exclude = cwd if _is_relative_to(cwd, root) else None

    # Walk root and collect work items
    work: list[tuple[str, Path, Path]] = []
    seen_dsts: set[Path] = set()

    for dirpath, dirnames, filenames in os.walk(root):
        dp = Path(dirpath)

        # Skip root's .git unless any pattern allows it
        if dp == root and not any_allows_dotgit:
            try:
                dirnames.remove(".git")
            except ValueError:
                pass

        # cwd exclusion
        if cwd_exclude is not None:
            canon = _canonicalize(dp)
            if canon == cwd_exclude or _is_relative_to(canon, cwd_exclude):
                dirnames.clear()
                continue

        # Check subdirectories for whole-directory matches
        skip_dirs: set[str] = set()
        for dname in list(dirnames):
            src = dp / dname
            rel = src.relative_to(root)
            in_dotgit = bool(rel.parts) and rel.parts[0] == ".git"
            dst = cwd / rel

            if dst in seen_dsts:
                skip_dirs.add(dname)
                continue

            if copy_matcher and copy_matcher(str(src)):
                if not (in_dotgit and not copy_allows_dotgit):
                    seen_dsts.add(dst)
                    work.append(("copy", src, dst))
                    skip_dirs.add(dname)
                    continue

            if symlink_matcher and symlink_matcher(str(src)):
                if not (in_dotgit and not symlink_allows_dotgit):
                    seen_dsts.add(dst)
                    work.append(("symlink", src, dst))
                    skip_dirs.add(dname)

        dirnames[:] = [d for d in dirnames if d not in skip_dirs]

        # Check files (includes symlinks to files)
        for fname in filenames:
            src = dp / fname
            rel = src.relative_to(root)
            in_dotgit = bool(rel.parts) and rel.parts[0] == ".git"
            dst = cwd / rel

            if dst in seen_dsts:
                continue

            if copy_matcher and copy_matcher(str(src)):
                if not (in_dotgit and not copy_allows_dotgit):
                    seen_dsts.add(dst)
                    work.append(("copy", src, dst))
                    continue

            if symlink_matcher and symlink_matcher(str(src)):
                if not (in_dotgit and not symlink_allows_dotgit):
                    seen_dsts.add(dst)
                    work.append(("symlink", src, dst))

    if not work:
        print("warning: no files matched any pattern", file=sys.stderr)
        return

    errors: list[tuple[str, Path, Exception]] = []

    with ThreadPoolExecutor() as executor:
        futures = {}
        for action, src, dst in work:
            if action == "copy":
                fut = executor.submit(copy_entry, src, dst, root, cwd)
            else:
                fut = executor.submit(symlink_entry, src, dst)
            futures[fut] = (action, src)

        for fut in as_completed(futures):
            action, src = futures[fut]
            try:
                fut.result()
            except Exception as exc:
                errors.append((action, src, exc))

    if errors:
        for action, src, exc in errors:
            print(f"error: {action} {src}: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
