
const API_BASE_URL = 'https://map-contacts-backend.onrender.com/api';


export const fetchContacts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/with-project-roles`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};