const puppeteer = require('puppeteer');

async function getTwitchVideoUrl(videoUrl) {
    const browser = await puppeteer.launch({ headless: true });
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
