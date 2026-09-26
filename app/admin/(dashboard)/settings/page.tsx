"use client";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [gstPercent, setGstPercent] = useState("5");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      setRestaurantName(data.restaurantName);
      setGstPercent(String(data.gstPercent));
    });
  }, []);

  async function save() {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantName, gstPercent }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-display font-bold mb-6">Settings</h1>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-white/50">Restaurant Name</label>
          <input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="w-full mt-1 bg-charcoal-800 rounded-lg px-3 py-2.5 text-sm border border-white/5" />
        </div>
        <div>
          <label className="text-xs text-white/50">GST Percentage (%)</label>
          <input value={gstPercent} onChange={(e) => setGstPercent(e.target.value)} type="number" step="0.1" className="w-full mt-1 bg-charcoal-800 rounded-lg px-3 py-2.5 text-sm border border-white/5" />
          <p className="text-[11px] text-white/30 mt-1">Applied automatically to every customer order.</p>
        </div>
        <button onClick={save} className="w-full py-2.5 rounded-xl gold-gradient text-charcoal-950 font-bold flex items-center justify-center gap-2">
          <Save size={16} /> {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
