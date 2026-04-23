<template>
  <div class="kiosk-shell min-h-screen px-12 py-8 pb-28">
    <AdhanOverlay :visible="adhanVisible" :prayer-label="adhanPrayerLabel" />

    <div class="kiosk-frame">
      <div class="flex items-center justify-between w-full">
        <Header :mosque-name="config.mosqueName" :city-label="selectedCity.label" />
        <!-- <CitySelector v-model="selectedCityKey" :cities="cityOptions" /> -->
      </div>

      <div class="ornament-band my-4"></div>

      <Clock :time-text="clockText" />

      <div class="mt-2">
        <DateDisplay :gregorian="gregorianDate" :hijri="hijriDate" />
      </div>

      <div class="mt-6 grid grid-cols-[2.3fr_1fr] gap-6">
        <PrayerTimes :prayers="prayerRows" />
        <div class="space-y-4">
          <RamadanInfo
            v-if="ramadanStatus.isRamadan"
            :is-ramadan="ramadanStatus.isRamadan"
            :day-index="ramadanStatus.dayIndex"
            :progress="ramadanStatus.progress"
            :bajram-label="nextBajramStatus.label"
            :days-to-eid="nextBajramStatus.days"
            :time-to-eid="nextBajramStatus.time"
            :sehur="sehurTime"
            :iftar="iftarTime"
          />
          <WeatherWidget
            :city-label="selectedCity.label"
            :temperature="weather.temperature"
            :description="weather.description"
            :windspeed="weather.windspeed"
          />
          <BajramCountdown
            :bajram-label="nextBajramStatus.label"
            :bajram-date="formatBosnianDate(nextBajramStatus.date)"
            :days-to-eid="nextBajramStatus.days"
            :show-time="nextBajramStatus.days === 0"
            :time-to-eid="nextBajramStatus.time"
          />
        </div>
      </div>

      <div class="mt-6">
        <Countdown :next-prayer-label="nextPrayerLabel" :countdown="countdown" />
      </div>

      <div class="mt-6">
        <DailyQuote :quote="dailyQuote" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import Header from "./components/Header.vue";
import CitySelector from "./components/CitySelector.vue";
import Clock from "./components/Clock.vue";
import DateDisplay from "./components/DateDisplay.vue";
import PrayerTimes from "./components/PrayerTimes.vue";
import Countdown from "./components/Countdown.vue";
import RamadanInfo from "./components/RamadanInfo.vue";
import WeatherWidget from "./components/WeatherWidget.vue";
import BajramCountdown from "./components/BajramCountdown.vue";
import DailyQuote from "./components/DailyQuote.vue";
import AdhanOverlay from "./components/AdhanOverlay.vue";
import config from "./config/appConfig";
import quranQuotes from "./data/quranQuotes.json";
import { fetchPrayerTimes, prayerOrder } from "./services/prayerApi";
import { fetchWeather } from "./services/weatherService";
import { getNextBajram, getRamadanStatus } from "./services/ramadanService";

const appTimeZone = "Europe/Sarajevo";
const bosnianWeekdays = [
  "Nedjelja",
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota"
];
const bosnianMonths = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "septembar",
  "oktobar",
  "novembar",
  "decembar"
];

const getZonedNow = () => {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: appTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map(({ type, value }) => [type, value])
  );

  return new Date(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
};

const getBosnianDateParts = (date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: appTimeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short"
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );

  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return {
    day: Number(parts.day),
    month: Number(parts.month),
    year: Number(parts.year),
    weekdayIndex: weekdayMap[parts.weekday]
  };
};

