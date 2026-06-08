import { useEffect, useRef, useState } from "react";

const BREW_MS = 2400;
const SQUARES = 20;

const TIPS = [
  "Stirring the cauldron...",
  "Consulting the orb...",
  "Brewing deep thoughts...",
  "Summoning a hot take...",
  "Reading the vibes...",
  "Channeling the cosmos...",
  "Conjuring a spark...",
  "Infusing with energy...",
  "Aligning the stars...",
  "Tuning the frequencies...",
  "Sipping the brew...",
  "Whispering to the spirits...",
  "Decoding the matrix...",
  "Charging the essence...",
  "Honing the intuition...",
  "Sifting through the ether...",
  "Balancing the elements...",
  "Extracting the wisdom...",
  "Melding the energies...",
  "Transmuting the thoughts...",
];

export default function BrewingScreen({ onDone }) {
  const [squares, setSquares] = useState(0);
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const doneCalledRef = useRef(false);

  useEffect(() => {
    const start = Date.now();
    let raf;
    function tick() {
      const pct = Math.min(1, (Date.now() - start) / BREW_MS);
      setSquares(Math.round(pct * SQUARES));
      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneCalledRef.current) {
        doneCalledRef.current = true;
        setTimeout(onDone, 150);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="brewing-screen">
      <p className="brewing-tip">{TIPS[tipIdx]}</p>

      {/* 8bitcn segmented bar */}
      <div className="brew-bar-outer">
        <div className="brew-bar-inner">
          {Array.from({ length: SQUARES }).map((_, i) => (
            <div key={i} className={`brew-square${i < squares ? " filled" : ""}`} />
          ))}
        </div>
      </div>

      <p className="brew-pct">{Math.round((squares / SQUARES) * 100)}%</p>
    </div>
  );
}
