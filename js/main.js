/* =========================================================
   Shubham Kuthe — portfolio interactions
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const hasGSAP = typeof window.gsap !== "undefined";

  if (!hasGSAP) { document.body.classList.remove("is-loading"); $(".loader")?.classList.add("is-done"); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { duration: 1.6 });
    }));
  }

  /* ---------- preloader: the site "builds" itself ---------- */
  const LOG = [
    ["cmd", "$ flutter build web --release"],
    ["", "  Compiling lib/main.dart for the Web..."],
    ["cmd", "$ dotnet build Portfolio.sln -c Release"],
    ["", "  Restored 3 projects. 0 warnings, 0 errors."],
    ["cmd", "$ git push origin main"],
    ["ok", "✓ shubhamkuthe.github.io is live"],
  ];

  function runLoader() {
    return new Promise((resolve) => {
      const log = $(".loader__log");
      const bar = $(".loader__bar span");
      if (reduce) { resolve(); return; }
      let html = "";
      const tl = gsap.timeline({ onComplete: resolve });
      LOG.forEach(([cls, text], i) => {
        const isCmd = cls === "cmd";
        const obj = { n: 0 };
        tl.to(obj, {
          n: text.length,
          duration: isCmd ? text.length * 0.018 : 0.05,
          ease: "none",
          onUpdate() {
            const part = text.slice(0, Math.round(obj.n));
            log.innerHTML = html + `<span class="${cls}">${part}</span><span class="caret"></span>`;
          },
          onComplete() { html += `<span class="${cls}">${text}</span>\n`; },
        }, i === 0 ? 0.2 : "+=0.08");
        tl.to(bar, { scaleX: (i + 1) / LOG.length, duration: 0.25, ease: "power2.out" }, "<");
      });
      tl.to({}, { duration: 0.35 });
    });
  }

  function openLoader() {
    const tl = gsap.timeline({
      onComplete() { $(".loader").classList.add("is-done"); },
    });
    tl.to(".loader__term", { opacity: 0, y: -10, duration: 0.35, ease: "power2.in" })
      .to(".loader__half--top", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.05")
      .to(".loader__half--bottom", { yPercent: 100, duration: 1.1, ease: "expo.inOut" }, "<");
    return tl;
  }

  function heroIntro() {
    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete() {
        document.body.classList.remove("is-loading");
        lenis?.start();
        ScrollTrigger.refresh();
      },
    });
    tl.from(".figure__back", { scaleY: 0.006, scaleX: 0.6, duration: 1.3, ease: "expo.inOut" }, 0)
      .from(".figure__char", { y: 60, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.75)
      .from(".hero .reveal-line > span", { yPercent: 110, duration: 1.1, stagger: 0.07 }, 0.7)
      .from(".hero__marquee", { opacity: 0, duration: 1.6, ease: "power1.out" }, 0.6)
      .from(".topbar__links > *, .scroll-btn, .stats li", { opacity: 0, y: 12, duration: 0.9, stagger: 0.05 }, 0.9)
      .add(countStats, 1);
    return tl;
  }

  function countStats() {
    $$(".stat-num").forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 1.6, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
    });
  }

  (async () => {
    await (document.fonts?.ready ?? Promise.resolve());
    if (reduce) {
      $(".loader").classList.add("is-done");
      document.body.classList.remove("is-loading");
      $$(".stat-num").forEach((el) => (el.textContent = el.dataset.count));
      return;
    }
    await runLoader();
    const open = openLoader();
    open.add(heroIntro(), 0.35);
  })();

  /* ---------- background marquee (speeds up with scroll) ---------- */
  const track = $(".marquee__track");
  if (track && !reduce) {
    let x = 0, boost = 0;
    gsap.ticker.add((t, dt) => {
      const half = track.scrollWidth / 2;
      const v = lenis ? Math.abs(lenis.velocity) : 0;
      boost += (v * 0.6 - boost) * 0.08;
      x -= (0.035 + boost * 0.02) * dt;
      if (-x >= half) x += half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  }

  /* ---------- hero figure: depth parallax with the mouse ---------- */
  const tilt = $("[data-tilt]");
  if (tilt && finePointer && !reduce) {
    const q = (el, p) => gsap.quickTo(el, p, { duration: 1, ease: "power3" });
    const cx = q(tilt, "x"), cy = q(tilt, "y"), cr = q(tilt, "rotation");
    const back = $(".figure__back"), bx = q(back, "x"), by = q(back, "y");
    $(".hero").addEventListener("mousemove", (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      cx(nx * 12); cr(nx * 1.5);               // he moves most (closest)
      bx(nx * -8); by(ny * -5);                  // square drifts the other way
    });
    $(".hero").addEventListener("mouseleave", () => { cx(0); cy(0); cr(0); bx(0); by(0); });
  }

  /* ---------- custom cursor ---------- */
  const cursor = $(".cursor");
  if (cursor && finePointer) {
    document.body.classList.add("has-cursor");
    const label = $(".cursor__label");
    // follow the real mouse instantly (no easing = no lag)
    window.addEventListener("pointermove", (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      cursor.classList.add("is-on");
    }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    document.addEventListener("mouseover", (e) => {
      const big = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button");
      cursor.classList.toggle("is-big", !!big);
      cursor.classList.toggle("is-link", !big && !!link);
      if (big) label.textContent = big.dataset.cursor;
    });
  }

  /* ---------- magnetic elements ---------- */
  if (finePointer && !reduce) {
    $$(".magnetic").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, .4)" });
      const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, .4)" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.35);
        my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener("mouseleave", () => { mx(0); my(0); });
    });
  }

  /* ---------- LEGO bot ---------- */
  (() => {
    const bot = $(".bot"); if (!bot) return;
    const panel = $(".bot__panel"), log = $(".bot__log"), chips = $(".bot__chips"), tease = $(".bot__tease");
    const ICON = {
      ig: '<svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 2c-2.7 0-3 0-4.1.1C4 2.3 2.3 4 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1C2.3 20 4 21.7 7.9 21.9c1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.9-.2 5.6-1.9 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1C21.7 4 20 2.3 16.1 2.1 15 2 14.7 2 12 2Zm0 1.8c2.7 0 3 0 4 .1 2.8.1 4 1.4 4.1 4.1.1 1 .1 1.3.1 4s0 3-.1 4c-.1 2.7-1.4 4-4.1 4.1-1 .1-1.3.1-4 .1s-3 0-4-.1c-2.8-.1-4-1.4-4.1-4.1-.1-1-.1-1.3-.1-4s0-3 .1-4C3.9 5.3 5.2 4 7.9 3.9c1-.1 1.3-.1 4.1-.1Z"/></svg>',
      li: '<svg viewBox="0 0 24 24"><path d="M20.4 2H3.6C2.7 2 2 2.7 2 3.6v16.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6ZM8 19H5V9.5h3V19ZM6.5 8.2a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5ZM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S12.8 13 12.8 14.3V19h-3V9.5h2.8v1.3h.1c.4-.7 1.4-1.5 2.9-1.5 3.1 0 3.6 2 3.6 4.7V19Z"/></svg>',
      gh: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>',
      mail: '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.2-8 5-8-5V6l8 5 8-5v2.2Z"/></svg>',
    };
    const link = (href, icon, label, handle) =>
      `<a class="bot__link" href="${href}" target="_blank" rel="noopener">${ICON[icon]}${label}<small>${handle}</small></a>`;
    const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
    const scroll = () => (log.scrollTop = log.scrollHeight);
    let busy = false, started = false;

    async function say(html, cls = "") {
      const t = document.createElement("div");
      t.className = "bot__msg bot__typing"; t.innerHTML = "<i></i><i></i><i></i>";
      log.append(t); scroll();
      await wait(Math.min(1400, 450 + html.replace(/<[^>]+>/g, "").length * 14));
      t.remove();
      const m = document.createElement("div");
      m.className = "bot__msg " + cls; m.innerHTML = html;
      log.append(m); scroll();
      await wait(250);
    }
    function me(text) { const m = document.createElement("div"); m.className = "bot__msg bot__msg--me"; m.textContent = text; log.append(m); scroll(); }
    function ask(options) {
      chips.innerHTML = "";
      options.forEach(([label, fn]) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "bot__chip"; b.textContent = label;
        b.onclick = async () => { if (busy) return; busy = true; chips.innerHTML = ""; me(label); await fn(); busy = false; };
        chips.append(b);
      });
    }

    async function intro() {
      busy = true;
      await say("Hey, I'm LEGO Shubham. The real one is busy being a human.");
      await say("Want to connect with Shubham?");
      busy = false;
      ask([["Yeah, sure", connect], ["Just looking around", lurk]]);
    }
    async function lurk() {
      await say("Fair. Take your time, scroll around. I'll be right here, bobbing.");
      ask([["Okay, let's connect", connect]]);
    }
    async function connect() {
      await say("Nice. Follow him here:");
      await say(
        link("https://www.instagram.com/shubhamkuthe_/", "ig", "Instagram", "@shubhamkuthe_") +
        link("https://www.linkedin.com/in/shubham-kuthe-8a5530252/", "li", "LinkedIn", "shubham-kuthe") +
        link("https://github.com/ShubhamKuthe", "gh", "GitHub", "ShubhamKuthe"),
        "bot__msg--card"
      );
      await say("Want to contact him directly?");
      ask([["Yes, how?", contact], ["Maybe later", later]]);
    }
    async function later() {
      await say("No pressure. The email will still be here. So will I. I literally cannot leave this corner.");
      ask([["Fine, show me the email", contact], ["Start over", restart]]);
    }
    async function contact() {
      await say(link("mailto:shubhamkuthe113@gmail.com", "mail", "Email", "shubhamkuthe113@gmail.com"), "bot__msg--card");
      await say("Heads up: he checks his mail in the morning.");
      await wait(700);
      await say("By morning I mean midday. The man sleeps like it's a competitive sport, and he's training for the Olympics.");
      await say("But he does reply. Promise.");
      ask([["Haha, noted", restart]]);
    }
    async function restart() {
      await say("Anything else? I'm a LEGO figure, my options are limited.");
      ask([["Connect", connect], ["Contact", contact]]);
    }

    function open() {
      panel.hidden = false; bot.classList.add("is-open", "was-opened"); tease.hidden = true;
      if (!started) { started = true; intro(); }
    }
    function close() { panel.hidden = true; bot.classList.remove("is-open"); }
    $(".bot__btn").addEventListener("click", () => (panel.hidden ? open() : close()));
    $(".bot__close").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });
    // stop page smooth-scroll from hijacking the chat scroll
    panel.setAttribute("data-lenis-prevent", "");
    // one-time tease after a few seconds on the page
    setTimeout(() => { if (!started) { tease.hidden = false; setTimeout(() => (tease.hidden = true), 6000); } }, 9000);
    tease.addEventListener("click", open);
  })();

  if (reduce) { setStaticEndStates(); return; }

  /* ---------- MORPH: phone -> desktop -> phone ---------- */
  const device = $(".device");
  const stage = $(".morph__stage");
  const deskW = () => Math.min(780, stage.clientWidth * 0.96);
  const deskH = () => Math.min(480, deskW() * 0.62);
  const isNarrow = () => innerWidth < 640;

  const morph = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: { trigger: ".morph", start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true },
  });
  morph
    .to(device, { width: deskW, height: deskH, borderRadius: 14, padding: 0, duration: 1 }, 0.15)
    .to(".device__body", { borderRadius: 0, duration: 1 }, 0.15)
    .to(".device .device__bar", { height: 34, duration: 0.6 }, 0.45)
    .to(".device__phoneui", { opacity: 0, duration: 0.3 }, 0.25)
    .to(".device__deskui", { opacity: 1, duration: 0.4 }, 0.7)
    .fromTo(".dd-grid span", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, stagger: 0.02, duration: 0.3 }, 0.8)
    .to(".morph__h--a", { opacity: 0, y: -30, duration: 0.4 }, 0.3)
    .fromTo(".morph__h--b", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 0.55)
    .to({}, { duration: 0.5 })
    // and back to phone
    .to(".device__deskui", { opacity: 0, duration: 0.3 }, 1.75)
    .to(".device .device__bar", { height: 0, duration: 0.4 }, 1.75)
    .to(device, { width: () => (isNarrow() ? 220 : 270), height: () => (isNarrow() ? 450 : 550), borderRadius: 40, padding: 8, duration: 0.9 }, 1.8)
    .to(".device__body", { borderRadius: 32, duration: 0.9 }, 1.8)
    .to(".device__phoneui", { opacity: 1, duration: 0.3 }, 2.4);

  if (isNarrow()) gsap.set(device, { width: 220, height: 450 });

  /* ---------- scramble titles ---------- */
  const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFxz";
  function scramble(el) {
    const final = el.dataset.text;
    const o = { p: 0 };
    gsap.to(o, {
      p: 1, duration: 1.1, ease: "power2.out",
      onUpdate() {
        const n = Math.floor(o.p * final.length);
        let s = final.slice(0, n);
        for (let i = n; i < final.length; i++) s += final[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        el.textContent = s;
      },
      onComplete() { el.textContent = final; },
    });
  }
  $$(".scramble").forEach((el) => {
    ScrollTrigger.create({ trigger: el.closest(".scene"), start: "top 60%", onEnter: () => scramble(el), onEnterBack: () => scramble(el) });
  });

  /* ---------- MOMENTUM: habits tick as you scroll ---------- */
  const moItems = $$(".mo-list li");
  const moRing = $(".mo-ring");
  const moPct = $(".mo-pct");
  const moCount = $(".mo-count");
  const moStreak = $(".mo-streak-n");
  let moLast = -1;
  ScrollTrigger.create({
    trigger: ".scene--momentum", start: "top top", end: "bottom bottom",
    onUpdate(self) {
      const done = Math.min(5, Math.floor(clamp((self.progress - 0.08) / 0.8) * 6));
      if (done === moLast) return;
      moLast = done;
      moItems.forEach((li, i) => li.classList.toggle("done", i < done));
      gsap.to(moRing, { "--p": done / 5, duration: 0.6, ease: "power3.out" });
      moPct.textContent = `${done * 20}%`;
      moCount.textContent = `${done} of 5`;
      moStreak.textContent = done === 5 ? "12" : "11";
      if (done === 5) gsap.fromTo(".mo-streak", { scale: 1.25 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
    },
  });
  gsap.from(".scene--momentum .phone--lg", {
    y: 80, rotate: 4, opacity: 0, ease: "power3.out",
    scrollTrigger: { trigger: ".scene--momentum", start: "top 80%", end: "top top", scrub: 1 },
  });

  /* ---------- UK CENSUS: messy rows in, clean chart out ---------- */
  const csRows = $$(".cs-row:not(.cs-row--head)");
  const csSteps = $$(".cs-steps li");
  const csBars = $$(".cs-chart li");
  const csTotal = $(".cs-total");
  const csN = $(".cs-log-n"), csF = $(".cs-log-f"), csD = $(".cs-log-d");
  csRows.forEach((r) => r.querySelectorAll("span").forEach((sp) => (sp.dataset.raw = sp.textContent)));
  const nf = (v) => Math.round(v).toLocaleString("en-GB");
  let csStep = -1, csCharted = null;
  ScrollTrigger.create({
    trigger: ".scene--census", start: "top top", end: "bottom bottom",
    onUpdate(self) {
      const p = self.progress;
      // 1. load: rows arrive one by one
      const loaded = Math.round(clamp((p - 0.03) / 0.2) * csRows.length);
      // 2. clean: dirty rows get fixed, duplicate dropped
      const cleanT = clamp((p - 0.27) / 0.25);
      let fixed = 0, dropped = 0, cleanIdx = 0;
      const dirty = csRows.filter((r) => r.classList.contains("cs-row--dirty") || r.classList.contains("cs-row--dup"));
      csRows.forEach((r, i) => {
        r.classList.toggle("is-in", i < loaded);
        const di = dirty.indexOf(r);
        const done = di >= 0 && cleanT * dirty.length > di + 0.5;
        if (r.classList.contains("cs-row--dup")) { r.classList.toggle("is-dropped", done); if (done) dropped++; return; }
        if (di < 0) return;
        if (done !== r.classList.contains("is-clean")) {
          r.classList.toggle("is-clean", done);
          r.querySelectorAll("span").forEach((sp) => (sp.textContent = done ? sp.dataset.clean : sp.dataset.raw));
        }
        if (done) fixed++;
      });
      csN.textContent = loaded - dropped; csF.textContent = fixed; csD.textContent = dropped;
      // stepper
      const step = p < 0.03 ? 0 : p < 0.27 ? 1 : p < 0.54 ? 2 : p < 0.6 ? 3 : 4;
      if (step !== csStep) { csStep = step; csSteps.forEach((li, i) => li.classList.toggle("is-on", i < step)); }
      // 3. chart: bars grow, numbers count
      const chart = p > 0.58;
      if (chart !== csCharted) {
        csCharted = chart;
        gsap.to($$(".cs-bar i"), { scaleX: chart ? 1 : 0, duration: chart ? 1 : 0.4, stagger: chart ? 0.07 : 0, ease: "power3.out", overwrite: true });
        [...csBars.map((li) => li.querySelector("b")), csTotal].forEach((el, i) => {
          const o = { v: chart ? 0 : +el.dataset.to };
          gsap.to(o, { v: chart ? +el.dataset.to : 0, duration: chart ? 1.2 : 0.3, delay: chart ? i * 0.05 : 0, ease: "power3.out", overwrite: true, onUpdate: () => (el.textContent = nf(o.v)) });
        });
      }
    },
  });

  /* ---------- PULSEOPS: an incident's life, start to finish ---------- */
  const AI_TEXT = "Likely cause: DB connection pool exhausted after 14:02 deploy.\nSeverity: P1   Route to: Platform team";
  const AUDIT = [
    [0.10, "14:06 <b>incident.created</b> INC-2041"],
    [0.32, "14:06 <b>ai.triaged</b> P1, platform"],
    [0.46, "14:07 <b>incident.assigned</b> a.patel"],
    [0.66, "14:24 <b>incident.resolved</b> pool size 20 to 60"],
  ];
  const poSteps = $$(".po-steps li");
  const poAi = $(".po-ai__text");
  const poBar = $(".po-sla__bar i");
  const poTime = $(".po-sla__time");
  const poAudit = $(".po-audit");
  const poChip = $(".po-row--new .po-chip");
  const poTeam = $$(".po-row--team");
  const poRole = $(".po-role");
  const poRoleName = $(".po-role-name");
  const poNew = $(".po-row--new");
  let poAuditN = -1, poAiN = -1, poStepN = -1, poViewer = null;
  const fmt = (m) => `${String(Math.floor(m)).padStart(2, "0")}:${String(Math.floor((m % 1) * 60)).padStart(2, "0")}`;
  ScrollTrigger.create({
    trigger: ".scene--pulse", start: "top top", end: "bottom bottom",
    onUpdate(self) {
      const p = self.progress;
      // new incident slides in
      const inT = clamp((p - 0.02) / 0.08);
      poNew.style.opacity = inT; poNew.style.transform = `translateY(${(1 - inT) * -14}px)`;
      // AI triage types out
      const n = Math.round(clamp((p - 0.12) / 0.2) * AI_TEXT.length);
      if (n !== poAiN) { poAiN = n; poAi.textContent = AI_TEXT.slice(0, n) + (n > 0 && n < AI_TEXT.length ? "\u2588" : ""); }
      // status steps
      const step = p < 0.1 ? 0 : p < 0.32 ? 1 : p < 0.46 ? 2 : p < 0.66 ? 3 : 4;
      if (step !== poStepN) {
        poStepN = step;
        poSteps.forEach((li, i) => li.classList.toggle("is-on", i < step));
        poChip.textContent = ["New", "New", "Triaged", "Assigned", "Resolved"][step];
        poChip.classList.toggle("po-chip--done", step >= 2);
      }
      // SLA: 30 minute clock, resolved at 18 minutes
      const used = clamp((p - 0.1) / 0.56) * 18;
      poBar.style.transform = `scaleX(${used / 30})`;
      poTime.textContent = step === 4 ? "Resolved in 18m, inside SLA" : `${fmt(30 - used)} left`;
      // audit log
      const k = AUDIT.filter(([at]) => p >= at).length;
      if (k !== poAuditN) { poAuditN = k; poAudit.innerHTML = AUDIT.slice(0, k).map(([, t]) => `<li>${t}</li>`).join(""); }
      // switch role: Row-Level Security hides other teams' incidents
      const viewer = p > 0.78;
      if (viewer !== poViewer) {
        poViewer = viewer;
        poRole.classList.toggle("is-viewer", viewer);
        poRoleName.textContent = viewer ? "Support viewer" : "Engineer";
        poTeam.forEach((r, i) => setTimeout(() => r.classList.toggle("is-hidden", viewer), i * 120));
      }
    },
  });

  /* ---------- contact: one big reveal ---------- */
  gsap.from(".contact__line", {
    yPercent: 100, opacity: 0, duration: 1.2, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".contact", start: "top 65%" },
  });

  function setStaticEndStates() {
    $$(".mo-list li").forEach((li) => li.classList.add("done"));
    const r = $(".mo-ring"); if (r) r.style.setProperty("--p", 1);
    $(".mo-pct") && ($(".mo-pct").textContent = "100%");
    $(".mo-count") && ($(".mo-count").textContent = "5 of 5");
    $$(".cs-row").forEach((r) => { r.classList.add("is-in"); if (r.classList.contains("cs-row--dup")) r.classList.add("is-dropped"); });
    $$(".cs-row--dirty span").forEach((sp) => (sp.textContent = sp.dataset.clean));
    $$(".cs-row--dirty").forEach((r) => r.classList.add("is-clean"));
    $$(".cs-steps li").forEach((li) => li.classList.add("is-on"));
    $$(".cs-bar i").forEach((i) => (i.style.transform = "none"));
    $$(".cs-chart b, .cs-total").forEach((el) => (el.textContent = (+el.dataset.to).toLocaleString("en-GB")));
    $$(".po-steps li").forEach((li) => li.classList.add("is-on"));
    const ai = $(".po-ai__text"); if (ai) ai.textContent = "Likely cause: DB connection pool exhausted after 14:02 deploy.\nSeverity: P1   Route to: Platform team";
    $(".po-sla__time") && ($(".po-sla__time").textContent = "Resolved in 18m, inside SLA");
    $(".device__deskui") && ($(".device__deskui").style.opacity = 0);
  }
})();
