// src/pages/Map.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { toast } from "react-toastify";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { FaCarCrash, FaFire, FaBolt, FaWater, FaShieldAlt  } from "react-icons/fa";

// Recenter map when position changes
function RecenterMap({ position }) {
  const map = useMap();
  if (position) {
    map.setView(position, 15); // zoom closer
  }
  return null;
}

// Function to return a Leaflet divIcon for a given type
const getIcon = (type) => {
  let iconComponent;
  switch(type) {
    case "accident": iconComponent = <FaCarCrash color="red" size={30} />; break;
    case "fire": iconComponent = <FaFire color="orange" size={30} />; break;
    case "crime": iconComponent = <FaBolt color="black" size={30} />; break;
    case "flood": iconComponent = <FaWater color="blue" size={30} />; break;
    case "police": iconComponent = <FaShieldAlt color="green" size={30} />; break;
    default: iconComponent = <FaCarCrash color="red" size={30} />;
  }

  return L.divIcon({
    html: ReactDOMServer.renderToString(iconComponent),
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

export default function Map() {
  const [position, setPosition] = useState(null); // clicked location
  const [currentLocation, setCurrentLocation] = useState(null); // detected location
  const [incident, setIncident] = useState([]);
  const [type, setType] = useState("");

  // Handle map clicks and dynamic marker icon
  const LocationMarker = () => {
    const [markerRef, setMarkerRef] = useState(null);

    useMapEvents({
      click(e) {
        console.log("Clicked map coordinates:", e.latlng);
        setPosition(e.latlng);
      },
    });

    // Update marker icon whenever type changes
    useEffect(() => {
      if (markerRef) {
        markerRef.setIcon(getIcon(type));
      }
    }, [type, markerRef]);

    return position ? <Marker position={position} ref={setMarkerRef} icon={getIcon(type)} /> : null;
  };

  // Fetch all incidents from backend
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
      toast.success("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(coords);
        toast.success(`📍 Current Location: Lat ${coords.lat}, Lng ${coords.lng}`);
      },
      (err) => {
        console.error(err);
        toast.error("❌ Failed to get current location.");
      }
    );
  };

  // Submit clicked location
  const handleSubmit = async () => {
    if (!position) return toast.error("Select a location first!");
    if (!currentLocation) return toast.error("Detect your current location first!");

    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/report",
        {
          location: { lat: position.lat, lng: position.lng },
          currentLocation: { lat: currentLocation.lat, lng: currentLocation.lng },
          type: type,
        }
      );

      const updated = await axios.get(process.env.REACT_APP_BACKEND_URL + "/getIncident");
      setIncident(updated.data);

      if (response.data.alert) {
        toast.success(response.data.alert);
      } else {
        toast.success("✅ Location sent successfully!");
      }
    } catch (error) {
      console.error("Error sending location:", error);
      toast.error("❌ Failed to send location to backend");
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <MapContainer
        center={[6.9271, 79.8612]}
        zoom={12}
        className="w-full h-[500px] rounded-lg shadow-lg border border-gray-300"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marker for clicked location */}
        <LocationMarker />

        {/* Marker for current location */}
        {currentLocation && <Marker position={currentLocation} />}

        {/* Recenter map */}
        <RecenterMap position={currentLocation} />

        {/* Existing incidents from backend */}
        {incident.map((inc) =>
          inc.location?.lat && inc.location?.lng ? (
            <Marker
              key={inc._id}
              position={[inc.location.lat, inc.location.lng]}
              icon={getIcon(inc.type)}
            />
          ) : null
        )}
      </MapContainer>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={detectLocation}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow transition-all duration-200"
        >
          📍 Detect Current Location
        </button>

        <button
          onClick={handleSubmit}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow transition-all duration-200"
        >
          Submit Location
        </button>

        <label className="font-medium text-gray-700">Type:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">-- Select Type --</option>
          <option value="accident">Accident</option>
          <option value="fire">Fire</option>
          <option value="crime">Crime</option>
          <option value="flood">Flood</option>
          <option value="police">Police</option>
        </select>
      </div>
    </div>
  );
}
