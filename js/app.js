/* ================= GLOBAL STATE ================= */
let statsData = [];
let gamesData = [];
let categoriesData = {};
let ranksData = {};
let othersData = [];

/* Built-in fallback data */
const fallbackRanks = {
  "E": { level: 1, title: "Complete Noob", description: "Just started out; knows bare fundamentals." },
  "E+": { level: 2, title: "Novice", description: "Grasping basic principles and syntax." },
  "D": { level: 3, title: "Beginner", description: "Can build simple scripts and models with guidance." },
  "D+": { level: 4, title: "Apprentice", description: "Understands core APIs, events, and common patterns." },
  "C": { level: 5, title: "Intermediate", description: "Builds functional features and mechanics independently." },
  "C+": { level: 6, title: "Competent", description: "Solid grasp of client-server replication and clean structure." },
  "B": { level: 7, title: "Skilled", description: "Reliable and modular code, good asset pipelines." },
  "B+": { level: 8, title: "Advanced", description: "Comfortable with math, state machines, and tuning." },
  "A": { level: 9, title: "Expert", description: "Deep architecture, MicroProfiler mastery, highly optimized." },
  "A+": { level: 10, title: "Proficient", description: "Production-grade execution, robust and battle-tested." },
  "S": { level: 11, title: "Elite", description: "Near platform-ceiling mastery, custom tooling, buffer wizardry." },
  "SS": { level: 12, title: "Legendary", description: "Exceptional standard of excellence across complex projects." },
  "SSS": { level: 13, title: "God Tier", description: "Absolute peak domain mastery and effortless execution." }
};

const fallbackStats = [
  { id: "combat", name: "Combat Systems", rank: "SSS" },
  { id: "luau", name: "Luau Scripting", rank: "SS" },
  { id: "uiux", name: "UI & Interfaces", rank: "A+" },
  { id: "modeling", name: "3D & Texturing", rank: "A" },
  { id: "vfx", name: "VFX & Particles", rank: "S" },
  { id: "audio", name: "Audio & Sound", rank: "B+" },
  { id: "networking", name: "Network Sync", rank: "SS" },
  { id: "optimization", name: "Optimization", rank: "S" }
];

const fallbackOthers = [
  {
    title: "Anime Particle Shader System",
    tag: "VFX / Blender",
    image: "assets/others/vfx_demo.jpg",
    description: "Custom beam and particle emitter stylings tested for anime fighting game impacts.",
    link: "https://xz-lf.github.io"
  },
  {
    title: "PBR Katana & Props",
    tag: "3D Modeling",
    image: "assets/others/katana_props.jpg",
    description: "Low-poly weapon models textured using Substance 3D Painter anchor points and curvature masks.",
    link: "https://xz-lf.github.io"
  },
  {
    title: "Battle Theme Composition",
    tag: "OST / Audio",
    image: "assets/others/ost_demo.jpg",
    description: "Orchestral battle tracks produced in FL Studio featuring harmonic piano chords and percussion.",
    link: "https://xz-lf.github.io"
  }
];

/* ================= INITIALIZATION ================= */
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await loadData();
  renderGames();
  renderStatsCards();
  renderOthers();
  initRadarChart();
  initKeyboardListeners();

  window.addEventListener("hashchange", handleHash);
  handleHash();
});

/* ================= DATA LOADING ================= */
async function loadData() {
  try {
    const [resGames, resStats, resCats, resRanks, resOthers] = await Promise.all([
      fetch("data/games.json"),
      fetch("data/stats.json"),
      fetch("data/categories.json"),
      fetch("data/ranks.json"),
      fetch("data/others.json")
    ]);
    gamesData = await resGames.json();
    statsData = await resStats.json();
    categoriesData = await resCats.json();
    ranksData = await resRanks.json();
    othersData = await resOthers.json();
  } catch (err) {
    console.warn("Using fallback local data (fetch blocked or files loading locally):", err);
    statsData = fallbackStats;
    ranksData = fallbackRanks;
    othersData = fallbackOthers;
  }
}

/* ================= SPA VIEW ROUTING ================= */
function navigateTo(pageId, categoryId = null) {
  if (categoryId) {
    location.hash = `#category-${categoryId}`;
  } else {
    location.hash = `#${pageId}`;
  }
}

function handleHash() {
  const hash = location.hash.replace("#", "") || "home";

  if (hash.startsWith("category-")) {
    const catId = hash.replace("category-", "");
    showCategoryPage(catId);
    return;
  }

  showPage(hash);
}

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  const navBtns = document.querySelectorAll(".nav-btn");

  let targetPage = document.getElementById(`page-${pageId}`);
  if (!targetPage) targetPage = document.getElementById("page-home");

  pages.forEach(p => p.classList.remove("active"));
  targetPage.classList.add("active");

  navBtns.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-page") === pageId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ================= CATEGORY SHOWCASE RENDERER ================= */
