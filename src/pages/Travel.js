import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';
import travelData from '../data/travel';
import CalendarBadge from '../components/CalendarBadge';
import './Travel.css';

const CAROUSEL_INTERVAL = 3000;

// Vietnam's Hoàng Sa (Paracel) and Trường Sa (Spratly) archipelagos — always
// labeled on the map as Vietnamese territory, independent of travelData.
const VN_TERRITORIES = [
  { id: 'hoangsa', name: 'Hoàng Sa', lat: 16.5, lng: 112.0 },
  { id: 'truongsa', name: 'Trường Sa', lat: 8.645, lng: 111.92 },
];
const DRAG_THRESHOLD = 40;

// ── Carousel ──────────────────────────────────────────────────
function MiniCarousel({ images, label }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const dragStartX = useRef(null);
  const count = images.length;

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (count > 1)
      timerRef.current = setInterval(() => setIndex(p => (p + 1) % count), CAROUSEL_INTERVAL);
  }, [count]);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [resetTimer]);
  if (count === 0) return null;

  const go = i => { setIndex((i + count) % count); resetTimer(); };

  return (
    <div
      className="mini-carousel"
      onMouseDown={e => { dragStartX.current = e.clientX; clearInterval(timerRef.current); }}
      onMouseUp={e => {
        if (dragStartX.current === null) return;
        const d = dragStartX.current - e.clientX;
        if (Math.abs(d) > DRAG_THRESHOLD) go(index + (d > 0 ? 1 : -1));
        dragStartX.current = null; resetTimer();
      }}
      onTouchStart={e => { dragStartX.current = e.touches[0].clientX; clearInterval(timerRef.current); }}
      onTouchEnd={e => {
        if (dragStartX.current === null) return;
        const d = dragStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(d) > DRAG_THRESHOLD) go(index + (d > 0 ? 1 : -1));
        dragStartX.current = null; resetTimer();
      }}
    >
      <div className="mini-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <div key={i} className="mini-carousel-slide">
            <img src={src} alt={`${label} ${i + 1}`} draggable={false} />
          </div>
        ))}
      </div>
      {count > 1 && (
        <>
          <button className="mini-arrow mini-arrow-left" onClick={e => { e.stopPropagation(); go(index - 1); }}>‹</button>
          <button className="mini-arrow mini-arrow-right" onClick={e => { e.stopPropagation(); go(index + 1); }}>›</button>
          <div className="mini-dots">
            {images.map((_, i) => (
              <span key={i} className={`mini-dot${i === index ? ' active' : ''}`} onClick={e => { e.stopPropagation(); go(i); }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Event item ────────────────────────────────────────────────
function EventItem({ event }) {
  const [open, setOpen] = useState(false);
  const hasImages = event.images?.length > 0;
  return (
    <li className={`popup-event-item${hasImages ? ' clickable' : ''}`} onClick={() => hasImages && setOpen(o => !o)}>
      <div className="popup-event-row">
        {event.date && <CalendarBadge date={event.date} size="sm" />}
        {hasImages && event.images[0] && <img src={event.images[0]} alt="" className="popup-event-thumb" />}
        <span className="popup-event-name">{event.name}</span>
        {hasImages && <span className="popup-event-toggle">{open ? '▲' : '▼'}</span>}
      </div>
      {open && hasImages && (
        <div className="popup-event-carousel" onClick={e => e.stopPropagation()}>
          <MiniCarousel images={event.images} label={event.name} />
        </div>
      )}
    </li>
  );
}

// ── Vietnam territory labels ─────────────────────────────────
// A small marker at all zoom levels; the name only appears once the user has
// zoomed in far enough for it to read as a deliberate label, not clutter.
const TERRITORY_LABEL_MIN_ZOOM = 6;

function TerritoryMarkers({ isDark }) {
  const [zoom, setZoom] = useState(3);
  const map = useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  useEffect(() => { setZoom(map.getZoom()); }, [map]);

  const showLabel = zoom >= TERRITORY_LABEL_MIN_ZOOM;
  const dot = 8;

  return VN_TERRITORIES.map(place => {
    const icon = L.divIcon({
      className: '',
      html: `<div style="display:flex; align-items:center; gap:5px; white-space:nowrap; transform:translate(-${dot / 2}px,-${dot / 2}px);">
        <span style="width:${dot}px; height:${dot}px; border-radius:50%; background:#da251d; border:1.5px solid #ffcd00; box-shadow:0 1px 5px rgba(0,0,0,0.5);"></span>
        ${showLabel ? `<span style="font-size:11px; font-weight:600; color:${isDark ? '#f0f4f8' : '#2a2a2a'}; text-shadow:0 1px 3px rgba(0,0,0,0.7), 0 0 5px rgba(255,255,255,0.55);">${place.name}</span>` : ''}
      </div>`,
      iconSize: showLabel ? [90, dot] : [dot, dot],
      iconAnchor: [dot / 2, dot / 2],
    });
    return <Marker key={place.id} position={[place.lat, place.lng]} icon={icon} interactive={false} />;
  });
}

// ── Marker layer (inside MapContainer context) ────────────────
function CityMarkers({ isDark, selected, onSelect, containerRef }) {
  const suppressMapClick = useRef(false);
  const map = useMapEvents({
    click: () => {
      if (suppressMapClick.current) { suppressMapClick.current = false; return; }
      onSelect(null);
    },
  });

  return travelData.map(city => {
    const isSelected = selected?.id === city.id;
    const color = isSelected ? '#f59e0b' : (isDark ? '#6496ff' : '#8b5cf6');
    const size = 16;

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:${size}px; height:${size}px;
        background:${color};
        border:2.5px solid white;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(0,0,0,0.45);
        ${isSelected ? `box-shadow:0 0 0 6px ${color}33, 0 2px 8px rgba(0,0,0,0.45);` : ''}
        transition:background 0.2s;
        cursor:pointer;
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

    return (
      <Marker
        key={city.id}
        position={[city.lat, city.lng]}
        icon={icon}
        eventHandlers={{
          click: e => {
            suppressMapClick.current = true;
            e.originalEvent?.stopPropagation();
            const pt = map.latLngToContainerPoint([city.lat, city.lng]);
            const el = containerRef.current;
            onSelect({
              city,
              pos: {
                x: pt.x, y: pt.y,
                flipX: pt.x > (el?.offsetWidth ?? 600) / 2,
                flipY: pt.y > (el?.offsetHeight ?? 460) * 0.6,
              },
            });
          },
        }}
      />
    );
  });
}

// ── Main ──────────────────────────────────────────────────────
function Travel() {
  const containerRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = {
    countries: new Set(travelData.map(d => d.country)).size,
    cities: travelData.length,
  };

  return (
    <div className="travel-page">
      <h1 className="page-title">Travel</h1>

      <div className="travel-stats">
        <div className="travel-stat-card">
          <span className="travel-stat-number">{stats.countries}</span>
          <span className="travel-stat-label">Countries</span>
        </div>
        <div className="travel-stat-card">
          <span className="travel-stat-number">{stats.cities}</span>
          <span className="travel-stat-label">Cities</span>
        </div>
      </div>

      <div className="map-section">
      <div className={`map-container${isDark ? ' map-dark' : ''}`} ref={containerRef}>
        <MapContainer
          center={[20, 10]}
          zoom={3}
          minZoom={2}
          maxZoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          attributionControl={true}
        >
          {/* Wikimedia's own OSM-based tiles — free, keyless, run by the
              Wikimedia Foundation (stable, non-commercial infra unlikely to
              suddenly gate behind an API key the way Carto's
              basemaps.cartocdn.com just did). Dark mode is a CSS filter on
              the tile pane (below), so it works with any raster tile source. */}
          <TileLayer
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | Tiles: <a href="https://wikimediafoundation.org/" target="_blank" rel="noopener noreferrer">Wikimedia</a>'
          />
          <TerritoryMarkers isDark={isDark} />
          <CityMarkers
            isDark={isDark}
            selected={selection?.city}
            onSelect={setSelection}
            containerRef={containerRef}
          />
        </MapContainer>

        {selection && (
          <div
            className="map-popup"
            onClick={e => e.stopPropagation()}
            style={{
              left: selection.pos.x,
              top: selection.pos.y,
              transform: `translate(${selection.pos.flipX ? 'calc(-100% - 12px)' : '12px'}, ${selection.pos.flipY ? 'calc(-100% - 12px)' : '12px'})`,
            }}
          >
            <button className="map-popup-close" onClick={() => setSelection(null)}>✕</button>
            <p className="popup-city">{selection.city.flag} {selection.city.city}</p>
            <p className="popup-country">{selection.city.country}{selection.city.date ? ` · ${selection.city.date}` : ''}</p>
            {selection.city.images?.length > 0 && (
              <MiniCarousel images={selection.city.images} label={selection.city.city} />
            )}
            {selection.city.events?.length > 0 && (
              <ul className="popup-events-list">
                {selection.city.events.map(ev => <EventItem key={ev.id} event={ev} />)}
              </ul>
            )}
          </div>
        )}
      </div>

        <p className="map-hint">Scroll to zoom · Drag to pan · Click a pin to explore</p>
      </div>

      <div className="travel-chips-section">
        <h2 className="travel-places-title">Places Visited</h2>
        {Object.entries(
          travelData.reduce((acc, d) => {
            const key = `${d.flag} ${d.country}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(d);
            return acc;
          }, {})
        ).map(([countryLabel, cities]) => (
          <div key={countryLabel} className="travel-country-group">
            <span className="travel-country-label">{countryLabel}</span>
            <div className="travel-chips">
              {cities.map(d => (
                <button
                  key={d.id}
                  className={`travel-chip${selection?.city?.id === d.id ? ' active' : ''}`}
                  onClick={() => setSelection(selection?.city?.id === d.id ? null : { city: d, pos: selection?.pos ?? { x: 0, y: 0, flipX: false, flipY: false } })}
                >
                  {d.city}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Travel;
