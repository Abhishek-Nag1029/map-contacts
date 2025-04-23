const hubspotService = require('../services/hubspot.service');

exports.getContactsWithProjectRoles = async (req, res) => {
  try {
    const contacts = await hubspotService.fetchContactsWithProjectRoles();
    
    res.json({
      success: true,
      count: contacts.length,
      contacts: contacts
    });
  } catch (error) {
    console.error('Error in contact controller:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts with project roles',
      error: error.message
    });
  }
};