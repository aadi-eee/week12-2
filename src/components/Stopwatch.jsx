import { useEffect, useState } from "react";

function format(totalCentis) {
  const mins = Math.floor(totalCentis / 6000);
  const secs = Math.floor((totalCentis % 6000) / 100);
  const centis = totalCentis % 100;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(mins)}:${pad(secs)}.${pad(centis)}`;
}

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [centis, setCentis] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setCentis((c) => c + 1), 10);
    // Cleanup: runs on Stop, Reset and unmount, so no interval is ever leaked.
    return () => clearInterval(id);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setCentis(0);
  };

  return (
    <div className="stack">
      <div className="big-count">{format(centis)}</div>
      <div className="btn-row">
        <button onClick={() => setRunning(true)} disabled={running}>Start</button>
        <button onClick={() => setRunning(false)} disabled={!running}>Stop</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
