import { useEffect, useState } from "react";

export default function FetchUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);
  const [badUrl, setBadUrl] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let timer;

    setLoading(true);
    setError("");
    setUser(null);

    const request = () => {
      const url = badUrl
        ? "https://jsonplaceholder.typicode.com/users/9999"
        : "https://jsonplaceholder.typicode.com/users/1";

      fetch(url, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`Server answered ${res.status}`);
          return res.json();
        })
        .then((data) => setUser(data))
        .catch((err) => {
          if (err.name === "AbortError") return;
          setError(err.message || "Could not load the user.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    };

    timer = setTimeout(request, slow ? 1500 : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [attempt, slow, badUrl]);

  return (
    <div>
      {loading && <p className="status">Loading…</p>}
      {error && <p className="status error" role="alert">Something went wrong: {error}</p>}

      {user && !loading && !error && (
        <div className="result">
          <h4>{user.name}</h4>
          <p>{user.email}</p>
        </div>
      )}

      <label>
        <input
          type="checkbox"
          checked={slow}
          onChange={(event) => setSlow(event.target.checked)}
        />
        {" "}Slow network (+1.5s)
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={badUrl}
          onChange={(event) => setBadUrl(event.target.checked)}
        />
        {" "}Use a bad URL (/users/9999)
      </label>
      <br />
      <button type="button" onClick={() => setAttempt((value) => value + 1)}>
        Remount &amp; fetch again
      </button>
    </div>
  );
}
