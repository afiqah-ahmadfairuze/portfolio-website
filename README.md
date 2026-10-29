# portfolio-website

## Website

A static personal portfolio with About, Written / Visual & Software / Data Portfolio groups, Experience, Awards, Skills and Contact, plus four project detail pages. Built with HTML, CSS, JavaScript and local image/SVG assets; no dependencies or backend required.

## Local preview and validation

```sh
python3 scripts/prepare_site.py
python3 scripts/validate_site.py
node --check script.js
python3 -m http.server 8000 --directory _site --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ and stop the server with Ctrl+C. Preparation replaces only generated `_site/`. Preview this allowlisted output rather than serving local reference documents.

## Updating content and images

Edit `index.html`, the pages in `projects/`, `style.css` and `script.js`. Keep public images in `assets/images/`, with meaningful alt text and their original aspect ratios. Add each new public file explicitly to `public-files.json`; merely adding it to a folder will not publish it.

Award image lists are in `index.html`. Project image lists appear both in the homepage card and its matching detail page. Keep numerical filename order. Each slide needs an explicit path, intrinsic image dimensions, descriptive alt text and unique ID; all except the first start with `hidden`. Update slide counts and matching dot buttons. Encode spaces as `%20` in HTML paths, but use original filenames in the public manifest. One photo uses a static preview without controls; an empty collection stays text-only or retains its existing project placeholder.

All galleries share one controller in `script.js`: five-second advancement, independent arrows/dots/swiping, pause on hover/focus/offscreen/hidden tab, timer restart after manual navigation and a keyboard-focus-only pause control. Reduced motion disables autoplay. Full images are displayed without cropping.

To add a project, copy an existing detail page, update its content/title/description and image list, retain `../style.css`, `../script.js` and the header/footer Portfolio return links, then add the page to the public manifest and link its homepage card. Do not add duplicate bottom return buttons. Keep unsupported claims and internal documents off public pages.

## Repository and deployment boundaries

`public-files.json` lists the exact website files copied into `_site/`. References, editor history, private checklists, generated output and local settings are excluded from version control and deployment. Do not add confidential documents or research data. Written and research cards provide general descriptions only; K-Youth writing samples are intentionally not displayed. No public résumé download is currently included.

`.gitignore` does not remove already tracked files: inspect `git ls-files` and the staged diff before commits. Preserve local originals outside the public manifest. The current source has `index.html` at the repository root; all page/image paths are relative and support the `/portfolio-website/` subpath.

## Publishing later

Deployment is not enabled by this commit. The supplied `.github/workflows/pages.yml` is manual-only (`workflow_dispatch`) and never deploys on push. After a separate publishing decision, choose **Settings → Pages → Source: GitHub Actions**, then run **Actions → Deploy reviewed portfolio to Pages → Run workflow** on `main`. The workflow builds and validates only `_site/` before deployment. Do not select root-directory branch publishing for a workspace containing private local references.

## Verification limits

Static checks validate the exact output inventory, paths, fragments, metadata, headings, alt attributes and ARIA references. Browser rendering and real keyboard/touch interaction still need review at approximately 375, 768 and 1440px, including reduced motion, zoom and console/network errors. Test the final GitHub Pages project URL after a future deployment.
