const ActiveDirectory = require('activedirectory2');

// Configure the Active Directory settings
const config = {
  url: process.env.AD_URL,
  baseDN: process.env.AD_BASEDN,
  username: `TFT\\${process.env.AD_USERNAME}`,
  password: process.env.AD_PASSWORD
};

// Create an instance of ActiveDirectory
const ad = new ActiveDirectory(config);


module.exports = ad;