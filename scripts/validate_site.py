"""Validate the exact deploy artifact without external dependencies or a browser."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / '_site'
class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.labels, self.headings = [], [], [], []
        self.title, self.description, self.favicon, self.main = 0, 0, 0, 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        for key in ('href', 'src'):
            if key in a: self.refs.append(a[key])
        for key in ('aria-labelledby', 'aria-describedby', 'aria-controls'):
            self.labels.extend(a.get(key, '').split())
        if re.fullmatch(r'h[1-6]', tag): self.headings.append(int(tag[1]))
        if tag == 'title': self.title += 1
        if tag == 'main': self.main += 1
        if tag == 'meta' and a.get('name') == 'description':
            assert a.get('content', '').strip(), 'Empty description'
            self.description += 1
        if tag == 'link' and a.get('rel') == 'icon': self.favicon += 1
        if tag == 'img':
            assert 'alt' in a, 'Missing image alt attribute'  # Empty alt is valid beside a naming label.
            assert int(a['width']) > 0 and int(a['height']) > 0
        assert tag not in {'audio', 'iframe', 'form'}, f'Unexpected element: {tag}'
        assert not ('aria-hidden' in a and ('tabindex' in a or tag in {'button', 'a'})), 'Focusable decoration'

expected = set(json.loads((ROOT / 'public-files.json').read_text()))
actual = {str(p.relative_to(SITE)) for p in SITE.rglob('*') if p.is_file()}
assert actual == expected, f'Artifact mismatch: {actual ^ expected}'
pages = {}
for path in SITE.rglob('*.html'):
    text = path.read_text()
    assert not re.search(r'references/|\.history/|CHECKLIST|tel:|\+60|011-1621', text), path
    page = Page(); page.feed(text)
    # HTML's inline SVG has its own title, so count the head title separately.
    assert len(re.findall(r'<head>.*?<title>[^<]+</title>.*?</head>', text, re.S)) == 1, path
    assert page.description == page.favicon == page.main == 1, path
    assert len(page.ids) == len(set(page.ids)), path
    assert all(label in page.ids for label in page.labels), path
    assert page.headings[0] == 1 and page.headings.count(1) == 1, path
    assert all(b <= a + 1 for a, b in zip(page.headings, page.headings[1:])), path
    pages[path.resolve()] = page
external = set()
for path, page in pages.items():
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme:
            assert url.scheme in {'https', 'mailto'}, ref
            external.add(ref); continue
        assert not url.netloc and not url.path.startswith('/'), ref
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        assert target.is_relative_to(SITE.resolve()) and target.is_file(), (path, ref)
        if url.fragment: assert url.fragment in pages[target].ids, (path, ref)
assert external == {
    'mailto:afiqahahmfairuze@gmail.com',
    'https://www.linkedin.com/in/afqhfrze/',
    'https://github.com/afiqah-ahmadfairuze',
    'https://github.com/afiqah-ahmadfairuze/tgkdsn',
    'https://github.com/afiqah-ahmadfairuze/campsite',
    'https://github.com/afiqah-ahmadfairuze/portfolio-website',
}, external
for name in expected:
    assert (SITE / name).read_bytes() == (ROOT / name).read_bytes(), name
print(f'PASS: exact {len(expected)}-file artifact; {len(pages)} HTML pages; all relative links, anchors and assets exist.')
print('PASS: titles, descriptions, favicons, heading levels, alt text, ARIA targets and public-file checks.')
print('Contact URLs match the reference document; network availability and mailbox delivery are not tested.')
