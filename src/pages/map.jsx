// src/pages/Map.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Recenter map when position changes
function RecenterMap({ position }) {
  const map = useMap();
  if (position) {
    map.setView(position, 15); // zoom closer
  }
  return null;
}

export default function Map() {
  const [position, setPosition] = useState(null); // clicked location
  const [currentLocation, setCurrentLocation] = useState(null); // detected location
  const [incident, setIncident] = useState([]);
  // Handle map clicks
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position ? <Marker position={position} /> : null;
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_BACKEND_URL + "/getIncident");
        setIncident(res.data);
      } catch (err) {
        console.error("Error Fetching Incidents", err);
      }
    };
    fetchIncidents();
  }, []);

  // Detect current location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentLocation(coords);
        alert(`📍 Current Location: Lat ${coords.lat}, Lng ${coords.lng}`);
      },
      (err) => {
        console.error(err);
        alert("❌ Failed to get current location.");
      }
    );
  };

  // Submit clicked location
  const handleSubmit = async () => {
    if (!position)
      return alert("Select a location first!");
    if (!currentLocation)
      return alert("Detect your current location first!");
  
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/report",
        {
          location: { lat: position.lat, lng: position.lng },
          currentLocation: { lat: currentLocation.lat, lng: currentLocation.lng },
        }
      );

      const showIncidents = await axios.get(
        process.env.REACT_APP_BACKEND_URL + "/getIncident",
        {
          location: { lat: position.lat, lng: position.lng }
        }
      );
  
      console.log("Backend Response:", response.data);
      console.log("Backend Response:", showIncidents.data);

      const updated = await axios.get(process.env.REACT_APP_BACKEND_URL + "/getIncident");
      setIncident(updated.data);
  
      if (response.data.alert) {
        alert(response.data.alert); // 🚨 Alert if within 1km
      } else {
        alert("✅ Location sent successfully!");
      }
    } catch (error) {
      console.error("Error sending location:", error);
      alert("❌ Failed to send location to backend");
    }
  };
  

  return (
    <div>
      <MapContainer
        center={[6.9271, 79.8612]} // default center (Colombo)
        zoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Show marker when clicking on map */}
        <LocationMarker />

        {/* Show current location marker */}
        {currentLocation && <Marker position={currentLocation} />}

        {/* Recenter map when current location is detected */}
        <RecenterMap position={currentLocation} />

       
        {/*  Show all previously submitted incidents */}
        {incident.map((inc) =>
       inc.location && inc.location.lat && inc.location.lng ? (
      <Marker
      key={inc._id}
      position={[inc.location.lat, inc.location.lng]}
    />
  ) : null
)}


      </MapContainer>

      <div style={{ marginTop: "20px" }}>
        <button onClick={detectLocation} style={{ marginRight: "10px" }}>
          📍 Detect Current Location
        </button>
        <button onClick={handleSubmit}>Submit Location</button>
      </div>
    </div>
  );
}
