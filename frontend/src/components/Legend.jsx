function Legend({ roleIcons }) {
    return (
      <div className="map-legend">
        <h3>Legend</h3>
        <div className="legend-items">
          {Object.entries(roleIcons)
            .filter(([role]) => role !== 'default') 
            .map(([role, iconConfig]) => (
              <div key={role} className="legend-item">
                <img 
                  src={iconConfig.iconUrl} 
                  alt={`${role} icon`}
                  className="legend-icon"
                />
                <span className="legend-label">{role}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }
  
  export default Legend;