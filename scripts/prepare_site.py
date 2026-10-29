"""Create a Pages artifact from the reviewed public-file allowlist only."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / '_site'
files = json.loads((ROOT / 'public-files.json').read_text())
assert len(files) == len(set(files)), 'Duplicate public path'
for name in files:
    path = Path(name)
    assert not path.is_absolute() and '..' not in path.parts, name
    assert name in {'.nojekyll', 'index.html', 'style.css', 'script.js'} or (
        path.parts[0] in {'assets', 'projects'} and path.suffix in {'.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.pdf'}
    ), f'Unexpected public path: {name}'
    assert not any((ROOT / Path(*path.parts[:i])).is_symlink() for i in range(1, len(path.parts)+1)), name
    assert (ROOT / path).is_file(), f'Missing: {name}'
assert not DEST.is_symlink(), 'Output must not be a symlink'
if DEST.exists():
    shutil.rmtree(DEST)  # Only the generated output directory, never source files.
DEST.mkdir()
for name in files:
    target = DEST / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / name, target)
print('Prepared _site/ with these public files:')
print('\n'.join(files))
