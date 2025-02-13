const puppeteer = require('puppeteer');
const fs = require('fs');
const { getTwitchVideoUrl, getTwitchVideoMetadata } = require('./puppeteer_scraper');

// Function to read the configuration from config.txt
function readConfig() {
    try {
        const data = fs.readFileSync('config.txt', 'utf8');
        const config = {};
        data.split('\n').forEach(line => {
            const [key, value] = line.split(': ');
            if (key && value) {
                config[key] = value;
            }
        });
        return config;
    } catch (err) {
        console.error('Error reading config.txt:', err);
        return {};
    }
}

// Function to check if a user is live on Twitch
async function isUserLive(username) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`https://www.twitch.tv/${username}`);

    const liveStatus = await page.evaluate(() => {
        const liveIndicator = document.querySelector('.ScChannelStatusTextIndicator-sc-qtgrnb-0 .bfNjIO');
        if (liveIndicator) {
            return { status: 'live' };
        }
        return { status: 'offline' };
    });

    await browser.close();
    return liveStatus;
}

// Define Catalog Handler
async function catalogHandler(args) {
    console.log('\nCatalog handler called with args:', args);
    
    // Read the configuration
    const config = readConfig();
    const usernames = config.username1 ? [config.username1, config.username2] : ['zackrawrrofflinee', 'loltyler1']; // Use config usernames or fallback for testing
    
    let metas = [];

    for (const username of usernames.filter(Boolean)) {
        const videoUrl = `https://www.twitch.tv/${username}/videos?filter=archives&sort=time`;
        const metadata = await getTwitchVideoMetadata(videoUrl);
        const liveStatus = await isUserLive(username);

        metas.push({
            id: `twitch:${username}_video`,
            type: 'channel',
            name: `${username}: ${liveStatus.status === 'live' ? 'Live' : 'Offline'}`,
            description: `Channel: ${username}\n\nStatus: ${liveStatus.status === 'live' ? 'Live!' : 'Offline'}\n\n${metadata.description || `A highlight from ${username}'s past Twitch streams.`}`,
            poster: metadata.profilePic || 'https://static-cdn.jtvnw.net/jtv_user_pictures/111c56c3-ac28-423e-ac5b-9c93e10556a8-profile_image-70x70.png',
            logo: metadata.profilePic || 'https://static-cdn.jtvnw.net/jtv_user_pictures/111c56c3-ac28-423e-ac5b-9c93e10556a8-profile_image-70x70.png',
            genre: ['Social'],
            background: 'https://cdn.m7g.twitch.tv/ba46b4e5e395b11efd34/assets/uploads/core-header.png'
        });
    }

    console.log('\nCatalog metas:', metas);
    return Promise.resolve({ metas });
}

// Define Stream Handler
async function streamHandler(args) {
    console.log('\nStream handler called with args:', args);

    // Read the configuration
    const config = readConfig();
    const usernames = config.username1 ? [config.username1, config.username2] : ['zackrawrrofflinee', 'loltyler1']; // Use config usernames or fallback for testing

    for (const username of usernames.filter(Boolean)) {
        if (args.id === `twitch:${username}_video`) {
            const videoUrl = await getTwitchVideoUrl(`https://www.twitch.tv/${username}/videos?filter=archives&sort=time`);
            const liveStatus = await isUserLive(username);
            console.log(`\n${username} is ${liveStatus.status}\n\nVideo URL: ${videoUrl}`);
            return {
                streams: [
                    {
                        url: videoUrl,
                        name: 'Twitch Stream',
                        title: 'Watch Now!'
                    },
                ],
            };
        }
    }
    return { streams: [] };
}

// Define Meta Handler
async function metaHandler(args) {
    console.log('\nMeta handler called with args:', args);
    
    const config = readConfig();
    const usernames = config.username1 ? [config.username1, config.username2] : ['zackrawrrofflinee', 'loltyler1']; // Use config usernames or fallback for testing

    for (const username of usernames.filter(Boolean)) {
        if (args.id === `twitch:${username}_video`) {
            const videoUrl = `https://www.twitch.tv/${username}/videos?filter=archives&sort=time`;
            const metadata = await getTwitchVideoMetadata(videoUrl);
            const liveStatus = await isUserLive(username);

            const meta = {
                id: `twitch:${username}_video`,
                type: 'channel',
                name: `${username}: ${liveStatus.status === 'live' ? 'Live' : 'Offline'}`,
                description: `Channel: ${username}\n\nStatus: ${liveStatus.status === 'live' ? 'Live!' : 'Offline'}\n\n${metadata.description || `A highlight from ${username}'s past Twitch streams.`}`,
                poster: metadata.profilePic || 'https://static-cdn.jtvnw.net/jtv_user_pictures/111c56c3-ac28-423e-ac5b-9c93e10556a8-profile_image-70x70.png',
                logo: metadata.profilePic || 'https://static-cdn.jtvnw.net/jtv_user_pictures/111c56c3-ac28-423e-ac5b-9c93e10556a8-profile_image-70x70.png',
                genre: ['Social'],
                background: 'https://cdn.m7g.twitch.tv/ba46b4e5e395b11efd34/assets/uploads/core-header.png',
                sources: [
                    {
                        name: 'Twitch',
                        url: videoUrl,
                        isFree: true
                    }
                ],
                // Adding a default loading message
                notice: liveStatus.status === 'live' ? 'Loading stream...' : 'This stream is currently offline'
            };

            return Promise.resolve({ meta });
        }
    }

    return Promise.resolve({ meta: { name: args.id.split(':')[1], description: 'Loading...' } }); // Provide default metadata while loading
}

module.exports = { catalogHandler, streamHandler, metaHandler };
