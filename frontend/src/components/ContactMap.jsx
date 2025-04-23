import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Legend from './Legend';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

function ContactMap({ contacts }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const roleIcons = {
    'Contractor': createIconConfig('/icons/star.svg'),
    'Home Owner': createIconConfig('/icons/home.svg'),
    'Affiliate': createIconConfig('/icons/circle.svg'),
    'Referral Partner': createIconConfig('/icons/diamond.svg'),
    'Community Partner': createIconConfig('/icons/square.svg'),
    'Geo Tech': createIconConfig('/icons/triangle.svg'),
    'default': createIconConfig('/icons/default.svg')
  };

  function createIconConfig(iconUrl) {
    return {
      iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    };
  }

  const validateContacts = (contacts) => {
    if (!contacts) throw new Error('No contacts data provided');
    if (!Array.isArray(contacts)) throw new Error('Contacts data is not an array');
    
    return contacts.map(contact => {
      const roles = contact.projectRoles || contact.project_role || ['Contractor'];
      
      return {
        ...contact,
        projectRoles: Array.isArray(roles) ? roles : [roles]
      };
    });
  };

  const geocodeAddress = async (address) => {
    if (!address) {
      console.warn('Empty address provided');
      return getFallbackCoordinates();
    }
    
    try {
      return {
        latitude: 37.0902 + (Math.random() - 0.5) * 10,
        longitude: -95.7129 + (Math.random() - 0.5) * 20
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return getFallbackCoordinates();
    }
  };

  const getFallbackCoordinates = () => ({
    latitude: 37.0902 + (Math.random() - 0.5) * 2,
    longitude: -95.7129 + (Math.random() - 0.5) * 2
  });

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [37.0902, -95.7129],
        zoom: 4,
        maxZoom: 18,
        minZoom: 2
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const addMarkersToMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Raw contacts data:', contacts);
        const validatedContacts = validateContacts(contacts);
        console.log('Validated contacts:', validatedContacts);

        if (!mapInstanceRef.current || !markersLayerRef.current) return;
        
        markersLayerRef.current.clearLayers();
        let addedMarkers = 0;
        const bounds = L.latLngBounds();

        for (const contact of validatedContacts) {
          try {
            const coordinates = await geocodeAddress(contact.address);
            if (!coordinates) continue;

            contact.projectRoles.forEach((role, index) => {
              if (!role) {
                console.warn('Empty role for contact:', contact.name);
                return;
              }

        
              const normalizedRole = role.trim()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

              console.log(`Creating marker for ${contact.name} with role:`, normalizedRole);
              
              const icon = L.icon(
                roleIcons[normalizedRole] || roleIcons['default']
              );
              
              const marker = L.marker(
                [
                  coordinates.latitude + (index * 0.0002),
                  coordinates.longitude + (index * 0.0002)
                ],
                { icon }
              );

              marker.bindPopup(`
                <div class="marker-popup">
                  <h3>${contact.name || 'No name'}</h3>
                  ${contact.email ? `<p><strong>Email:</strong> ${contact.email}</p>` : ''}
                  ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
                  <p><strong>Address:</strong> ${contact.address || 'N/A'}</p>
                  <p><strong>Role:</strong> ${normalizedRole}</p>
                </div>
              `);

              markersLayerRef.current.addLayer(marker);
              bounds.extend(marker.getLatLng());
              addedMarkers++;
            });
          } catch (error) {
            console.error(`Error processing contact ${contact.name}:`, error);
          }
        }

        if (addedMarkers > 0) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
          setError('Could not display any contacts - check your data');
        }
      } catch (error) {
        console.error('Error in addMarkersToMap:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (contacts && contacts.length > 0) {
      addMarkersToMap();
    } else {
      setError('No contacts available to display');
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }
    }
  }, [contacts]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map"></div>
      <Legend roleIcons={roleIcons} />
      
      {isLoading && (
        <div className="map-loading-overlay">
          Loading contacts...
        </div>
      )}
      
      {error && (
        <div className="map-error-overlay">
          {error}
          {contacts?.length === 0 && (
            <button onClick={() => window.location.reload()}>Refresh</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ContactMap;