import { useEffect, useState } from "react";

export default function FetchUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Empty dependency array: runs once, when the component mounts.
  useEffect(() => {
    const controller = new AbortController();

    fetch("https://jsonplaceholder.typicode.com/users/1", { signal: controller.signal })
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

    return () => controller.abort();
  }, []);

  if (loading) return <p className="status">Loading…</p>;
  if (error) return <p className="status error">Something went wrong: {error}</p>;

  return (
    <div className="result">
      <h4>{user.name}</h4>
      <p>{user.email}</p>
    </div>
  );
}
