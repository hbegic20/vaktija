const WEATHER_MAP = {
  0: "Vedro",
  1: "Pretežno vedro",
  2: "Djelimično oblačno",
  3: "Oblačno",
  45: "Magla",
  48: "Smrznuta magla",
  51: "Slaba rosulja",
  53: "Umjerena rosulja",
  55: "Jaka rosulja",
  56: "Slaba ledena rosulja",
  57: "Jaka ledena rosulja",
  61: "Slaba kiša",
  63: "Umjerena kiša",
  65: "Jaka kiša",
  66: "Slaba ledena kiša",
  67: "Jaka ledena kiša",
  71: "Slab snijeg",
  73: "Umjeren snijeg",
  75: "Jak snijeg",
  80: "Slaba pljuska",
  81: "Umjerena pljuska",
  82: "Jaka pljuska",
  95: "Grmljavina",
  96: "Grmljavina s gradom",
  99: "Jaka grmljavina s gradom"
};

export async function fetchWeather(lat, lng) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current_weather: "true",
    windspeed_unit: "kmh"
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new Error("Ne mogu učitati vrijeme.");
  }

  const data = await response.json();
  const current = data?.current_weather;
  if (!current) {
    throw new Error("Neispravan odgovor za vrijeme.");
  }

  return {
    temperature: Math.round(current.temperature),
    windspeed: Math.round(current.windspeed),
    description: WEATHER_MAP[current.weathercode] || "Nepoznato"
  };
}
