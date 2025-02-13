const { addonBuilder } = require('stremio-addon-sdk');
const { catalogHandler, streamHandler, metaHandler } = require('./handlers');

const builder = new addonBuilder({
    id: 'org.kadeschs.twitch',
    version: '1.0.0',
    name: 'Twitch TV',
    description: 'Addon to scrape Twitch videos',
    icon: 'https://cdn-1.webcatalog.io/catalog/twitch/twitch-icon-filled-256.webp',
    catalogs: [
        {
            type: 'channel',
            id: 'twitch',
            name: 'Twitch TV'
        }
    ],
    resources: ['catalog', 'stream', 'meta'],
    types: ['channel'],
    idPrefixes: ['twitch'],
    behaviorHints: {
        configurable: true,
        configurationRequired: false
    }
});

builder.defineCatalogHandler(catalogHandler);
builder.defineStreamHandler(streamHandler);
builder.defineMetaHandler(metaHandler);

module.exports = builder.getInterface();
