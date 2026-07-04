console.log("AIFilter content script loaded");

const TEXT_API = "http://127.0.0.1:8000/api/detect/";
const IMAGE_API = "http://127.0.0.1:8000/api/detect-image/";
const THRESHOLD = 60;

const SITE_CONFIG = {
  "youtube.com": {
    cardSelector: "ytd-rich-item-renderer, ytd-video-renderer",
    textSelector: "#video-title"
  },
  "facebook.com": {
    cardSelector: '[role="article"]',
    textSelector: null
  },
  "instagram.com": {
    cardSelector: "article",
    textSelector: null
  }
};

function getSiteConfig() {
  const host = location.hostname;
  for (const key in SITE_CONFIG) {
    if (host.includes(key)) return SITE_CONFIG[key];
  }
  return null;
}

const config = getSiteConfig();
const processed = new WeakSet();
let autoFilterEnabled = false;
let observer = null;
const blockedItems = []; // { text, score }

chrome.storage.sync.get({ enabled: false }, (data) => {
  autoFilterEnabled = data.enabled;
  if (autoFilterEnabled) startScanning();
});

// Finds the best representative image on the current page:
// 1. og:image meta tag (sites usually set this to their main/featured image)
// 2. otherwise, the largest visible <img> on the page
function findMainImage() {
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && ogImage.content) return ogImage.content;

  const images = Array.from(document.querySelectorAll("img"))
    .filter((img) => img.src && img.naturalWidth > 100 && img.naturalHeight > 100)
    .sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight);

  return images.length ? images[0].src : null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    sendResponse({ text: document.body.innerText });
    return true;
  }

  if (request.type === "AIFILTER_GET_MAIN_IMAGE") {
    sendResponse({ imageUrl: findMainImage() });
    return true;
  }

  if (request.type === "AIFILTER_TOGGLE") {
    autoFilterEnabled = request.enabled;
    if (autoFilterEnabled) {
      startScanning();
    } else {
      stopScanning();
    }
    sendResponse({ ok: true });
    return true;
  }

  if (request.type === "AIFILTER_GET_BLOCKED") {
    sendResponse({ items: blockedItems });
    return true;
  }
});

async function checkText(text) {
  if (text.length < 15) return 0;
  try {
    const res = await fetch(TEXT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    return data.ai_probability || 0;
  } catch (err) {
    console.error("AIFilter text check failed:", err);
    return 0;
  }
}

async function checkImage(imageUrl) {
  try {
    const res = await fetch(IMAGE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl })
    });
    const data = await res.json();
    return data.image_ai_probability || 0;
  } catch (err) {
    console.error("AIFilter image check failed:", err);
    return 0;
  }
}

async function checkAndHide(card) {
  if (!autoFilterEnabled) return;
  if (processed.has(card)) return;
  processed.add(card);

  let text = config.textSelector
    ? (card.querySelector(config.textSelector)?.innerText || "")
    : card.innerText;
  text = text.trim();

  const thumbnail = card.querySelector("img")?.src || null;

  const [textScore, imageScore] = await Promise.all([
    checkText(text),
    thumbnail ? checkImage(thumbnail) : Promise.resolve(0)
  ]);

  const finalScore = Math.max(textScore, imageScore);

  if (finalScore >= THRESHOLD) {
    card.style.display = "none";
    blockedItems.push({ text: text.slice(0, 50) || "(untitled)", score: finalScore });
    console.log(`AIFilter blocked #${blockedItems.length} — score: ${finalScore} — text: ${text.slice(0, 40)}`);
  }
}

function scanFeed() {
  if (!config || !autoFilterEnabled) return;
  document.querySelectorAll(config.cardSelector).forEach(checkAndHide);
}

function startScanning() {
  if (!config) return;
  scanFeed();
  if (!observer) {
    observer = new MutationObserver(() => scanFeed());
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function stopScanning() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}