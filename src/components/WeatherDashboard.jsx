import { useEffect, useState } from "react";
import "./weather.css";

// weather code -> [description, scene kind]
const CODES = {
  0: ["Clear sky", "clear"],
  1: ["Mainly clear", "clear"],
  2: ["Partly cloudy", "partly"],
  3: ["Overcast", "cloud"],
  45: ["Fog", "fog"],
  48: ["Rime fog", "fog"],
  51: ["Light drizzle", "rain"],
  53: ["Drizzle", "rain"],
  55: ["Heavy drizzle", "rain"],
  56: ["Freezing drizzle", "rain"],
  57: ["Heavy freezing drizzle", "rain"],
  61: ["Light rain", "rain"],
  63: ["Rain", "rain"],
  65: ["Heavy rain", "rain"],
  66: ["Freezing rain", "rain"],
  67: ["Heavy freezing rain", "rain"],
  71: ["Light snow", "snow"],
  73: ["Snow", "snow"],
  75: ["Heavy snow", "snow"],
  77: ["Snow grains", "snow"],
  80: ["Light rain showers", "rain"],
  81: ["Rain showers", "rain"],
  82: ["Violent rain showers", "rain"],
  85: ["Light snow showers", "snow"],
  86: ["Heavy snow showers", "snow"],
  95: ["Thunderstorm", "storm"],
  96: ["Thunderstorm with hail", "storm"],
  99: ["Severe thunderstorm with hail", "storm"],
};
const EMOJI = { clear: "☀️", partly: "⛅", cloud: "☁️", fog: "🌫️", rain: "🌧️", snow: "❄️", storm: "⛈️" };
const QUICK_CITIES = ["Seoul", "Tokyo", "London", "New York"];

const RATE_LIMIT_MSG = "Open-Meteo is rate limiting requests right now. Wait a minute, then search again.";
const NETWORK_MSG = "Network problem. Check your connection and try again.";

function lookup(code) {
  const [label, kind] = CODES[code] ?? ["Unknown conditions", "cloud"];
  return { label, kind };
}

/* ---------- The dreamy sky behind the whole page ---------- */
const STAR_POINTS = "12,2.5 14.9,8.6 21.5,9.4 16.6,14 17.9,20.5 12,17.2 6.1,20.5 7.4,14 2.5,9.4 9.1,8.6";
const STAR_COLORS = ["#ffffff", "#f7d4ea", "#9fe6ee", "#c9c3f5", "#fff3b8"];

// Fixed positions (computed, not random) so the sky doesn't jump around on every render
const BIG_STARS = Array.from({ length: 12 }, (_, i) => ({
  left: ((i * 29 + 7) % 92) + 2,
  top: ((i * 41 + 5) % 82) + 4,
  size: 18 + ((i * 13) % 28),
  color: STAR_COLORS[i % 5],
  delay: (i * 0.9) % 6,
}));
const SPARKS = Array.from({ length: 30 }, (_, i) => ({
  left: ((i * 17 + 3) % 98) + 1,
  top: ((i * 23 + 9) % 94) + 2,
  size: 3 + (i % 3) * 1.5,
  delay: (i * 0.5) % 4,
}));
const BUBBLES = Array.from({ length: 9 }, (_, i) => ({
  left: ((i * 37 + 11) % 88) + 4,
  top: ((i * 29 + 13) % 80) + 6,
  size: 22 + ((i * 17) % 44),
  delay: (i * 1.3) % 8,
  dur: 9 + (i % 4) * 2,
}));
const WISH_TRAIL = Array.from({ length: 16 }, (_, i) => ({
  x: 24 + ((i * 7) % 11) - 5,
  y: 70 + i * 9,
  size: 2 + (i % 3),
  delay: (i * 0.3) % 2.6,
}));
const CLOUDS = [
  { top: "10%", dur: 60, delay: -20, scale: 1.1 },
  { top: "26%", dur: 78, delay: -50, scale: 0.8 },
  { top: "46%", dur: 70, delay: -8, scale: 1 },
  { top: "64%", dur: 88, delay: -60, scale: 0.9 },
];
const DROPS = Array.from({ length: 40 }, (_, i) => ({ left: (i * 2.7) % 100, delay: (i * 0.23) % 2, dur: 0.9 + (i % 5) * 0.15 }));
const FLAKES = Array.from({ length: 36 }, (_, i) => ({ left: (i * 2.9) % 100, delay: (i * 0.8) % 9, dur: 7 + (i % 4) * 1.5, size: 4 + (i % 3) * 2 }));

