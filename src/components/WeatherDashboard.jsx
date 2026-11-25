import { useEffect, useState } from "react";

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm with hail",
};

const RATE_LIMIT_MSG =
  "Open-Meteo is rate limiting requests right now. Wait a minute, then search again.";
const NETWORK_MSG = "Network problem. Check your connection and try again.";

export default function WeatherDashboard() {
  const [mode, setMode] = useState("city");
  const [city, setCity] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");

  const [coords, setCoords] = useState(null); // { lat, lon, label }
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refetch whenever the coordinates change.
  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${coords.lat}&longitude=${coords.lon}` +
      "&current=temperature_2m,wind_speed_10m,weather_code";

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (res.status === 429) throw new Error("RATE_LIMIT");
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json();
      })
      .then((data) => {
        setWeather({
          temp: data.current.temperature_2m,
          tempUnit: data.current_units.temperature_2m,
          wind: data.current.wind_speed_10m,
          windUnit: data.current_units.wind_speed_10m,
          description: WEATHER_CODES[data.current.weather_code] ?? "Unknown conditions",
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setWeather(null);
        if (err.message === "RATE_LIMIT") setError(RATE_LIMIT_MSG);
        else if (err.message.startsWith("HTTP_")) setError(`Weather service error (${err.message.slice(5)}).`);
        else setError(NETWORK_MSG);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // Cancel the previous request if coords change again or the component unmounts.
    return () => controller.abort();
  }, [coords]);

  async function searchCity() {
    const name = city.trim();
    if (!name) {
      setError("Enter a city name first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`
      );
      if (res.status === 429) throw new Error("RATE_LIMIT");
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setWeather(null);
        setLoading(false);
        setError(`No city found for "${name}". Check the spelling or try coordinates.`);
        return;
      }
      const place = data.results[0];
      const label = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
      setCoords({ lat: place.latitude, lon: place.longitude, label });
    } catch (err) {
      setWeather(null);
      setLoading(false);
      setError(err.message === "RATE_LIMIT" ? RATE_LIMIT_MSG : NETWORK_MSG);
    }
  }

  function searchCoords() {
    const lat = Number(latInput);
    const lon = Number(lonInput);
    if (latInput.trim() === "" || lonInput.trim() === "" || Number.isNaN(lat) || Number.isNaN(lon)) {
      setError("Latitude and longitude must both be numbers.");
      return;
    }
    if (lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90.");
      return;
    }
    if (lon < -180 || lon > 180) {
      setError("Longitude must be between -180 and 180.");
      return;
    }
    setError("");
    setCoords({ lat, lon, label: `${lat.toFixed(2)}, ${lon.toFixed(2)}` });
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support geolocation.");
      return;
    }
    setError("");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: "Your location",
        });
      },
      (err) => {
        setLoading(false);
        setWeather(null);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. Search by city instead."
            : "Couldn't detect your location. Search by city instead."
        );
      }
    );
  }

  function onSubmit(e) {
    e.preventDefault();
    if (mode === "city") searchCity();
    else searchCoords();
  }

  return (
    <div className="stack">
      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === "city"}
          className={mode === "city" ? "tab active" : "tab"}
          onClick={() => setMode("city")}
        >
          City name
        </button>
        <button
          role="tab"
          aria-selected={mode === "coords"}
          className={mode === "coords" ? "tab active" : "tab"}
          onClick={() => setMode("coords")}
        >
          Latitude / longitude
        </button>
      </div>

      <form className="stack" onSubmit={onSubmit}>
        {mode === "city" ? (
          <label className="field">
            <span>City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Seoul" />
          </label>
        ) : (
          <div className="row">
            <label className="field grow">
              <span>Latitude</span>
              <input value={latInput} onChange={(e) => setLatInput(e.target.value)} placeholder="37.57" inputMode="decimal" />
            </label>
            <label className="field grow">
              <span>Longitude</span>
              <input value={lonInput} onChange={(e) => setLonInput(e.target.value)} placeholder="126.98" inputMode="decimal" />
            </label>
          </div>
        )}
        <div className="row">
          <button type="submit" disabled={loading}>Get weather</button>
          <button type="button" onClick={useMyLocation} disabled={loading}>
            Use my location
          </button>
        </div>
      </form>

      {loading && <p className="status">Loading weather…</p>}
      {error && <p className="status error" role="alert">{error}</p>}

      {weather && !loading && !error && (
        <div className="result weather">
          <p className="place">{coords.label}</p>
          <p className="big">{weather.temp}{weather.tempUnit}</p>
          <p>{weather.description}</p>
          <p className="hint">Wind {weather.wind} {weather.windUnit}</p>
        </div>
      )}
    </div>
  );
}
