const toggle = document.getElementById("toggle");
const scanTextBtn = document.getElementById("scanTextBtn");
const scanImageBtn = document.getElementById("scanImageBtn");
const countNumber = document.getElementById("countNumber");
const blockedList = document.getElementById("blockedList");
const overlay = document.getElementById("overlay");
const modalTitle = document.getElementById("modalTitle");
const modalScore = document.getElementById("modalScore");
const closeModal = document.getElementById("closeModal");

chrome.storage.sync.get({ enabled: false }, (data) => {
  toggle.checked = data.enabled;
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ enabled });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "AIFILTER_TOGGLE", enabled }, () => void chrome.runtime.lastError);
  });
});

function scoreClass(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function refreshBlockedList() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "AIFILTER_GET_BLOCKED" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        countNumber.textContent = "0";
        return;
      }
      const items = response.items || [];
      countNumber.textContent = items.length;
      if (items.length === 0) {
        blockedList.innerHTML = `<div class="empty-list">Nothing blocked yet</div>`;
        return;
      }
      blockedList.innerHTML = items
        .slice()
        .reverse()
        .map(
          (item) => `
            <div class="item">
              <span class="item-text">${escapeHtml(item.text)}</span>
              <span class="item-score ${scoreClass(item.score)}">${item.score}%</span>
            </div>`
        )
        .join("");
    });
  });
}

function openModal() {
  overlay.classList.add("show");
  modalTitle.textContent = "Scanning...";
  modalScore.textContent = "";
  modalScore.className = "modal-score";
}

closeModal.addEventListener("click", () => overlay.classList.remove("show"));

// --- Scan Text: checks the page's visible text ---
scanTextBtn.addEventListener("click", () => {
  openModal();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      modalTitle.textContent = "No active tab found.";
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "extractText" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        modalTitle.textContent = "Could not read this page. Try reloading the tab.";
        return;
      }

      const text = (response.text || "").slice(0, 3000);

      fetch("http://127.0.0.1:8000/api/detect/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })
        .then((res) => res.json())
        .then((data) => {
          modalTitle.textContent = data.result;
          modalScore.textContent = `${data.ai_probability}%`;
          modalScore.classList.add(scoreClass(data.ai_probability));
        })
        .catch(() => {
          modalTitle.textContent = "Backend not reachable. Is the server running?";
        });
    });
  });
});

// --- Scan Image: finds the main image on the page and checks it ---
scanImageBtn.addEventListener("click", () => {
  openModal();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      modalTitle.textContent = "No active tab found.";
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "AIFILTER_GET_MAIN_IMAGE" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.imageUrl) {
        modalTitle.textContent = "No image found on this page.";
        return;
      }

      fetch("http://127.0.0.1:8000/api/detect-image/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: response.imageUrl })
      })
        .then((res) => res.json())
        .then((data) => {
          const score = data.image_ai_probability || 0;
          modalTitle.textContent = score >= 50 ? "Likely AI-generated image" : "Likely real photo";
          modalScore.textContent = `${score}%`;
          modalScore.classList.add(scoreClass(score));
        })
        .catch(() => {
          modalTitle.textContent = "Backend not reachable. Is the server running?";
        });
    });
  });
});

refreshBlockedList();