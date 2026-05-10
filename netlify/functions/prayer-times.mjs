import config from "../../src/config/appConfig.js";
import bugojnoPrayerTimes from "../../src/data/bugojnoPrayerTimes.js";

const APP_TIME_ZONE = "Europe/Sarajevo";
const SUNRISE_SUNSET_ANGLE = 0.833;
const FAJR_ANGLE = 18;
const ISHA_ANGLE = 17;
const ASR_FACTOR = 1;
const DHUHR_OFFSET_MINUTES = 1;

const toRadians = (degrees) => (degrees * Math.PI) / 180;
const toDegrees = (radians) => (radians * 180) / Math.PI;

const dayOfYear = (date) => {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86400000);
};

const getTimeZoneOffsetMinutes = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );

  const zonedUtcTime = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return (zonedUtcTime - date.getTime()) / 60000;
};

const solarPosition = (date) => {
  const dayIndex = dayOfYear(date);
  const gamma = (2 * Math.PI / 365) * (dayIndex - 1);

  const equationOfTime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  const declination = (
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)
  );

  return { equationOfTime, declination };
};

const getHourAngleDegrees = (latitude, declination, altitudeDegrees) => {
  const latitudeRad = toRadians(latitude);
  const altitudeRad = toRadians(altitudeDegrees);
  const cosHourAngle = (
    Math.sin(altitudeRad) - Math.sin(latitudeRad) * Math.sin(declination)
  ) / (Math.cos(latitudeRad) * Math.cos(declination));

  if (cosHourAngle < -1 || cosHourAngle > 1) {
    return null;
  }

  return toDegrees(Math.acos(cosHourAngle));
};

const getAsrAltitudeDegrees = (latitude, declination, factor = ASR_FACTOR) => {
  const latitudeRad = toRadians(latitude);
  const shadowAngle = Math.atan(1 / (factor + Math.tan(Math.abs(latitudeRad - declination))));
  return toDegrees(shadowAngle);
};

const toTimeString = (minutes) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const rounded = Math.round(normalized);
  const hours = String(Math.floor(rounded / 60) % 24).padStart(2, "0");
  const mins = String(rounded % 60).padStart(2, "0");
  return `${hours}:${mins}`;
};

const calculatePrayerTimes = (latitude, longitude, date) => {
  const utcNoon = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    12,
    0,
    0
  ));
  const { equationOfTime, declination } = solarPosition(utcNoon);
  const timeZoneOffsetMinutes = getTimeZoneOffsetMinutes(utcNoon, APP_TIME_ZONE);
  const solarNoon = 720 - (4 * longitude) - equationOfTime + timeZoneOffsetMinutes;

  const sunriseHourAngle = getHourAngleDegrees(latitude, declination, -SUNRISE_SUNSET_ANGLE);
  const fajrHourAngle = getHourAngleDegrees(latitude, declination, -FAJR_ANGLE);
  const ishaHourAngle = getHourAngleDegrees(latitude, declination, -ISHA_ANGLE);
  const asrHourAngle = getHourAngleDegrees(
    latitude,
    declination,
    getAsrAltitudeDegrees(latitude, declination)
  );

  if (
    sunriseHourAngle === null ||
    fajrHourAngle === null ||
    ishaHourAngle === null ||
    asrHourAngle === null
  ) {
    throw new Error("Prayer times cannot be calculated for this date and location.");
  }

  const fajr = solarNoon - fajrHourAngle * 4;
  const sunrise = solarNoon - sunriseHourAngle * 4;
  const dhuhr = solarNoon + DHUHR_OFFSET_MINUTES;
  const asr = solarNoon + asrHourAngle * 4;
  const maghrib = solarNoon + sunriseHourAngle * 4;
  const isha = solarNoon + ishaHourAngle * 4;

  return [
    toTimeString(fajr),
    toTimeString(sunrise),
    toTimeString(dhuhr),
    toTimeString(asr),
    toTimeString(maghrib),
    toTimeString(isha)
  ];
};

const getCityByTownId = (townId) =>
  Object.values(config.cities).find((city) => String(city.townId) === String(townId));

const getDateKey = (date) =>
  [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("-");

const getStaticPrayerTimes = (townId, date) => {
  if (String(townId) !== "16") {
    return null;
  }

  return bugojnoPrayerTimes[getDateKey(date)] || null;
};

const getDateFromPath = (segments) => {
  const [townId, year, month, day] = segments;

  if (!townId || !year || !month || !day) {
    return null;
  }

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const date = new Date(Date.UTC(numericYear, numericMonth - 1, numericDay, 12, 0, 0));

  if (
    Number.isNaN(numericYear) ||
    Number.isNaN(numericMonth) ||
    Number.isNaN(numericDay) ||
    date.getUTCFullYear() !== numericYear ||
    date.getUTCMonth() !== numericMonth - 1 ||
    date.getUTCDate() !== numericDay
  ) {
    return null;
  }

  return { townId, date };
};

export const handler = async (event) => {
  const origin = event.headers.origin || "*";
  const pathSegments = event.path.split("/").filter(Boolean);
  const functionIndex = pathSegments.findIndex((segment) => segment === "prayer-times");
  const params = getDateFromPath(pathSegments.slice(functionIndex + 1));

  if (!params) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Expected /prayer-times/:townId/:year/:month/:day" })
    };
  }

  const city = getCityByTownId(params.townId);
  if (!city) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Unknown townId" })
    };
  }

  try {
    const datum = getDateKey(params.date);
    const staticVakat = getStaticPrayerTimes(params.townId, params.date);
    const vakat = staticVakat || calculatePrayerTimes(city.lat, city.lng, params.date);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: city.townId,
        lokacija: city.label,
        datum,
        vakat,
        source: staticVakat ? "local-static" : "local-fallback"
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
