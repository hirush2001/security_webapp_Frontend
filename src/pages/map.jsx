// src/pages/Map.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const [position, setPosition] = useState(null);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position ? <Marker position={position} /> : null;
  };

  const handleSubmit = () => {
    if (!position) return alert("Select a location first!");
    alert(`Selected Location: Lat ${position.lat}, Lng ${position.lng}`);
  };

  return (
    <div>
      <MapContainer center={[6.9271, 79.8612]} zoom={12} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <button onClick={handleSubmit} style={{ marginTop: "20px" }}>Submit Location</button>
    </div>
  );
}
