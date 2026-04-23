const DEFAULT_ENDPOINT = "/.netlify/functions/announcements";
const CONFIG_URL = "/admin/config.json";

const pinSection = document.getElementById("pin-section");
const pinInput = document.getElementById("pin-input");
const pinSubmit = document.getElementById("pin-submit");
const pinError = document.getElementById("pin-error");

const editorSection = document.getElementById("editor-section");
const itemsRoot = document.getElementById("items");
const addItemButton = document.getElementById("add-item");
const saveButton = document.getElementById("save-items");
const resetButton = document.getElementById("reset-items");
const reloadButton = document.getElementById("reload-items");
const statusLabel = document.getElementById("status");

let config = { endpoint: DEFAULT_ENDPOINT, pin: "1234" };
let announcements = [];

const setStatus = (message) => {
  statusLabel.textContent = message;
  setTimeout(() => {
    if (statusLabel.textContent === message) statusLabel.textContent = "";
  }, 3000);
};

const renderItems = () => {
  itemsRoot.innerHTML = "";
  announcements.forEach((text, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";

    const input = document.createElement("input");
    input.value = text;
    input.addEventListener("input", (event) => {
      announcements[index] = event.target.value;
    });

    const removeButton = document.createElement("button");
    removeButton.textContent = "Obriši";
    removeButton.addEventListener("click", () => {
      announcements.splice(index, 1);
      renderItems();
    });

    wrapper.append(input, removeButton);
    itemsRoot.appendChild(wrapper);
  });
};

const fetchAnnouncements = async () => {
  const response = await fetch(config.endpoint, { cache: "no-store" });
  if (!response.ok) throw new Error("Ne mogu učitati obavijesti");
  const data = await response.json();
  announcements = Array.isArray(data.announcements) ? data.announcements : [];
  renderItems();
};

const saveAnnouncements = async () => {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": config.pin || ""
    },
    body: JSON.stringify({ announcements })
  });

  if (!response.ok) {
    throw new Error("Neuspješno snimanje");
  }
};

const unlock = async () => {
  pinError.classList.add("hidden");
  if (config.pin && pinInput.value !== config.pin) {
    pinError.classList.remove("hidden");
    return;
  }

  pinSection.classList.add("hidden");
  editorSection.classList.remove("hidden");
  await fetchAnnouncements();
};

const loadConfig = async () => {
  try {
    const response = await fetch(CONFIG_URL, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      config = { ...config, ...data };
    }
  } catch {
    // Use defaults
  }
};

pinSubmit.addEventListener("click", unlock);

addItemButton.addEventListener("click", () => {
  announcements.push("");
  renderItems();
});

reloadButton.addEventListener("click", async () => {
  await fetchAnnouncements();
  setStatus("Osvježeno.");
});

saveButton.addEventListener("click", async () => {
  try {
    await saveAnnouncements();
    setStatus("Sačuvano.");
  } catch {
    setStatus("Greška pri snimanju.");
  }
});

resetButton.addEventListener("click", async () => {
  await fetchAnnouncements();
  setStatus("Vraćeno na trenutno stanje servera.");
});

loadConfig();
