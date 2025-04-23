const axios = require('axios');

exports.fetchContactsWithProjectRoles = async () => {
  try {
    const hubspotApiKey = process.env.HUBSPOT_ACCESS_TOKEN;
    
    if (!hubspotApiKey) {
      throw new Error('HubSpot API key is not configured');
    }
    
    const params = {
      "properties": ["firstname", "lastname", "email", "phone", "address", "project_role"],
      "filterGroups": [
        {
          "filters": [
            {
              "propertyName": "project_role",
              "operator": "HAS_PROPERTY"
            }
          ]
        }
      ]
    }
    ;

    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      params,
      {
        headers: {
          Authorization: `Bearer ${hubspotApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );


    return mapHubspotContacts(response.data.results);
  } catch (error) {
    console.error('Error in HubSpot service:', error);
    

    if (error.response && error.response.data) {
      console.error('HubSpot API error details:', error.response.data);
    }
    
    throw error;
  }
};

function mapHubspotContacts(hubspotContacts) {
  return hubspotContacts.map(contact => {
    const properties = contact.properties;

    const firstName = properties.firstname || '';
    const lastName = properties.lastname || '';
    const fullName = `${firstName} ${lastName}`.trim();
    

    const projectRoles = properties.project_role ? properties.project_role.split(';') : [];
    
    return {
      name: fullName,
      email: properties.email || '',
      phone: properties.phone || '',
      address: properties.address || '',
      projectRoles: projectRoles
    };
  });
}

exports.HUBSPOT_API_BASE_URL = 'https://api.hubapi.com';