function StarShape({ color }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <polygon points={STAR_POINTS} fill={color} stroke={color} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function Sky({ kind, night }) {
  const clearSky = kind === "clear" || kind === "partly";
  const cloudCount =
    kind === "cloud" ? 4 : kind === "partly" ? 2 : kind === "rain" || kind === "storm" ? 3 : kind === "snow" ? 2 : 0;

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-items">
        {BUBBLES.map((b, i) => (
          <i
            key={`b${i}`}
            className="sky-bubble"
            style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size, "--delay": `${b.delay}s`, "--dur": `${b.dur}s` }}
          />
        ))}
        {BIG_STARS.map((s, i) => (
          <span
            key={`s${i}`}
            className="sky-star"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, "--delay": `${s.delay}s` }}
          >
            <StarShape color={s.color} />
          </span>
        ))}
        {SPARKS.map((s, i) => (
          <i
            key={`p${i}`}
            className="sky-spark"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, "--delay": `${s.delay}s` }}
          />
        ))}
        <div className="sky-wish">
          <span className="sky-star"><StarShape color="#fffbd6" /></span>
          {WISH_TRAIL.map((t, i) => (
            <i key={i} style={{ left: `${t.x}px`, top: `${t.y}px`, width: t.size, height: t.size, "--delay": `${t.delay}s` }} />
          ))}
        </div>
      </div>

      <div className="sky-weather">
        {clearSky && !night && <div className="sky-sun" />}
        {clearSky && night && <div className="sky-moon" />}

        {CLOUDS.slice(0, cloudCount).map((c, i) => (
          <div key={i} className="sky-cloud" style={{ top: c.top, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
            <div className="sky-cloud-in" style={{ "--s": c.scale }} />
          </div>
        ))}

        {(kind === "rain" || kind === "storm") &&
          DROPS.map((d, i) => (
            <i key={i} className="sky-drop" style={{ left: `${d.left}%`, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
          ))}

        {kind === "snow" &&
          FLAKES.map((f, i) => (
            <i
              key={i}
              className="sky-flake"
              style={{ left: `${f.left}%`, width: f.size, height: f.size, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }}
            />
          ))}

        {kind === "fog" &&
          ["30%", "52%", "72%"].map((top, i) => <div key={i} className="sky-fog" style={{ top, animationDelay: `${-i * 3}s` }} />)}

        {kind === "storm" && <div className="sky-flash" />}
      </div>
    </div>
  );
}

/* ---------- Temperature that counts up from 0 ---------- */
function CountUp({ value }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 800);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{shown}</>;
}

function dayName(date, index) {
  if (index === 0) return "Today";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

export default function WeatherDashboard({ header, footer }) {
  const [mode, setMode] = useState("city");
  const [city, setCity] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");

  const [coords, setCoords] = useState(null); // { lat, lon, name, sub }
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Give the whole page the sky background while this page is open.
  useEffect(() => {
    document.body.classList.add("wx-body");
    return () => document.body.classList.remove("wx-body");
  }, []);

  // Refetch whenever the coordinates change.
  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${coords.lat}&longitude=${coords.lon}` +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=auto&forecast_days=5";

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (res.status === 429) throw new Error("RATE_LIMIT");
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json();
      })
      .then((json) => {
        const c = json.current;
        const d = json.daily;
        setData({
          stamp: Date.now(),
          temp: c.temperature_2m,
          feels: c.apparent_temperature,
          humidity: c.relative_humidity_2m,
          wind: c.wind_speed_10m,
          windUnit: json.current_units.wind_speed_10m,
          isDay: c.is_day === 1,
          code: c.weather_code,
          daily: d.time.map((date, i) => ({
            date,
            code: d.weather_code[i],
            max: Math.round(d.temperature_2m_max[i]),
            min: Math.round(d.temperature_2m_min[i]),
          })),
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setData(null);
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

  async function searchCity(nameArg) {
    const name = (nameArg ?? city).trim();
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
      const json = await res.json();
      if (!json.results || json.results.length === 0) {
        setData(null);
        setLoading(false);
        setError(`No city found for "${name}". Check the spelling or try coordinates.`);
        return;
      }
      const place = json.results[0];
      setCoords({
        lat: place.latitude,
        lon: place.longitude,
        name: place.name,
        sub: [place.admin1, place.country].filter(Boolean).join(", "),
      });
    } catch (err) {
      setData(null);
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
    setCoords({ lat, lon, name: "Custom spot", sub: `${lat.toFixed(2)}, ${lon.toFixed(2)}` });
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
          name: "Your location",
          sub: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
        });
      },
      (err) => {
        setLoading(false);
        setData(null);
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

  function pickCity(name) {
    setMode("city");
    setCity(name);
    searchCity(name);
  }

  // Values for the main panel
  const scene = data ? lookup(data.code) : null;
  const night = data ? !data.isDay : false;
  const todayRange = data ? data.daily[0] : null;
  let weekLow = 0;
  let weekSpan = 1;
  if (data) {
    weekLow = Math.min(...data.daily.map((d) => d.min));
    weekSpan = Math.max(...data.daily.map((d) => d.max)) - weekLow || 1;
  }

  return (
    <div className="wx" data-kind={scene ? scene.kind : "clear"} data-day={night ? "night" : "day"}>
      <Sky kind={scene ? scene.kind : "clear"} night={night} />

      <div className="wx-wrap">
        {header}

        <section className="wx-search">
          <div className="wx-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "city"}
              className={mode === "city" ? "wx-btn active" : "wx-btn"}
              onClick={() => setMode("city")}
            >
              City
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "coords"}
              className={mode === "coords" ? "wx-btn active" : "wx-btn"}
              onClick={() => setMode("coords")}
            >
              Coordinates
            </button>
          </div>

          <form className="wx-row" onSubmit={onSubmit}>
            {mode === "city" ? (
              <label className="wx-field">
                <span>City name</span>
                <input className="wx-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Seoul" />
              </label>
            ) : (
              <>
                <label className="wx-field">
                  <span>Latitude</span>
                  <input className="wx-input" value={latInput} onChange={(e) => setLatInput(e.target.value)} placeholder="37.57" inputMode="decimal" />
                </label>
                <label className="wx-field">
                  <span>Longitude</span>
                  <input className="wx-input" value={lonInput} onChange={(e) => setLonInput(e.target.value)} placeholder="126.98" inputMode="decimal" />
                </label>
              </>
            )}
            <button className="wx-btn primary" type="submit" disabled={loading}>Get weather</button>
            <button className="wx-btn" type="button" onClick={useMyLocation} disabled={loading}>
              📍 Use my location
            </button>
          </form>
        </section>

        {error && <p className="wx-error" role="alert">{error}</p>}

        {loading && (
          <div className="wx-loading" role="status">
            <div className="wx-dots" aria-hidden="true"><i /><i /><i /></div>
            <p>Loading weather…</p>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="wx-empty">
            <div className="wx-empty-ico" aria-hidden="true">⛅</div>
            <p>Search a city, enter coordinates, or try one of these.</p>
            <div className="wx-row">
              {QUICK_CITIES.map((name) => (
                <button key={name} type="button" className="wx-btn" onClick={() => pickCity(name)}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {data && !loading && !error && (
          <>
            <section className="wx-hero">
              <div className="wx-content" key={data.stamp}>
                <p className="wx-place script">{coords.name}</p>
                <p className="wx-sub">{coords.sub}</p>
                <p className="wx-temp">
                  <CountUp value={Math.round(data.temp)} />
                  <span>°</span>
                </p>
                <p className="wx-desc">{scene.label}</p>
                <p className="wx-hilo">
                  High {todayRange.max}° / Low {todayRange.min}°
                </p>
              </div>
            </section>

            <div className="wx-stats" key={`stats-${data.stamp}`}>
              <div className="wx-stat" style={{ "--i": 0 }}>
                <svg className="wx-fan-icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                  <g className="wx-fan" style={{ animationDuration: `${Math.max(0.5, 5 - data.wind / 6)}s` }}>
                    <ellipse cx="12" cy="6" rx="2.6" ry="5" />
                    <ellipse cx="12" cy="6" rx="2.6" ry="5" transform="rotate(120 12 12)" />
                    <ellipse cx="12" cy="6" rx="2.6" ry="5" transform="rotate(240 12 12)" />
                  </g>
                  <circle className="wx-hub" cx="12" cy="12" r="1.8" />
                </svg>
                <span>Wind</span>
                <strong>{data.wind} {data.windUnit}</strong>
              </div>
              <div className="wx-stat" style={{ "--i": 1 }}>
                <div className="wx-ico" aria-hidden="true">💧</div>
                <span>Humidity</span>
                <strong>{data.humidity}%</strong>
              </div>
              <div className="wx-stat" style={{ "--i": 2 }}>
                <div className="wx-ico" aria-hidden="true">🌡️</div>
                <span>Feels like</span>
                <strong>{Math.round(data.feels)}°</strong>
              </div>
            </div>

            <h2 className="wx-h">Next 5 days</h2>
            <div className="wx-forecast" key={`days-${data.stamp}`}>
              {data.daily.map((d, i) => (
                <div className="wx-day" key={d.date} style={{ "--i": i }}>
                  <div className="wx-day-name">{dayName(d.date, i)}</div>
                  <div className="wx-day-ico" aria-hidden="true">{EMOJI[lookup(d.code).kind]}</div>
                  <div className="wx-day-hi">{d.max}°</div>
                  <div className="wx-day-lo">{d.min}°</div>
                  <div className="wx-bar" aria-hidden="true">
                    <i
                      style={{
                        left: `${((d.min - weekLow) / weekSpan) * 100}%`,
                        width: `${Math.max(((d.max - d.min) / weekSpan) * 100, 8)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {footer}
      </div>
    </div>
  );
}