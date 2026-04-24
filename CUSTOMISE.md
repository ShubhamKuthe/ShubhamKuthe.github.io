# Customisation Guide

All edits are made inside `index.html`. Open it in VS Code or any text editor.

---

## 1. Personal Info

Search for these strings and replace them:

```
Jordan Dev       → Your Name
Jordan           → Your first name  
JD               → Your initials (avatar & logo)
J·D              → Your logo text (navbar)
hello@jordandev.io     → Your email
linkedin.com/in/jordandev  → Your LinkedIn
github.com/jordandev       → Your GitHub
```

---

## 2. Hero Section

Find the `<!-- HERO -->` comment block.

```html
<!-- Change the eyebrow text -->
Available for freelance work

<!-- Change headline -->
<h1 class="hero-name">Jordan<br><em>Dev.</em></h1>

<!-- Change subtitle -->
Full-Stack Developer & Creative Technologist
```

---

## 3. Colour Theme

Find `:root {` near the top of the `<style>` block:

```css
:root {
  --bg: #080808;           /* Page background */
  --accent: #c9a96e;       /* Gold accent — change to any colour */
  --accent2: #7c6fff;      /* Purple glow */
  --text: #f0ece4;         /* Main text colour */
  --muted: #6b6761;        /* Muted/secondary text */
}
```

Popular accent colours:
- Electric blue: `#4fc3f7`
- Emerald: `#4ade80`  
- Rose: `#fb7185`
- Violet: `#a78bfa`

---

## 4. About Section

Find `<!-- ABOUT -->` and update:
- The paragraph text inside `.about-text`
- Years of experience in `.about-badge` (currently `5+`)
- The skills in `.skills-grid`

---

## 5. Projects

Each project card looks like this — duplicate or edit as needed:

```html
<div class="project-card">
  <!-- Change background gradient -->
  <div class="project-bg project-bg-1"></div>
  
  <div class="project-overlay">
    <div class="project-num">01 — Featured</div>
    <h3 class="project-title">Your Project Title</h3>
    <p class="project-desc">Short description of the project.</p>
    <div class="project-tags">
      <span class="project-tag">React</span>
      <span class="project-tag">Node</span>
    </div>
  </div>
</div>
```

To add a project image instead of the gradient background:
```css
.project-bg-1 {
  background-image: url('your-image.jpg');
  background-size: cover;
  background-position: center;
}
```

---

## 6. Stats / Numbers

Find `data-count` attributes:
```html
<span class="stat-number" data-count="48">0</span>  ← Projects
<span class="stat-number" data-count="32">0</span>  ← Clients
<span class="stat-number" data-count="5">0</span>   ← Years
<span class="stat-number" data-count="99">0</span>  ← Satisfaction %
```

---

## 7. Skills Marquee (ticker)

Find `marquee-track` and edit the `<span>` items:
```html
<div class="marquee-item"><span>React</span><div class="marquee-dot"></div></div>
```
Note: The list is duplicated (appears twice) — that's intentional for the infinite loop effect. Edit both halves.

---

## 8. Adding Your Photo

Replace the avatar placeholder with a real image.

Find `.about-avatar` and replace its contents:
```html
<div class="about-avatar">
  <!-- Replace this: -->
  <div class="avatar-initials">JD</div>
  
  <!-- With this: -->
  <img src="your-photo.jpg" alt="Your Name" style="width:100%;height:100%;object-fit:cover;">
</div>
```

---

## 9. Fonts

The portfolio uses Google Fonts. Find this line in `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond...
```
You can swap fonts at [fonts.google.com](https://fonts.google.com) and update the CSS variables:
```css
--ff-display: 'Cormorant Garamond', serif;  /* Headings */
--ff-sans: 'Syne', sans-serif;               /* Body */
--ff-mono: 'DM Mono', monospace;             /* Labels & tags */
```
