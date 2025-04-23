const express = require('express');
const dotenv = require('dotenv');
const contactRoutes = require('./routes/contact.routes');


dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;


const cors = require('cors');
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', contactRoutes);


app.get('/', (req, res) => {
  res.send('HubSpot Contacts API is running. Use /api/contacts/with-project-roles to fetch contacts.');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});