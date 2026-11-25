import { useEffect, useState } from "react";

export default function GithubLookup() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounce: wait 500ms after the last keystroke before updating the query.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(input.trim()), 500);
    return () => clearTimeout(timer);
  }, [input]);

  // Fetch whenever the query changes; abort the previous request first.
  useEffect(() => {
    if (!query) {
      setUser(null);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`https://api.github.com/users/${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (res.status === 404) throw new Error("NOT_FOUND");
        if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMIT");
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setUser(null);
        if (err.message === "NOT_FOUND") setError(`No GitHub user named "${query}".`);
        else if (err.message === "RATE_LIMIT") setError("GitHub's rate limit was reached. Try again in a few minutes.");
        else if (err.message.startsWith("HTTP_")) setError(`GitHub returned an error (${err.message.slice(5)}).`);
        else setError("Network problem. Check your connection and try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  function onSubmit(e) {
    e.preventDefault();
    setQuery(input.trim()); // Search skips the debounce wait
  }

  return (
    <div className="stack">
      <form className="row" onSubmit={onSubmit}>
        <label className="field grow">
          <span>GitHub username</span>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="aadi-eee" />
        </label>
        <button className="align-end" type="submit">Search</button>
      </form>

      {loading && <p className="status">Searching…</p>}
      {error && <p className="status error" role="alert">{error}</p>}

      {user && !loading && !error && (
        <div className="result profile">
          <img src={user.avatar_url} alt={`${user.login}'s avatar`} width="88" height="88" />
          <div>
            <h4>{user.name || user.login}</h4>
            <p className="hint">@{user.login}</p>
            {user.bio && <p>{user.bio}</p>}
            <p className="hint">
              {user.followers} followers · {user.public_repos} public repos
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
