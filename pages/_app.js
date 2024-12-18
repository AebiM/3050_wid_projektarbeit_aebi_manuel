import React, { useState, useEffect } from "react";
import axios from "axios";
import { VegaLite } from "react-vega";

export default function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Daten von der API abrufen
    axios
      .get("http://localhost:3000/api/py/meteodaten")
      .then((response) => {
        const apiData = response.data;
        console.log(response.data);

        // Einzigartige Standorte extrahieren
        const uniqueLocations = [
          "All",
          ...new Set(apiData.map((item) => item.Name)),
        ];

        setData(apiData);
        setFilteredData(apiData);
        setLocations(uniqueLocations);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Daten filtern, wenn der Standort geändert wird
    const newFilteredData =
      selectedLocation === "All"
        ? data
        : data.filter((item) => item.Name === selectedLocation);
    setFilteredData(newFilteredData);
  }, [selectedLocation, data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Vega-Lite-Spezifikation
  const spec = {
    width: 550,
    height: 300,
    title: `Standorthöhen für ${selectedLocation}`,
    data: { values: filteredData },
    encoding: {
      x: { field: "Name", type: "nominal", title: "Standort" },
      y: { field: "Höhe [M.ü.M.]", type: "quantitative", title: "Höhe (m)" },
      tooltip: [
        { field: "Name", type: "nominal", title: "Name" },
        { field: "Höhe [M.ü.M.]", type: "quantitative", title: "Höhe (m)" },
        { field: "Adresse", type: "nominal", title: "Adresse" },
        { field: "Beschreibung", type: "nominal", title: "Beschreibung" },
      ],
    },
    mark: "bar",
  };

  return (
    <>
      <h1>Standortdaten-Visualisierung</h1>

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

      {/* Diagramm */}
      <VegaLite spec={spec} />
    </>
  );
}
