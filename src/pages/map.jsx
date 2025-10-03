// src/pages/Map.jsx
/*
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios"; // ✅ make sure axios is installed

export default function Map() {

  const [position, setPosition] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position ? <Marker position={position} /> : null;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
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

  //  mark function async
  const handleSubmit = async () => {
    if (!position) return alert("Select a location first!");
  
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/report",
        {
          location: {
            lat: position.lat,
            lng: position.lng
          }
        }
      );
  
      console.log("Backend Response:", response.data);
      alert(`✅ Location sent: ${response.data.message}`);
    } catch (error) {
      console.error("Error sending location:", error);
      alert("❌ Failed to send location to backend");
    }
  };
  

  return (
    <div>
      <MapContainer
        center={[6.9271, 79.8612]}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
      <button onClick={detectLocation} style={{ marginRight: "10px" }}>
          📍 Detect Current Location
        </button>
      <button onClick={handleSubmit} style={{ marginTop: "20px" }}>
        Submit Location
      </button>
    </div>
  );
}

*/

// src/pages/Map.jsx
import React, { useState } from "react";
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

  // Handle map clicks
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position ? <Marker position={position} /> : null;
  };

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
    if (!position) return alert("Select a location first!");

    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/report",
        {
          location: {
            lat: position.lat,
            lng: position.lng,
          },
        }
      );

      console.log("Backend Response:", response.data);
      alert(`✅ Location sent: ${response.data.message}`);
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
