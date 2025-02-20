import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./weather.css";
// Stil sabitleri
const styles = {
    container: {
        display: "flex",
        maxWidth: "100%",
        height: "90vh",
        padding: "2rem",
        borderRadius: "15px",
        background: "linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        color: "white",
    },
    leftPanel: {
        flex: "1",
        padding: "1rem",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    rightPanel: {
        flex: "2",
        padding: "1rem",
    },
    input: {
        padding: "0.8rem 1.5rem",
        borderRadius: "25px",
        border: "none",
        marginRight: "1rem",
        fontSize: "1rem",
        width: "70%",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        background: "rgba(255,255,255,0.2)",
        color: "white",
        outline: "none",
    },
    button: {
        padding: "0.8rem 2rem",
        borderRadius: "25px",
        border: "none",
        background: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
        color: "white",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 15px rgba(255,107,107,0.3)",
        marginTop: "1rem",
        width: "80%",
    },
    weatherCard: {
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
        borderRadius: "15px",
        padding: "2rem",
        marginTop: "2rem",
        width: "70%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    },
    mapContainer: {
        height: "100%",
        width: "100%",
        borderRadius: "15px",
        border: "2px solid rgba(255,255,255,0.3)",
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
    },
    title: {

        fontSize: "2.5rem",
        marginBottom: "1.5rem",
        textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
    },
    tempText: {


        fontSize: "3rem",
        margin: "1rem 0",
        fontWeight: "700",
        color: "#FFD93D",
    },
    descText: {
        fontSize: "1.2rem",
        textTransform: "capitalize",
        opacity: 0.9,
    },
};

// Özel harita işaretçisi
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const Weather = () => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    const [city, setCity] = useState("");
    const [coords, setCoords] = useState([51.505, -0.09]);
    const [weather, setWeather] = useState(null);
    const [locationName, setLocationName] = useState("");

    const handleCityChange = (e) => {
        setCity(e.target.value);
        if (e.target.value === "") {
            setWeather(null);
        }
    };

    const fetchWeatherByCity = async () => {
        if (!city) {
            alert("Lütfen bir şehir girin");
            return;
        }
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
            );
            if (!response.ok) throw new Error("Şehir bulunamadı");
            const data = await response.json();
            setCoords([data.coord.lat, data.coord.lon]);
            setWeather({
                temp: data.main.temp,
                description: data.weather[0].description,
                condition: data.weather[0].main
            });
            fetchLocationName(data.coord.lat, data.coord.lon);
        } catch (error) {
            alert(error.message);
            console.error("Hata:", error);
        }
    };

    // Koordinatlarla hava durumunu getir
    const fetchWeatherByCoords = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
            );
            if (!response.ok) throw new Error("Hava durumu alınamadı");
            const data = await response.json();
            setWeather({
                temp: data.main.temp,
                description: data.weather[0].description,
                condition: data.weather[0].main
            });
            fetchLocationName(lat, lon);
        } catch (error) {
            alert(error.message);
        }
    };

    // Ters coğrafi kodlama ile yer adını al
    const fetchLocationName = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            if (!response.ok) throw new Error("Konum adı alınamadı");
            const data = await response.json();
            setLocationName(data.address.city || data.address.town || data.address.village || data.address.county || "Bilinmeyen Konum");
            setCity(data.address.city || data.address.town || data.address.village || data.address.county);
        } catch (error) {
            console.error("Hata:", error);
        }
    };

    function MapView({ coords }) {
        const map = useMap();
        map.setView(coords, 10);
        return <Marker position={coords} icon={customIcon} />;
    }

    // Kullanıcının haritaya tıkladığı noktayı al ve hava durumunu getir
    function LocationMarker() {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setCoords([lat, lng]);
                fetchWeatherByCoords(lat, lng);
            },
        });
        return null;
    }

    return (
        <div style={styles.container} className={weather ? `weather-${weather.condition.toLowerCase()}` : ''}>
            {/* Sol Panel */}
            <div style={styles.leftPanel}>
                <h1 className="weather-title" style={styles.title}>🌤️ Hava Durumu Uygulaması</h1>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Şehir girin..."
                    value={city}
                    onChange={handleCityChange}
                    onKeyPress={(e) => e.key === "Enter" && fetchWeatherByCity()}
                />
                <button style={styles.button} onClick={fetchWeatherByCity}>
                    Hava Durumunu Göster
                </button>

                {weather && (
                    <div className="weather-card" style={styles.weatherCard}>
                        <h3 className="location-name" style={{ margin: "0 0 1rem", fontSize: "1.8rem" }}>
                            🌍 {locationName || (city ? city.toUpperCase() : "Seçilen Konum")}
                        </h3>
                        <p className="temp-display" style={styles.tempText}>{Math.round(weather.temp)}°C</p>
                        <p className="weather-description" style={styles.descText}>{weather.description}</p>
                        {/* Hava durumu ikonu */}
                        <div className="weather-icon-container">
                            <div className="weather-icon"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sağ Panel */}
            <div style={styles.rightPanel}>
                <MapContainer center={coords} zoom={10} style={styles.mapContainer}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapView coords={coords} />
                    <LocationMarker />
                </MapContainer>
            </div>
        </div>
    );
};

export default Weather;