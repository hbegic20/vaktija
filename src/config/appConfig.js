export default {
  mosqueName: "Džamija Vesela Bugojno",
  defaultCity: "bugojno",
  cities: {
    bugojno: { label: "Bugojno", lat: 44.057, lng: 17.451, townId: 16 },
    sarajevo: { label: "Sarajevo", lat: 43.8563, lng: 18.4131, townId: 77 },
    travnik: { label: "Travnik", lat: 44.226, lng: 17.665, townId: 90 }
  },
  kaaba: { lat: 21.4225, lng: 39.8262 },
  ramadan: {
    start: "2026-02-19",
    end: "2026-03-19",
    eid: "2026-03-20"
  },
  bajrams: [
    { label: "Ramazanski Bajram", date: "2026-03-20" },
    { label: "Kurban Bajram", date: "2026-05-27" },
    { label: "Ramazanski Bajram", date: "2027-03-10" },
    { label: "Kurban Bajram", date: "2027-05-17" }
  ],
  announcements: {
    endpoint: "/.netlify/functions/announcements",
    pollMs: 120000,
    adminPin: "1234"
  },
  prayerApi: {
    baseUrl: "https://api.vaktija.ba/vaktija/v1"
  }
};
