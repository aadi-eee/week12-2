import WeatherDashboard from "./WeatherDashboard.jsx";
import weatherSrc from "./WeatherDashboard.jsx?raw";

// The separate page at #/weather. The dashboard draws its own sky background,
// so this page does not use the cream .site card.
export default function WeatherApp() {
  return (
    <WeatherDashboard
      header={
        <>
          <a className="wx-back" href="#">← Back to Week 12_2</a>
          <div className="wx-title-row">
            <h1 className="wx-title">
              Weather <span className="wx-title-script">today</span>
            </h1>
            <div className="wx-mascot" aria-hidden="true">
              <span className="wx-mascot-sun" />
              <span className="wx-mascot-cloud">
                <i className="wx-mascot-eye wx-mascot-eye-left" />
                <i className="wx-mascot-eye wx-mascot-eye-right" />
                <i className="wx-mascot-cheek wx-mascot-cheek-left" />
                <i className="wx-mascot-cheek wx-mascot-cheek-right" />
                <i className="wx-mascot-smile" />
              </span>
            </div>
          </div>
        </>
      }
      footer={
        <details className="wx-code">
          <summary>Show code</summary>
          <pre><code>{weatherSrc}</code></pre>
        </details>
      }
    />
  );
}