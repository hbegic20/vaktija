import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getStore } from "@netlify/blobs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULTS_PATH = path.join(__dirname, "..", "..", "src", "data", "announcements.json");

const readDefaults = () => {
  try {
    const raw = fs.readFileSync(DEFAULTS_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const validateAnnouncements = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const handler = async (event) => {
  const origin = event.headers.origin || "*";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-admin-pin"
      }
    };
  }

  const store = getStore("vaktija-tv");
  const adminPin = process.env.ANNOUNCEMENTS_ADMIN_PIN;

  if (event.httpMethod === "GET") {
    const data = await store.get("announcements", { type: "json" });
    const announcements = validateAnnouncements(data) ? data : readDefaults();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin
      },
      body: JSON.stringify({ announcements })
    };
  }

  if (event.httpMethod === "POST") {
    if (adminPin && event.headers["x-admin-pin"] !== adminPin) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": origin },
        body: "Unauthorized"
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": origin },
        body: "Invalid JSON"
      };
    }

    if (!validateAnnouncements(payload.announcements)) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": origin },
        body: "Invalid announcements"
      };
    }

    await store.set("announcements", payload.announcements, {
      contentType: "application/json"
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin
      },
      body: JSON.stringify({ ok: true })
    };
  }

  return {
    statusCode: 405,
    headers: { "Access-Control-Allow-Origin": origin },
    body: "Method Not Allowed"
  };
};
