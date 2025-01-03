import React, { useState, useEffect } from "react";
import axios from "axios";
import { VegaLite } from "react-vega";
import { Select, Typography } from "@mui/material";

export default function App() {
  const [Daten, setDaten] = useState([]);
  const [gefiltert, setGefiltert] = useState([]);
  const [standort, setStandort] = useState([]);
  const [gewstandort, setGewstandort] = useState(""); // Default auf ersten Standort setzen
  const [attribut, setAttribut] = useState("T"); // Standard: Temperatur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Daten von der API abrufen
    axios
      .get(
        "https://3050widprojektarbeitaebimanuel.vercel.app/api/py/meteodaten"
      )
      .then((response) => {
        const apiData = response.data;

        // Einzigartige Standorte extrahieren, "All" entfernen
        const uniqueStandorte = [
          ...new Set(apiData.map((item) => item.Standortname)),
        ];

        setDaten(apiData);
        setGefiltert(apiData);
        setStandort(uniqueStandorte);
        setGewstandort(uniqueStandorte[0]); // Erster Standort als Standardwert
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Daten filtern, wenn der Standort oder das Attribut geändert wird
    const newGefiltert = Daten.filter(
      (item) => item.Standortname === gewstandort
    );
    setGefiltert(newGefiltert);
  }, [gewstandort, Daten]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Vega-Lite-Spezifikation für das Diagramm
  const spec = {
    width: 800,
    height: 400,
    title: `Wetterdaten für ${gewstandort}`,
    data: { values: gefiltert },
    encoding: {
      x: {
        field: "Datum",
        type: "temporal",
        title: "Datum",
        scale: {
          domain: [
            Math.min(...gefiltert.map((d) => d.Datum)),
            Math.max(...gefiltert.map((d) => d.Datum)),
          ],
        },
        timeUnit: "yearmonthdatehours", // Zeigt Datum und Uhrzeit auf der x-Achse an
      },
      y: {
        field: attribut,
        type: "quantitative",
        title: getAttributeTitle(attribut),
      },
      tooltip: [
        { field: "Standortname", type: "nominal", title: "Standort" },
        {
          field: "Datum",
          type: "temporal",
          title: "Datum",
          format: "%Y-%m-%d %H:%M",
        },
        {
          field: attribut,
          type: "quantitative",
          title: getAttributeTitle(attribut),
        },
      ],
    },
    mark: "line", // Diagrammtyp auf "line" setzen
  };

  // Hilfsfunktion, um den Titel für das Attribut zu bekommen
  function getAttributeTitle(attribute) {
    switch (attribute) {
      case "RainDur":
        return "Regensdauer (min)";
      case "T":
        return "Temperatur (°C)";
      case "p":
        return "Luftdruck (hPa)";
      default:
        return "";
    }
  }

  return (
    <>
      <h1>Wetterdaten-Visualisierung</h1>
      <h3>Nach Standort und Attribut Filtern</h3>
      {/* Standort Dropdown */}
      <label>
        Standort:
        <select
          value={gewstandort}
          onChange={(e) => setGewstandort(e.target.value)}
        >
          {standort.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </label>
      {/* Attribut Dropdown */}
      <label>
        Attribut:
        <select value={attribut} onChange={(e) => setAttribut(e.target.value)}>
          <option value="T">Temperatur (°C)</option>
          <option value="RainDur">Regensdauer (min)</option>
          <option value="p">Luftdruck (hPa)</option>
        </select>
        <h2>Mit Maus über Graf fahren für Infos</h2>
        {/* Diagramm */}
        <VegaLite spec={spec} />
      </label>
    </>
  );
}
