import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/** Brief premium transition on every client-side route change. */
const LOADER_MS = 450;

export function RouteLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const isFirst = useRef(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    setVisible(true);

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setVisible(false);
      timer.current = null;
    }, LOADER_MS);

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [location.key]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      className={`route-loader ${visible ? "is-visible" : ""}`}
      aria-hidden={!visible}
      aria-busy={visible}
      role="status"
    >
      <div className="route-loader-inner">
        <img src="/assets/logo/smartchem.webp" alt="" className="route-loader-logo" />
        <div className="route-loader-line" />
      </div>
    </div>
  );
}
