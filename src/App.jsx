import { useEffect, useState } from "react";

import PageTitleSync from "./components/PageTitleSync.jsx";
import FetchUser from "./components/FetchUser.jsx";
import Stopwatch from "./components/Stopwatch.jsx";
import WeatherDashboard from "./components/WeatherDashboard.jsx";
import GithubLookup from "./components/GithubLookup.jsx";
import WeatherApp from "./components/WeatherApp.jsx";

// ?raw gives the component's own source text, so "Show code" is always up to date
import weatherSrc from "./components/WeatherDashboard.jsx?raw";
import githubSrc from "./components/GithubLookup.jsx?raw";
import e1Src from "./components/PageTitleSync.jsx?raw";
import e2Src from "./components/FetchUser.jsx?raw";
import e3Src from "./components/Stopwatch.jsx?raw";

function Card({ id, tag, badge, title, text, code, children }) {
  return (
    <article className="card" id={id}>
      {tag && <span className="tag">{tag}</span>}
      <div className="card-head">
        <span className="badge" aria-hidden="true">{badge}</span>
        <h2>{title}</h2>
      </div>
      <p className="card-text">{text}</p>
      <div className="card-body">{children}</div>
      {code && (
        <details className="example">
          <summary>Show code</summary>
          <pre><code>{code}</code></pre>
        </details>
      )}
    </article>
  );
}

/* ---------- Separate page: #/weather ---------- */
function WeatherPage() {
  return (
    <main className="site">
      <a className="back" href="#">← Back to Week 12_2</a>
      <h1>
        <span className="script">Weather</span> dashboard
      </h1>
      <p className="lead">
        Search by city name or latitude/longitude and see the current temperature, wind speed and weather description from the Open-Meteo API. 
        A useEffect refetches whenever the coordinates change, with loading and error states, plus auto-detecting your location with navigator. 
      </p>

      <div className="cards">
        <Card
          tag="Homework"
          badge="☁"
          title="Open-Meteo weather"
          text="Current temperature, wind speed and conditions, with loading and error states."
          code={weatherSrc}
        >
          <WeatherDashboard />
        </Card>
      </div>
    </main>
  );
}

/* ---------- Main page ---------- */
function HomePage() {
  return (
    <main className="site wide">
      <h1>
        useEffect & <span className="script">Weather Dashboard</span>
      </h1>
      <p className="lead">
        Fetching live data in React: effects that rerun when values change, clean up after
        themselves, and cancel requests that are no longer needed.
      </p>
      <nav className="section-links" aria-label="Jump to section">
        <a className="cta" href="#weather">See weather dashboard</a>
        <a className="cta" href="#github">See code challenge</a>
        <a className="cta" href="#practice">See practice exercises</a>
      </nav>

      <h2 id="code-challenge">Homework & code challenge</h2>
      <div className="cards">
        <article className="card" id="weather">
          <span className="tag">Homework</span>
          <div className="card-head">
            <span className="badge" aria-hidden="true">☁</span>
            <h2>Weather dashboard</h2>
          </div>
          <p className="card-text">
            Search by city name or latitude/longitude and see the current temperature, 
            wind speed and weather description from the Open-Meteo API. 
          </p>
          <div className="card-body">
            <a className="cta" href="#/weather">Open weather dashboard</a>
          </div>
        </article>

        <Card
          id="github"
          tag="Code challenge"
          badge="@"
          title="GitHub user lookup"
          text="Searches 500ms after you stop typing, or right away with Search. Each new request aborts the previous one."
          code={githubSrc}
        >
          <GithubLookup />
        </Card>
      </div>

      <h2 id="practice">Practice exercises</h2>
      <div className="cards">
        <Card
          id="e1"
          badge="E1"
          title="Page title sync"
          text="Typing updates the browser tab title. Unmounting the syncer puts it back to WebPro."
          code={e1Src}
        >
          <PageTitleSync />
        </Card>

        <Card
          id="e2"
          badge="E2"
          title="Fetch a user from an API"
          text="Loads a JSONPlaceholder user and demonstrates rerunning effects, cleanup, cancellation, loading states and errors."
          code={e2Src}
        >
          <FetchUser />
        </Card>

        <Card
          id="e3"
          badge="E3"
          title="Stopwatch with cleanup"
          text="Start, Stop and Reset drive a setInterval inside useEffect, cleared with clearInterval."
          code={e3Src}
        >
          <Stopwatch />
        </Card>
      </div>
    </main>
  );
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      const nextHash = window.location.hash;
      setHash(nextHash);
      if (nextHash === "#/weather") {
        window.scrollTo(0, 0);
      } else if (nextHash.startsWith("#")) {
        requestAnimationFrame(() => {
          document.querySelector(nextHash)?.scrollIntoView({ block: "start" });
        });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash === "#/weather" ? <WeatherApp /> : <HomePage />;
}