const selectedCityKey = ref(config.defaultCity);
const now = ref(getZonedNow());
const prayerTimes = ref(null);
const tomorrowPrayerTimes = ref(null);
const weather = ref({ temperature: 0, windspeed: 0, description: "--" });
const currentPrayerKey = ref("");
const nextPrayerKey = ref("");
const nextPrayerTime = ref(null);
const countdown = ref("00:00:00");
const adhanVisible = ref(false);
const adhanPrayerLabel = ref("");
const ramadanStatus = ref(getRamadanStatus(now.value, config.ramadan));
const nextBajramStatus = ref(getNextBajram(now.value, config.bajrams));
const lastAdhanKey = ref("");

let timeInterval;
let weatherInterval;
let midnightTimeout;
let adhanTimeout;
let wakeLock;

const cityOptions = computed(() =>
  Object.entries(config.cities).map(([key, value]) => ({
    key,
    label: value.label
  }))
);

const selectedCity = computed(() => config.cities[selectedCityKey.value]);

const clockText = computed(() =>
  new Intl.DateTimeFormat("bs-BA", {
    timeZone: appTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(now.value)
);

const gregorianDate = computed(() =>
  (() => {
    const { day, month, year, weekdayIndex } = getBosnianDateParts(now.value);
    return `${bosnianWeekdays[weekdayIndex]}, ${day}. ${bosnianMonths[month - 1]} ${year}.`;
  })()
);

const hijriDate = computed(() =>
  new Intl.DateTimeFormat("bs-BA-u-ca-islamic", {
    timeZone: appTimeZone,
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(now.value)
);

const formatBosnianDate = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day}. ${bosnianMonths[month - 1]} ${year}.`;
};

const prayerLabelMap = {
  Fajr: { bs: "Zora", ar: "الفجر" },
  Sunrise: { bs: "Izlazak sunca", ar: "الشروق" },
  Dhuhr: { bs: "Podne", ar: "الظهر" },
  Asr: { bs: "Ikindija", ar: "العصر" },
  Maghrib: { bs: "Akšam", ar: "المغرب" },
  Isha: { bs: "Jacija", ar: "العشاء" }
};

const prayerRows = computed(() => {
  if (!prayerTimes.value) return [];
  return prayerOrder.map((key) => ({
    key,
    labelBs: prayerLabelMap[key].bs,
    labelAr: prayerLabelMap[key].ar,
    time: prayerTimes.value.timings[key],
    isNext: key === nextPrayerKey.value,
    isCurrent: key === currentPrayerKey.value
  }));
});

const sehurTime = computed(() => prayerTimes.value?.timings.Fajr || "--:--");
const iftarTime = computed(() => prayerTimes.value?.timings.Maghrib || "--:--");

const nextPrayerLabel = computed(() => prayerLabelMap[nextPrayerKey.value]?.bs || "--");

const dailyQuote = computed(() => {
  const { day, month, year } = getBosnianDateParts(now.value);
  const seed = year * 10000 + month * 100 + day;
  return quranQuotes[seed % quranQuotes.length];
});

async function loadPrayerTimes() {
  try {
    const tomorrow = new Date(now.value);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayResponse, tomorrowResponse] = await Promise.all([
      fetchPrayerTimes(selectedCity.value.townId, now.value, config.prayerApi),
      fetchPrayerTimes(selectedCity.value.townId, tomorrow, config.prayerApi)
    ]);

    prayerTimes.value = todayResponse;
    tomorrowPrayerTimes.value = tomorrowResponse;
    updatePrayerStatus();
  } catch (error) {
    console.error(error);
  }
}

async function loadWeather() {
  try {
    const response = await fetchWeather(selectedCity.value.lat, selectedCity.value.lng);
    weather.value = response;
  } catch (error) {
    console.error(error);
  }
}

function parseTimeToDate(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const base = new Date(now.value);
  base.setHours(hours, minutes, 0, 0);
  return base;
}

function updatePrayerStatus() {
  if (!prayerTimes.value) return;

  const schedule = prayerOrder.map((key) => ({
    key,
    time: prayerTimes.value.timings[key],
    date: parseTimeToDate(prayerTimes.value.timings[key])
  }));
  const prayerSchedule = schedule.filter((item) => item.key !== "Sunrise");

  const currentTime = now.value;
  let current = "";
  let next = "";
  let nextTime = null;

  for (let i = 0; i < prayerSchedule.length; i += 1) {
    if (currentTime >= prayerSchedule[i].date) {
      current = prayerSchedule[i].key;
    }
    if (!next && currentTime < prayerSchedule[i].date) {
      next = prayerSchedule[i].key;
      nextTime = prayerSchedule[i].date;
    }
  }

  if (!next) {
    next = "Fajr";
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    nextTime = new Date(tomorrow);
    const nextFajr = tomorrowPrayerTimes.value?.timings.Fajr || prayerTimes.value.timings.Fajr;
    const [hours, minutes] = nextFajr.split(":").map(Number);
    nextTime.setHours(hours, minutes, 0, 0);
  }

  if (!current) {
    current = "Isha";
  }

  currentPrayerKey.value = current;
  nextPrayerKey.value = next;
  nextPrayerTime.value = nextTime;

  checkAdhanTrigger(prayerSchedule, currentTime);
}

function checkAdhanTrigger(schedule, currentTime) {
  const prayer = schedule.find(
    (item) => Math.abs(currentTime - item.date) <= 1000
  );
  if (!prayer) return;

  const key = `${prayer.key}-${itemKeyForDate(prayer.date)}`;
  if (lastAdhanKey.value === key) return;

  lastAdhanKey.value = key;
  triggerAdhan(prayer.key);
}

function itemKeyForDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function updateCountdown() {
  if (!nextPrayerTime.value) return;
  const diff = Math.max(0, nextPrayerTime.value - now.value);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  countdown.value = `${hours}:${minutes}:${seconds}`;
}

function triggerAdhan(prayerKey) {
  adhanPrayerLabel.value = prayerLabelMap[prayerKey]?.bs || "";
  adhanVisible.value = true;

  const audio = new Audio("/audio/adhan.mp3");
  audio.play().catch(() => null);

  if (adhanTimeout) clearTimeout(adhanTimeout);
  adhanTimeout = setTimeout(() => {
    adhanVisible.value = false;
  }, 60000);
}

function updateRamadan() {
  ramadanStatus.value = getRamadanStatus(now.value, config.ramadan);
  nextBajramStatus.value = getNextBajram(now.value, config.bajrams);
}

function scheduleMidnightRefresh() {
  const midnight = getZonedNow();
  midnight.setHours(24, 0, 0, 0);
  const timeout = midnight - getZonedNow();
  if (midnightTimeout) clearTimeout(midnightTimeout);
  midnightTimeout = setTimeout(async () => {
    await loadPrayerTimes();
    updateRamadan();
    scheduleMidnightRefresh();
  }, timeout);
}

async function requestFullscreen() {
  try {
    if (document.fullscreenElement) return;
    await document.documentElement.requestFullscreen();
  } catch {
    // Ignore if fullscreen is blocked.
  }
}

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
    }
  } catch {
    // Ignore if wake lock is unavailable.
  }
}

function startTimers() {
  timeInterval = setInterval(() => {
    now.value = getZonedNow();
    updateRamadan();
    updatePrayerStatus();
    updateCountdown();
  }, 1000);

  weatherInterval = setInterval(loadWeather, 30 * 60 * 1000);
}

onMounted(async () => {
  await loadPrayerTimes();
  await loadWeather();
  scheduleMidnightRefresh();
  startTimers();
  requestFullscreen();
  requestWakeLock();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      requestWakeLock();
    }
  });
});

onUnmounted(() => {
  clearInterval(timeInterval);
  clearInterval(weatherInterval);
  clearTimeout(midnightTimeout);
  clearTimeout(adhanTimeout);
  if (wakeLock) wakeLock.release();
});

watch(selectedCityKey, async () => {
  await loadPrayerTimes();
  await loadWeather();
});
</script>
