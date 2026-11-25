import PageTitleSync from "./components/PageTitleSync.jsx";
import FetchUser from "./components/FetchUser.jsx";
import Stopwatch from "./components/Stopwatch.jsx";
import WeatherDashboard from "./components/WeatherDashboard.jsx";
import GithubLookup from "./components/GithubLookup.jsx";

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
      <details className="example">
        <summary>Show code</summary>
        <pre><code>{code}</code></pre>
      </details>
    </article>
  );
}

export default function App() {
  return (
    <main className="site wide">
      <h1>
        useEffect & <span className="script">Weather Dashboard</span>
      </h1>
      <p className="lead">
        Fetching live data in React: effects that rerun when values change, clean up after
        themselves, and cancel requests that are no longer needed.
      </p>

      <h2>Homework & code challenge</h2>
      <div className="cards">
        <Card
          id="weather"
          tag="Homework"
          badge="☁"
          title="Weather dashboard"
          text="Search by city or by latitude and longitude. A useEffect refetches whenever the coordinates change."
          code={weatherSrc}
        >
          <WeatherDashboard />
        </Card>

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

      <h2>Practice exercises</h2>
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
          text="Loads jsonplaceholder user 1 once, when the component mounts."
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
