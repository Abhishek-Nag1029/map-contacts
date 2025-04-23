import { useState, useEffect } from 'react';
import ContactMap from './components/ContactMap';
import FilterPanel from './components/FilterPanel';
import { fetchContacts } from './services/api';
import './App.css';

function App() {
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const roles = [
    'Contractor',
    'Home Owner',
    'Affiliate',
    'Referral Partner',
    'Community Partner',
    'Geo Tech'
  ];
  
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContacts();
        const contacts = data.contacts || [];
        
        setAllContacts(contacts);
        setFilteredContacts(contacts);
      } catch (err) {
        setError(err.message || 'Failed to fetch contacts');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContacts();
  }, []);

  useEffect(() => {

    let filtered = [...allContacts];
    
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(contact => {
        const contactRoles = contact.projectRoles || 
                           (contact.project_role ? [contact.project_role] : []);
        return selectedRoles.some(role => contactRoles.includes(role));
      });
    }

    if (locationFilter.trim() !== '') {
      const searchTerm = locationFilter.toLowerCase();
      filtered = filtered.filter(contact => {
        const address = contact.address ? contact.address.toLowerCase() : '';
        return address.includes(searchTerm);
      });
    }
    
    setFilteredContacts(filtered);
    updateSuggestions(filtered);
  }, [allContacts, selectedRoles, locationFilter]);

  const updateSuggestions = (contacts) => {
    const newSuggestions = contacts.map(contact => {
      const roles = contact.projectRoles || 
                   (contact.project_role ? [contact.project_role] : []);
      const roleStr = roles.join(' and ');
      
      const addressParts = contact.address?.split(',') || [];
      const location = addressParts.length > 1 
        ? addressParts.slice(-2).join(',').trim()
        : contact.address || 'unknown location';
      
      return `You can contact ${contact.name} in ${location} as a ${roleStr}.`;
    });
    
    setSuggestions(newSuggestions);
  };

  const handleRoleFilterChange = (roles) => {
    setSelectedRoles(roles);
  };
  
  const handleLocationFilterChange = (location) => {
    setLocationFilter(location);
  };

  return (
    <div className="app">
      <div className="app-container">
        <FilterPanel 
          roles={roles}
          onRoleFilterChange={handleRoleFilterChange}
          onLocationFilterChange={handleLocationFilterChange}
          suggestions={suggestions}
        />
        <div className="map-container">
          {isLoading ? (
            <div className="loading">Loading contacts...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <ContactMap contacts={filteredContacts} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;