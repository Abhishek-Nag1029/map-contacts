import { useState, useEffect } from 'react';

function FilterPanel({ 
  roles, 
  onRoleFilterChange, 
  onLocationFilterChange,
  suggestions 
}) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [location, setLocation] = useState('');
  

  useEffect(() => {
    if (Array.isArray(roles)) {
      setSelectedRoles(prev => 
        prev.filter(role => roles.includes(role)))
    }
  }, [roles]);

  const handleRoleChange = (role) => {
    const newSelectedRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    
    setSelectedRoles(newSelectedRoles);
    onRoleFilterChange(newSelectedRoles);
  };
  
  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    onLocationFilterChange(newLocation);
  };
  
  const handleClearFilters = () => {
    setSelectedRoles([]);
    setLocation('');
    onRoleFilterChange([]);
    onLocationFilterChange('');
  };
  
  return (
    <div className="filter-panel">
      <h2>Filter Contacts</h2>
      
      <div className="filter-section">
        <h3>Project Roles</h3>
        <div className="role-checkboxes">
          {roles?.map(role => (
            <label key={role} className="role-checkbox">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => handleRoleChange(role)}
              />
              <span className="checkbox-label">{role}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Location</h3>
        <input
          type="text"
          placeholder="City, State, or Address"
          value={location}
          onChange={handleLocationChange}
          className="location-input"
        />
      </div>
      
      <button 
        className="clear-filters-btn"
        onClick={handleClearFilters}
      >
        Clear Filters
      </button>
      
      {suggestions?.length > 0 && (
        <div className="suggestions-section">
          <h3>Suggested Matches</h3>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;