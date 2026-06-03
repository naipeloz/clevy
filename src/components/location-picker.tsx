"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";

type Country = { code: string; name: string };

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--fg-dim)",
};

const inputStyle: React.CSSProperties = {
  height: 44,
  padding: "10px 14px",
  background: "var(--bg)",
  color: "var(--fg)",
  border: "1px solid var(--hairline-strong)",
  borderRadius: 4,
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
};

export function LocationPicker({
  countryCode,
  city,
  onChange,
}: {
  countryCode: string | null;
  city: string | null;
  onChange: (next: { countryCode: string | null; city: string | null }) => void;
}) {
  const t = useT();
  const locale = useLocale();
  const countryLabel = t.location.country;
  const cityLabel = t.location.city;
  const [countries, setCountries] = useState<Country[]>([]);
  const [cityQuery, setCityQuery] = useState(city ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the country list once.
  useEffect(() => {
    let active = true;
    fetch(`/api/locations/countries?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setCountries(d.countries ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [locale]);

  // Debounced city lookup for the selected country. (Suggestions are cleared
  // in selectCountry when the country changes, so no sync setState here.)
  useEffect(() => {
    if (!countryCode) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const qs = new URLSearchParams({ country: countryCode, q: cityQuery });
      fetch(`/api/locations/cities?${qs.toString()}`)
        .then((r) => r.json())
        .then((d) => setSuggestions(d.cities ?? []))
        .catch(() => setSuggestions([]));
    }, 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [countryCode, cityQuery]);

  function selectCountry(code: string) {
    const next = code || null;
    setCityQuery("");
    setSuggestions([]);
    onChange({ countryCode: next, city: null });
  }

  function selectCity(name: string) {
    setCityQuery(name);
    setOpen(false);
    onChange({ countryCode, city: name });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={labelStyle}>{countryLabel}</span>
        <select
          value={countryCode ?? ""}
          onChange={(e) => selectCountry(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">{t.location.selectCountry}</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label
        style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}
      >
        <span style={labelStyle}>{cityLabel}</span>
        <input
          type="text"
          value={cityQuery}
          disabled={!countryCode}
          placeholder={countryCode ? t.location.typeToSearch : t.location.pickCountryFirst}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setOpen(true);
            onChange({ countryCode, city: e.target.value || null });
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={{ ...inputStyle, opacity: countryCode ? 1 : 0.6 }}
          autoComplete="off"
        />
        {open && suggestions.length > 0 ? (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              margin: "4px 0 0",
              padding: 0,
              listStyle: "none",
              maxHeight: 220,
              overflowY: "auto",
              background: "var(--bg)",
              border: "1px solid var(--hairline-strong)",
              borderRadius: 4,
              boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            }}
          >
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  // onMouseDown (before blur) so the click registers.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCity(name);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 14px",
                    background: "transparent",
                    border: "none",
                    fontSize: 14,
                    color: "var(--fg)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </label>
    </div>
  );
}
