const PRAYER_API_DEFAULT_BASE_URL = "https://api.vaktija.ba/vaktija/v1";
const PRAYER_API_FALLBACK_BASE_URL = "/.netlify/functions/prayer-times";

const PRAYER_ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

const toLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toApiDatePath = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

const normalizeTime = (time) => {
  const [hours = "0", minutes = "0"] = String(time || "0:0").split(":");
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const toNormalizedPrayerResponse = (data, townId, dateKey) => {
  const timings = data?.vakat;
  if (!Array.isArray(timings) || timings.length < 6) {
    throw new Error("Neispravan odgovor za namaze.");
  }

  return {
    date: dateKey,
    timings: {
      Fajr: normalizeTime(timings[0]),
      Sunrise: normalizeTime(timings[1]),
      Dhuhr: normalizeTime(timings[2]),
      Asr: normalizeTime(timings[3]),
      Maghrib: normalizeTime(timings[4]),
      Isha: normalizeTime(timings[5])
    },
    location: data?.lokacija || "",
    townId: data?.id ?? townId,
    source: data?.source || "vaktija.ba",
    apiDate: Array.isArray(data?.datum) ? data.datum[1] || dateKey : data?.datum || dateKey
  };
};

const fetchFromBaseUrl = async (baseUrl, townId, date, dateKey) => {
  const normalizedBaseUrl = String(baseUrl || "").replace(/\/$/, "");
  const response = await fetch(`${normalizedBaseUrl}/${townId}/${toApiDatePath(date)}`);

  if (!response.ok) {
    throw new Error("Ne mogu učitati vrijeme namaza.");
  }

  const data = await response.json();
  return toNormalizedPrayerResponse(data, townId, dateKey);
};

export const prayerOrder = PRAYER_ORDER;

export async function fetchPrayerTimes(townId, date, options = {}) {
  const dateKey = toLocalDateKey(date);
  const cacheKey = `vaktija_${townId}_${dateKey}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const baseUrls = [
    options.primaryBaseUrl || options.baseUrl || PRAYER_API_DEFAULT_BASE_URL,
    options.fallbackBaseUrl || PRAYER_API_FALLBACK_BASE_URL
  ].filter(Boolean);
  const uniqueBaseUrls = [...new Set(baseUrls)];

  let lastError;
  for (const baseUrl of uniqueBaseUrls) {
    try {
      const normalized = await fetchFromBaseUrl(baseUrl, townId, date, dateKey);
      localStorage.setItem(cacheKey, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Ne mogu učitati vrijeme namaza.");
}
