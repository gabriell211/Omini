"use client";

import { useEffect } from "react";
import { Logo } from "./logo";

export function SplashScreen() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => window.location.replace("/landing"), reducedMotion ? 700 : 2600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="splash" aria-label="Carregando Omni">
      <div className="splash-orbit splash-orbit-one" aria-hidden="true" />
      <div className="splash-orbit splash-orbit-two" aria-hidden="true" />
      <section className="splash-content">
        <div className="splash-logo"><Logo inverse /></div>
        <p>Uma plataforma para toda a sua operação.</p>
        <div className="splash-progress" aria-hidden="true"><i /></div>
      </section>
      <small className="splash-footer">GESTÃO QUE ACOMPANHA O SEU RITMO</small>
    </main>
  );
}
