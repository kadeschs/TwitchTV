const puppeteer = require('puppeteer');
const fs = require('fs');
const path = '/usr/bin/google-chrome';

fs.access(path, fs.constants.F_OK, (err) => {
    if (err) {
        console.error(`***** Chrome executable not found at: ${path} *****`);
    } else {
        console.log(`***** Chrome executable found at: ${path} *****`);
    }
});

async function getTwitchVideoUrl(videoUrl) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/google-chrome', // THIS PATH LINE IS FOR DOCKER DEPLOYMENT ONLY.
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const urls = [];

    page.on('request', request => {
        if (request.url().includes('.m3u8')) {
            urls.push(request.url());
        }
        request.continue();
    });

    await page.setRequestInterception(true);
    await page.goto(videoUrl, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const videoUrlSrc = urls.length > 0 ? urls[0] : null;
    await browser.close();
    return videoUrlSrc;
}

async function getTwitchVideoMetadata(videoUrl) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(videoUrl, { waitUntil: 'networkidle2' });

    const metadata = await page.evaluate(() => {
        const title = document.querySelector('.channel-info-content h1')?.innerText;
        const description = document.querySelector('.description')?.innerText;
        const profilePic = document.querySelector('.channel-info-content img')?.src;
        const userName = document.querySelector('.channel-info-content .tw-link')?.innerText; // Correct selector for user name
        return { title, description, profilePic, userName };
    });

    await browser.close();
    return metadata;
}

module.exports = {
    getTwitchVideoUrl,
    getTwitchVideoMetadata
};