function showCategoryPage(catId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(p => p.classList.remove("active"));

  const catPage = document.getElementById("page-category");
  catPage.classList.add("active");

  const catInfo = categoriesData[catId] || {
    title: catId.toUpperCase(),
    description: "Detailed breakdown of work and sub-skills.",
    keywords: ["Luau", "Development", "Roblox"],
    showcases: [
      {
        title: "Work Showcase",
        image: "assets/placeholder.jpg",
        description: "Showcase blocks will appear here based on categories.json."
      }
    ]
  };

  document.getElementById("catTitle").textContent = catInfo.title;
  document.getElementById("catDescription").textContent = catInfo.description;

  const keywordsContainer = document.getElementById("catKeywords");
  keywordsContainer.innerHTML = (catInfo.keywords || [])
    .map(kw => `<span class="keyword-badge"># ${kw}</span>`)
    .join("");

  const showcaseGrid = document.getElementById("catShowcaseGrid");
  showcaseGrid.innerHTML = (catInfo.showcases || [])
    .map(item => {
      // Build optional redirect button if link is provided in JSON
      let linkHtml = "";
      if (item.link) {
        const linkLabel = item.linkText || "View Reference →";
        if (item.link.startsWith("#")) {
          const internalTab = item.link.replace("#", "");
          linkHtml = `<button class="showcase-link-btn" onclick="navigateTo('${internalTab}')">${linkLabel}</button>`;
        } else {
          linkHtml = `<a href="${item.link}" target="_blank" class="showcase-link-btn">${linkLabel}</a>`;
        }
      }

      return `
        <div class="showcase-card">
          <div class="card-media">
            <img src="${item.image}" onerror="this.src='https://placehold.co/600x340/1a1c23/ffffff?text=${encodeURIComponent(item.title)}'" alt="${item.title}" class="zoomable-img" onclick="openLightbox(this.src, '${escapeQuotes(item.title)}', '${escapeQuotes(item.description)}')" />
          </div>
          <div class="card-body">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${linkHtml}
          </div>
        </div>
      `;
    })
    .join("");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ================= RENDER GAMES ================= */
function renderGames() {
  const container = document.getElementById("gamesGridContainer");
  if (!container || !gamesData.length) return;

  container.innerHTML = gamesData
    .map(
      game => `
    <div class="game-card">
      <div class="card-media">
        <img src="${game.thumbnail}" onerror="this.src='https://placehold.co/600x340/1a1c23/ffffff?text=${encodeURIComponent(game.title)}'" alt="${game.title}" class="zoomable-img" onclick="openLightbox(this.src, '${escapeQuotes(game.title)}', '${escapeQuotes(game.description)}')" />
      </div>
      <div class="card-body">
        <h3>${game.title}</h3>
        <span class="card-role">${game.role}</span>
        <p>${game.description}</p>
        <div class="card-tags">
          ${game.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
        <a href="${game.link}" target="_blank" class="card-link">Play on Roblox ↗</a>
      </div>
    </div>
  `
    )
    .join("");
}

/* ================= RENDER OTHERS ================= */
function renderOthers() {
  const container = document.getElementById("othersGridContainer");
  if (!container || !othersData.length) return;

  container.innerHTML = othersData
    .map(
      item => `
    <div class="showcase-card">
      <div class="card-media">
        <img src="${item.image}" onerror="this.src='https://placehold.co/600x340/1a1c23/ffffff?text=${encodeURIComponent(item.title)}'" alt="${item.title}" class="zoomable-img" onclick="openLightbox(this.src, '${escapeQuotes(item.title)}', '${escapeQuotes(item.description)}')" />
      </div>
      <div class="card-body">
        <span class="badge">${item.tag || "Experiment"}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <a href="${item.link || '#'}" target="_blank" class="card-link">View Page ↗</a>
      </div>
    </div>
  `
    )
    .join("");
}

/* ================= RENDER STATS LIST ================= */
function renderStatsCards() {
  const container = document.getElementById("statsListContainer");
  if (!container || !statsData.length) return;

  container.innerHTML = statsData
    .map(stat => {
      const rankKey = stat.rank || "C";
      const rankInfo = ranksData[rankKey] || fallbackRanks[rankKey] || { level: 5, title: "Proficient", description: "Standard proficiency" };
      const tooltipText = `${rankKey}: ${rankInfo.title} — ${rankInfo.description}`;

      return `
      <div class="stat-item-card" onclick="navigateTo('category', '${stat.id}')">
        <div class="stat-item-left">
          <span class="rank-badge has-tooltip" data-tooltip="${tooltipText}">${rankKey}</span>
          <div class="stat-item-info">
            <h4>${stat.name}</h4>
            <span class="stat-tier-desc">${rankInfo.title}</span>
          </div>
        </div>
        <span class="stat-arrow-btn">Showcase →</span>
      </div>
      `;
    })
    .join("");
}

/* ================= DYNAMIC N-GON RADAR (RANKS E - SSS) ================= */
function initRadarChart() {
  const canvas = document.getElementById("radarChart");
  const tooltip = document.getElementById("radarTooltip");
  if (!canvas || !statsData.length) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = 480;
  const height = 480;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const cx = width / 2;
  const cy = height / 2;
  const radius = 155;
  const N = statsData.length;
  const angleStep = (Math.PI * 2) / N;
  const MAX_TIER = 13;

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const computedStyle = getComputedStyle(document.documentElement);
    const accentColor = computedStyle.getPropertyValue("--accent").trim() || "#e63946";
    const gridColor = computedStyle.getPropertyValue("--border").trim() || "#282e3a";
    const textColor = computedStyle.getPropertyValue("--text-main").trim() || "#f3f4f6";

    // 1. Concentric Polygonal Grids
    const tierSteps = [0.2, 0.4, 0.6, 0.8, 1.0];
    tierSteps.forEach(level => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const r = radius * level;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 2. Spokes & Axis Labels
    for (let i = 0; i < N; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = gridColor;
      ctx.stroke();

      const labelDist = radius + 28;
      const lx = cx + labelDist * Math.cos(angle);
      const ly = cy + labelDist * Math.sin(angle) + 4;

      ctx.fillStyle = textColor;
      ctx.font = "600 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(statsData[i].name, lx, ly);
    }

    // 3. Data Polygon
    ctx.beginPath();
    const dataPoints = [];
    for (let i = 0; i < N; i++) {
      const stat = statsData[i];
      const rankKey = stat.rank || "C";
      const rankInfo = ranksData[rankKey] || fallbackRanks[rankKey] || { level: 6, title: "Competent", description: "" };
      const ratio = Math.max(0.12, rankInfo.level / MAX_TIER);

      const angle = i * angleStep - Math.PI / 2;
      const r = radius * ratio;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      dataPoints.push({
        x,
        y,
        id: stat.id,
        name: stat.name,
        rank: rankKey,
        title: rankInfo.title,
        desc: rankInfo.description
      });

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = hexToRgba(accentColor, 0.35);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. Vertex Dots
    dataPoints.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    canvas._dataPoints = dataPoints;
  }

  draw();
  window.refreshRadarChart = draw;

  // Vertex Hover Tooltip Logic
  canvas.onmousemove = e => {
    if (!canvas._dataPoints || !tooltip) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let hoveredPt = null;
    for (let pt of canvas._dataPoints) {
      if (Math.hypot(pt.x - mouseX, pt.y - mouseY) < 16) {
        hoveredPt = pt;
        break;
      }
    }

    if (hoveredPt) {
      tooltip.style.display = "block";
      tooltip.style.left = `${hoveredPt.x / scaleX}px`;
      tooltip.style.top = `${hoveredPt.y / scaleY}px`;
      tooltip.innerHTML = `<strong>${hoveredPt.name}</strong> [${hoveredPt.rank}]<br><span style="opacity:0.85">${hoveredPt.title} — ${hoveredPt.desc}</span>`;
    } else {
      tooltip.style.display = "none";
    }
  };

  canvas.onmouseleave = () => {
    if (tooltip) tooltip.style.display = "none";
  };

  // Canvas Click navigation
  canvas.onclick = e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (!canvas._dataPoints) return;
    for (let pt of canvas._dataPoints) {
      if (Math.hypot(pt.x - clickX, pt.y - clickY) < 18) {
        navigateTo("category", pt.id);
        return;
      }
    }
  };
}

/* ================= 90% SCREEN LIGHTBOX CONTROLLER ================= */
function openLightbox(src, title = "Showcase Preview", description = "") {
  const modal = document.getElementById("imageLightbox");
  const img = document.getElementById("lightboxImg");
  const t = document.getElementById("lightboxTitle");
  const d = document.getElementById("lightboxDescription");

  if (!modal || !img) return;

  img.src = src;
  t.textContent = title;
  d.textContent = description;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const modal = document.getElementById("imageLightbox");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function handleLightboxBackdrop(event) {
  if (event.target.id === "imageLightbox") {
    closeLightbox();
  }
}

function initKeyboardListeners() {
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeLightbox();
    }
  });
}

/* ================= THEME & ACCENT CONTROLLER ================= */
function initTheme() {
  const savedTheme = localStorage.getItem("theme_base") || "dark";
  const savedAccent = localStorage.getItem("theme_accent") || "#e63946";

  document.documentElement.setAttribute("data-theme", savedTheme);
  document.getElementById("themeToggleBtn").textContent = savedTheme === "dark" ? "☀️" : "🌙";
  setAccent(savedAccent, false);
}

function toggleBaseTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  document.getElementById("themeToggleBtn").textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme_base", next);

  if (window.refreshRadarChart) window.refreshRadarChart();
}

function setAccent(colorHex, save = true) {
  document.documentElement.style.setProperty("--accent", colorHex);
  document.documentElement.style.setProperty("--accent-glow", hexToRgba(colorHex, 0.22));

  if (save) {
    localStorage.setItem("theme_accent", colorHex);
  }

  if (window.refreshRadarChart) window.refreshRadarChart();
}

function hexToRgba(hex, alpha) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escapeQuotes(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, '&quot;');
}