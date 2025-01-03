import React, { useState, useEffect } from "react";
import axios from "axios";
import { VegaLite } from "react-vega";

export default function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState("T"); // Standard: Temperatur
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

        // Einzigartige Standorte extrahieren
        const uniqueLocations = [
          ...new Set(apiData.map((item) => item.Standortname)),
        ];

        setData(apiData);
        setFilteredData(
          apiData.filter((item) => item.Standortname === uniqueLocations[0])
        );
        setLocations(uniqueLocations);
        setSelectedLocation(uniqueLocations[0]); // Standardauswahl setzen
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const newFilteredData = data.filter(
      (item) => item.Standortname === selectedLocation
    );
    setFilteredData(newFilteredData);
  }, [selectedLocation, data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const spec = {
    width: 800,
    height: 400,
    title: `Wetterdaten für ${selectedLocation}`,
    data: { values: filteredData },
    encoding: {
      x: {
        field: "Datum",
        type: "temporal",
        title: "Datum",
        timeUnit: "yearmonthdatehours",
      },
      y: {
        field: selectedAttribute,
        type: "quantitative",
        title: getAttributeTitle(selectedAttribute),
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
          field: selectedAttribute,
          type: "quantitative",
          title: getAttributeTitle(selectedAttribute),
        },
      ],
    },
    mark: "line",
  };

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
      <h3>Nach Standort und Attribut filtern</h3>
      {/* Standort Dropdown */}
      <label>
        Standort:
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </label>
      {/* Attribut Dropdown */}
      <>
        Attribut:
        <select
          value={selectedAttribute}
          onChange={(e) => setSelectedAttribute(e.target.value)}
        >
          <option value="T">Temperatur (°C)</option>
          <option value="RainDur">Regensdauer (min)</option>
          <option value="p">Luftdruck (hPa)</option>
        </select>
        <h2 style="margin-right: 2px;">Mit Maus über Graf fahren für Infos</h2>
        <VegaLite spec={spec} />
      </>
    </>
  );
}
