const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { getRouter } = require('stremio-addon-sdk');
const addon = require('./addon'); // Add-on logic is in addon.js
const app = express();

// Clear the command prompt window
process.stdout.write('\033c');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

// Root route to handle requests to the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Twitch Addon!');
});

// Route to handle /addon/configure
app.get('/addon/configure', (req, res) => {
    // Read the HTML file
    fs.readFile(path.join(__dirname, 'configure.html'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading configuration page.');
            return;
        }

        // Log the manifest name, version, and description for debugging purposes
        const manifestName = addon.manifest.name;
        const manifestVersion = addon.manifest.version;
        const manifestDescription = addon.manifest.description || '';
        console.log('Manifest Name:', manifestName);
        console.log('Manifest Version:', manifestVersion);
        console.log('Manifest Description:', manifestDescription);

        // Inject the manifest.name, manifest.version, and manifest.description into the HTML
        let modifiedData = data.replace(/{{manifestName}}/g, manifestName);
        modifiedData = modifiedData.replace(/{{manifestVersion}}/g, manifestVersion);
        modifiedData = modifiedData.replace(/{{manifestDescription}}/g, manifestDescription);

        res.send(modifiedData);
    });
});

// Route to handle saving configuration
app.post('/addon/saveConfigure', (req, res) => {
    const { username1, username2 } = req.body;
    if (username1) {
        const configData = `username1: ${username1}\nusername2: ${username2 || ''}\n`;
        fs.writeFile('config.txt', configData, (err) => {
            if (err) {
                res.status(500).send('Error saving configuration.');
                return;
            }
            console.log('Configuration saved:', configData);
            res.redirect('stremio://localhost:7000/addon/manifest.json'); // Use the provided installation link
        });
    } else {
        res.send('Invalid configuration.');
    }
});

// Create and use the router for the addon
const addonRouter = getRouter(addon);
app.use('/addon', addonRouter);

// Ensure the server always uses port 7000
const port = 7000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Addon accessible at http://localhost:${port}/addon/manifest.json`);
});

module.exports = app;
