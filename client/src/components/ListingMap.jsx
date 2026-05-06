import { useEffect, useRef, useState } from "react";

export default function ListingMap({ latitude, longitude, address, city }) {
  const mapRef     = useRef(null);
  const [error, setError]   = useState("");
  const [loaded, setLoaded] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const lat    = Number(latitude);
  const lng    = Number(longitude);
  const hasCoords = lat && lng && !isNaN(lat) && !isNaN(lng);

  useEffect(() => {
    if (!hasCoords || !apiKey) return;

    // Load Google Maps script if not already loaded
    if (window.google?.maps) {
      initMap();
      return;
    }

    // Check if script already exists
    if (document.getElementById("google-maps-script")) {
      // Wait for it to load
      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          initMap();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id    = "google-maps-script";
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);
  }, [lat, lng, apiKey]);

  function initMap() {
    if (!mapRef.current) return;

    const position = { lat, lng };

    const map = new window.google.maps.Map(mapRef.current, {
      center:    position,
      zoom:      15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
    });

    // Add a marker
    new window.google.maps.Marker({
      position,
      map,
      title: address ? `${address}, ${city}` : city,
    });

    setLoaded(true);
  }

  // No coordinates — show a static placeholder
  if (!hasCoords) {
    return (
      <div style={styles.noMap}>
        <p style={styles.noMapText}>
          {address
            ? `${address}, ${city}`
            : city}
        </p>
        <p style={styles.noMapHint}>Map not available for this listing</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div style={styles.noMap}>
        <p style={styles.noMapHint}>Map unavailable — API key not configured</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.noMap}>
        <p style={styles.noMapHint}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div ref={mapRef} style={styles.map} />
      {!loaded && <div style={styles.loadingOverlay}>Loading map...</div>}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
    height: "300px",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    border: "1px solid var(--border)",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    fontSize: "13px",
    color: "var(--text-muted)",
  },
  noMap: {
    width: "100%",
    height: "140px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  noMapText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  noMapHint: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
};