import { useEffect, useState } from "react";

// The part that owns the effect. Mounting it starts syncing; unmounting restores the title.
function TitleSyncer({ title }) {
  useEffect(() => {
    document.title = title || "WebPro";
    return () => {
      document.title = "WebPro";
    };
  }, [title]);

  return <p className="hint">The browser tab now reads: <strong>{title || "WebPro"}</strong></p>;
}

export default function PageTitleSync() {
  const [title, setTitle] = useState("");
  const [mounted, setMounted] = useState(true);

  return (
    <div className="stack">
      <label className="field">
        <span>Page title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Type to change the tab title"
        />
      </label>

      {mounted && <TitleSyncer title={title} />}

      <button onClick={() => setMounted((m) => !m)}>
        {mounted ? "Unmount syncer (restores WebPro)" : "Mount syncer again"}
      </button>
    </div>
  );
}
