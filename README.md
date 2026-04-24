# Portfolio — Jordan Dev

A professional, fully animated single-page portfolio website.

## 🚀 Getting Started

This is a **zero-dependency** static HTML portfolio. No build step required.

### Option A — Open directly
Just double-click `index.html` to open it in your browser.

### Option B — Local server (recommended for best experience)
```bash
# Using Python
python3 -m http.server 3000

# Using Node.js
npx serve .

# Using VS Code
Install the "Live Server" extension and click "Go Live"
```
Then visit `http://localhost:3000`

---

## 📁 File Structure

```
portfolio-project/
├── index.html          ← Main file (all-in-one: HTML + CSS + JS)
├── README.md           ← This file
├── CUSTOMISE.md        ← Step-by-step personalisation guide
└── src/
    ├── sections/       ← Section reference snippets
    │   ├── Hero.html
    │   ├── About.html
    │   ├── Projects.html
    │   └── Contact.html
    ├── components/
    │   ├── Navbar.html
    │   └── ProjectCard.html
    └── styles/
        └── variables.css   ← All CSS variables / theme tokens
```

---

## ✏️ Quick Edits

Open `index.html` in any text editor (VS Code recommended) and search for:

| What to change | Search for |
|---|---|
| Your name | `Jordan` |
| Accent colour | `--accent: #c9a96e` |
| Email | `hello@jordandev.io` |
| Years experience | `5+` |
| Project titles | `project-title` |
| Skills list | `skills-grid` |

See `CUSTOMISE.md` for the full guide.
