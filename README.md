# RESCUE Showcase Website

This repository contains the static showcase website for the **RESCUE - Resilience and Cyber Security of Integrated Cyber-Physical Energy Systems** project.

The site is a single-page static HTML app (no build system or framework) that you can host with any static web server (GitHub Pages, nginx, Apache, etc.).

---

## 🚀 Quick Start

1. Clone or download this repository.
2. Open `index.html` directly in your browser  
   **or** serve it from a simple static server (for example with Python):

   ```bash
   python -m http.server 8000
   ```

3. Navigate to `http://localhost:8000` in your browser.

---

## 📁 Project Structure

The core files:

```text
.
├── index.html                  # Main single-page site
├── img/                        # Images (logo, team photos, partners)
│   ├── RESCUE_logo_...         # Logos used in header/footer
│   ├── partners_logo/          # Partner logos
│   └── team/                   # Team photos
└── publications/
    ├── publications.json       # Metadata for all publications
    ├── WP2/                    # Work Package folders
    │   ├── pub_21.txt          # Text metadata (title, abstract, etc.)
    │   └── pub_21_ga.svg       # Graphical abstract (for carousel/modal)
    ├── WP4/
    └── WP5/
```

All logic is inside `<script>` tags at the bottom of `index.html`:
- building the Publications section
- showing the modal for each publication
- powering the feature card carousels
- small UI effects (menu, animations, etc.)

---


## 📚 Publications System

Publications are controlled via **JSON + text files**, and automatically:

- populate the **“Publications” accordion** section
- fill the **publication modal** (title, abstract, links, authors)
- feed the **highlight carousels** (for selected / featured publications)

### 1. `publications.json` structure

`publications/publications.json` looks like this (simplified):

```json
{
  "workPackages": [
    {
      "id": "WP2",
      "title": "Digital twin of integrated cyber-physical energy system",
      "folder": "WP2",
      "publications": [
        {
          "file": "pub_21.txt",
          "ga": "pub_21_ga.svg",
          "label": "Power System Stability Analysis From Cyber Attacks Perspective",
          "authors": "Semertzis I, Ştefanov A, ...",
          "doi": "10.1109/ACCESS.2024.3443061",
          "doiUrl": "https://ieeexplore.ieee.org/document/10634523",
          "repo": "https://ieeexplore.ieee.org/document/10634523",
          "source": "https://ieeexplore.ieee.org/document/10634523",
          "scholar": "https://scholar.google.com/...",
          "featured": true
        }
      ]
    }
  ]
}
```

**Fields:**

- `id` – identifier (e.g. `"WP2"`)
- `title` – human-readable title for the WP (used in the accordion)
- `folder` – must match the directory under `publications/` and the `data-wp-folder` attribute in the HTML sections
- `publications` – list of publication objects:

Each publication object:

- `file` – name of the `.txt` file with more detailed metadata (see below)
- `ga` – (optional) filename of the graphical abstract (e.g. `.svg`), used in the carousel + modal
- `label` – short title shown in the Publications list
- `authors`, `doi`, `doiUrl`, `repo`, `source`, `scholar` – extra metadata for the modal buttons
- `featured` – **`true` or `false`**  
  - `true` → used in the **highlight carousels** and in the **“Explore”** modal cycle for that section  
  - `false`/missing → still appears in the Publications list, but not in the highlight carousel

### 2. The `.txt` metadata files

For each publication, there is a text file like `publications/WP2/pub_21.txt` that can provide richer metadata. For example:

```text
Title: Power System Stability Analysis From Cyber Attacks Perspective
Authors: Semertzis I, Ştefanov A, Presekal A, Kruimer B, Torres JL, Palensky P.
Abstract: This paper studies...
Repo: https://ieeexplore.ieee.org/document/10634523
Source: https://ieeexplore.ieee.org/document/10634523
DOI: 10.1109/ACCESS.2024.3443061
DOI URL: https://ieeexplore.ieee.org/document/10634523
```

The script parses these lines and uses them to fill in the **modal content**.  
Fields in the `.txt` file override or complement values coming from `publications.json`.

### 3. Adding a new publication

1. **Add a `.txt` file** under the correct WP folder, for example:

   ```text
   publications/WP2/pub_22.txt
   ```

2. **Optional:** add a graphical abstract image (e.g. SVG, PNG):

   ```text
   publications/WP2/pub_22_ga.svg
   ```

3. **Update `publications.json`:**

   ```json
   {
     "file": "pub_22.txt",
     "ga": "pub_22_ga.svg",
     "label": "New RESCUE Publication",
     "authors": "Author A, Author B",
     "doi": "10.1234/example",
     "doiUrl": "https://doi.org/10.1234/example",
     "repo": "https://example.com/repo",
     "source": "https://example.com/paper",
     "scholar": "https://scholar.google.com/...",
     "featured": true
   }
   ```

4. **(Optional) Make it part of a highlight section:**

   - Ensure that the publication’s `workPackages[n].folder` value (e.g. `"WP2"`) matches:
     - the folder name under `publications/` (e.g. `publications/WP2/`)
     - the `data-wp-folder="WP2"` attribute of the feature section in `index.html`

   - If `"featured": true`, its graphical abstract will appear in the WP’s **carousel**, and the WP’s **“Explore”** button will cycle through all featured publications of that WP in the modal.

> ❗ **Important:**  
> - Folder name (`folder` in JSON, WP directory, and `data-wp-folder` in HTML) must match exactly.  
> - Only publications with a `ga` image will appear inside the card carousels.

---

## 🧾 Acknowledgements / License

The content, logos, and branding belong to the RESCUE project and partners.  
You can add your preferred license and attribution text here.
