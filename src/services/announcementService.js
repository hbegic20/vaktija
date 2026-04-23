export async function fetchAnnouncements(endpoint) {
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Ne mogu učitati obavijesti.");
  }
  const data = await response.json();
  return Array.isArray(data.announcements) ? data.announcements : [];
}
