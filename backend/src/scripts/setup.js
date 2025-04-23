
const axios = require('axios');
require('dotenv').config();
const HUBSPOT_API_BASE_URL = 'https://api.hubapi.com';

const contacts = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    address: '123 Main St, Seattle, WA 98101',
    projectRoles: ['Contractor', 'Home Owner']
  },
  {
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.johnson@example.com',
    phone: '555-234-5678',
    address: '456 Pine Ave, Portland, OR 97205',
    projectRoles: ['Geo Tech']
  },
  {
    firstName: 'Michael',
    lastName: 'Williams',
    email: 'michael.williams@example.com',
    phone: '555-345-6789',
    address: '789 Oak Blvd, San Francisco, CA 94103',
    projectRoles: ['Affiliate', 'Community Partner']
  },
  {
    firstName: 'Sarah',
    lastName: 'Brown',
    email: 'sarah.brown@example.com',
    phone: '555-456-7890',
    address: '101 Maple Dr, Los Angeles, CA 90001',
    projectRoles: ['Referral Partner']
  },
  {
    firstName: 'Robert',
    lastName: 'Jones',
    email: 'robert.jones@example.com',
    phone: '555-567-8901',
    address: '202 Cedar St, Denver, CO 80201',
    projectRoles: ['Home Owner']
  },
  {
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'jennifer.davis@example.com',
    phone: '555-678-9012',
    address: '303 Birch Rd, Phoenix, AZ 85001',
    projectRoles: ['Contractor', 'Geo Tech']
  },
  {
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@example.com',
    phone: '555-789-0123',
    address: '404 Elm St, Austin, TX 78701',
    projectRoles: ['Community Partner']
  },
  {
    firstName: 'Lisa',
    lastName: 'Wilson',
    email: 'lisa.wilson@example.com',
    phone: '555-890-1234',
    address: '505 Spruce Ave, Chicago, IL 60601',
    projectRoles: ['Affiliate']
  },
  {
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.anderson@example.com',
    phone: '555-901-2345',
    address: '606 Redwood Blvd, Miami, FL 33101',
    projectRoles: ['Referral Partner', 'Contractor']
  },
  {
    firstName: 'Patricia',
    lastName: 'Taylor',
    email: 'patricia.taylor@example.com',
    phone: '555-012-3456',
    address: '707 Aspen Dr, New York, NY 10001',
    projectRoles: ['Home Owner', 'Affiliate']
  }
];

async function checkProjectRoleProperty() {
  try {
    const response = await axios.get(
      `${HUBSPOT_API_BASE_URL}/crm/v3/properties/contacts/project_role`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`
        }
      }
    );
    console.log('Project role property already exists:', response.data);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Project role property does not exist, will create it');
      return false;
    }
    console.error('Error checking property:', error.message);
    throw error;
  }
}
async function createProjectRoleProperty() {
  try {
    const propertyData = {
      name: 'project_role',
      label: 'Project Role',
      type: 'enumeration',
      fieldType: 'checkbox',
      groupName: 'contactinformation',
      options: [
        { label: 'Contractor', value: 'Contractor', displayOrder: 0 },
        { label: 'Home Owner', value: 'Home Owner', displayOrder: 1 },
        { label: 'Affiliate', value: 'Affiliate', displayOrder: 2 },
        { label: 'Referral Partner', value: 'Referral Partner', displayOrder: 3 },
        { label: 'Community Partner', value: 'Community Partner', displayOrder: 4 },
        { label: 'Geo Tech', value: 'Geo Tech', displayOrder: 5 }
      ]
    };

    const response = await axios.post(
      `${HUBSPOT_API_BASE_URL}/crm/v3/properties/contacts`,
      propertyData,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Created project_role property:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error.message);
    if (error.response && error.response.data) {
      console.error('HubSpot API error details:', error.response.data);
    }
    throw error;
  }
}

async function createContact(contactData) {
  try {
    const properties = {
      firstname: contactData.firstName,
      lastname: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      address: contactData.address,
      project_role: contactData.projectRoles.join(';') 
    };

    const response = await axios.post(
      `${HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts`,
      { properties },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Created contact: ${contactData.firstName} ${contactData.lastName}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating contact ${contactData.email}:`, error.message);
    if (error.response && error.response.data) {
      console.error('HubSpot API error details:', error.response.data);
    }
    throw error;
  }
}

async function createAllContacts() {
  const results = [];
  const errors = [];

  for (const contact of contacts) {
    try {
      const result = await createContact(contact);
      results.push(result);
    } catch (error) {
      errors.push({ contact, error: error.message });
    }
  }

  console.log(`Successfully created ${results.length} contacts`);
  if (errors.length > 0) {
    console.log(`Failed to create ${errors.length} contacts`);
    console.log('Errors:', errors);
  }

  return { results, errors };
}

async function setupHubspot() {
  try {
    if (!HUBSPOT_API_KEY) {
      throw new Error('HUBSPOT_API_KEY not found in environment variables');
    }

    const propertyExists = await checkProjectRoleProperty();
    if (!propertyExists) {
      await createProjectRoleProperty();
    }
    await createAllContacts();

    console.log('HubSpot setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error.message);
  }
}

setupHubspot();