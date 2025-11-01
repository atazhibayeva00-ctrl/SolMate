import { useEffect, useMemo, useState } from "react";


const DEFAULT_LAT = 37.8039;
const DEFAULT_LON = -122.4011;
const OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? "";

const TOKEN_PER_KWH = 10;
const BASE_PRICE = 1.0;
const MIN_FACTOR_BPS = 8000;
const MAX_FACTOR_BPS = 12000;

export default function Page() {
  const [tokens, setTokens] = useState(0);
  const [supply, setSupply] = useState(0);
  const [cash, setCash] = useState(0);
  const [price, setPrice] = useState(BASE_PRICE);
  const [lat, setLat] = useState(String(DEFAULT_LAT));
  const [lon, setLon] = useState(String(DEFAULT_LON));
  const [clouds, setClouds] = useState<number | null>(null);
  const [weatherDesc, setWeatherDesc] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [sellAmount, setSellAmount] = useState<number>(0);

  const factorBps = useMemo(() => {
    if (clouds === null) return 10000;
    const f = Math.round(((100 - clouds) * (MAX_FACTOR_BPS - MIN_FACTOR_BPS)) / 100 + MIN_FACTOR_BPS);
    return Math.max(MIN_FACTOR_BPS, Math.min(MAX_FACTOR_BPS, f));
  }, [clouds]);
  const factorText = (factorBps / 100).toFixed(2) + "x";

  const pushLog = (msg: string) =>
    setLog((p) => [new Date().toLocaleTimeString() + " — " + msg, ...p]);

  async function fetchWeather() {
    try {
      if (OWM_KEY) {
        const la = parseFloat(lat);
        const lo = parseFloat(lon);
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${la}&lon=${lo}&appid=${OWM_KEY}&units=metric`
        );
        const j = await res.json();
        const c = j?.clouds?.all ?? Math.floor(Math.random() * 100);
        const desc = j?.weather?.[0]?.description ?? "n/a";
        setClouds(Number(c));
        setWeatherDesc(String(desc));
        pushLog(`Weather: ${c}% clouds (${desc})`);
      } else {
        const c = Math.floor(Math.random() * 100);
        setClouds(c);
        setWeatherDesc("simulated");
        pushLog(`Weather simulated: ${c}% clouds`);
      }
    } catch {
      const c = Math.floor(Math.random() * 100);
      setClouds(c);
      setWeatherDesc("simulated-error");
      pushLog(`Weather fallback simulated: ${c}% clouds`);
    }
  }

  function simulateProduction() {
    const clr = clouds ?? Math.floor(Math.random() * 100);
    const base = Math.random() * 7.5 + 0.5;
    const prod = Math.max(0.1, Math.round((base * (100 - clr)) / 100 * 10) / 10);
    const minted = Math.round(prod * TOKEN_PER_KWH);
    setTokens((t) => t + minted);
    setSupply((s) => s + minted);
    setPrice((p) => {
      const newP = (p * 10000) / factorBps;
      pushLog(`Minted ${minted} SLR @ ${clr}% clouds → price ${p.toFixed(3)}→${newP.toFixed(3)}`);
      return Number(newP.toFixed(6));
    });
  }

  function useEnergy(burn: number) {
    if (burn <= 0 || burn > tokens) return;
    const before = supply;
    setTokens((t) => t - burn);
    setSupply((s) => s - burn);
    const pct = Math.round((burn * 10000) / (before || 1));
    setPrice((p) => {
      const newP = p * (1 + pct * 0.0005);
      pushLog(`Used ${burn} SLR → price ${p.toFixed(3)}→${newP.toFixed(3)}`);
      return Number(newP.toFixed(6));
    });
  }

  function sellExcess(amount: number) {
    if (amount <= 0 || amount > tokens) return;
    const cashOut = price * amount;
    setTokens((t) => t - amount);
    setSupply((s) => s - amount);
    setCash((c) => Number((c + cashOut).toFixed(2)));
    setPrice((p) => Number((p * 0.995).toFixed(6)));
    pushLog(`Sold ${amount} SLR for $${cashOut.toFixed(2)}`);
  }

  function resetSim() {
    setTokens(0);
    setSupply(0);
    setCash(0);
    setPrice(BASE_PRICE);
    setClouds(null);
    setWeatherDesc("");
    setLog([]);
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Inter, sans-serif" }}>
      <h1>☀️ SolarToken Simulator</h1>
      <p>Simple local demo — mint energy, burn it, and sell for cash.</p>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <h3>Wallet</h3>
          <div>Tokens: <b>{tokens}</b></div>
          <div>Cash: <b>${cash.toFixed(2)}</b></div>
        </div>
        <div>
          <h3>Market</h3>
          <div>Price: <b>{price.toFixed(3)}</b></div>
          <div>Total Supply: <b>{supply}</b></div>
        </div>
        <div>
          <h3>Weather</h3>
          <input value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: 90, marginRight: 6 }} />
          <input value={lon} onChange={(e) => setLon(e.target.value)} style={{ width: 90 }} />
          <button onClick={fetchWeather} style={{ marginLeft: 6 }}>Get Weather</button>
          <div>Clouds: <b>{clouds ?? "—"}%</b></div>
          <div>Desc: <b>{weatherDesc}</b></div>
          <div>Factor: <b>{factorText}</b></div>
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Actions</h3>
        <button onClick={simulateProduction}>☀️ Simulate Production</button>
        <button onClick={() => useEnergy(20)} style={{ marginLeft: 8 }}>⚡ Use 20 SLR</button>
        <input
          type="number"
          min="1"
          placeholder="Sell amount"
          value={sellAmount || ""}
          onChange={(e) => setSellAmount(Number(e.target.value))}
          style={{ width: 100, marginLeft: 8 }}
        />
        <button onClick={() => sellExcess(sellAmount)} style={{ marginLeft: 6 }}>💸 Sell</button>
        <button onClick={resetSim} style={{ marginLeft: 12 }}>Reset</button>
      </section>

      <section style={{ marginTop: 20 }}>
        <h4>Activity Log</h4>
        <div style={{ maxHeight: 250, overflowY: "auto", fontSize: 13 }}>
          {log.length === 0 ? <i>No activity yet.</i> : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </section>
    </main>
  );
}
