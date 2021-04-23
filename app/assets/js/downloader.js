const request = require('request')
const fs = require('fs')
const Downloader = require('nodejs-file-downloader');

module.exports = async (browser, downloader, downloadPath) => {
    /*download('https://a-33.1fichier.com/c701196943', __dirname + 'test.avi', () => {
        alert('test')
    })*/

    const main = async () => {
        if(downloader.toDownload.length > 0 && downloader.inDownload == null) {
            downloader.inDownload = downloader.toDownload[0]
            downloader.toDownload = removeItem(downloader.toDownload, downloader.toDownload[0])
        }

        if(downloader.inDownload) {
            if(!downloader.inDownload.isStart) {
                downloader.inDownload.isStart = true;
                const page = await browser.newPage();
                await page.goto(downloader.inDownload.link, {
                    waitUntil: 'networkidle2'
                });

                try {
                    await page.click('.ui-dialog-titlebar-close')
                } catch (error) {}

                if(await page.$('.ct_warn')) {
                    const time = await page.$eval('.ct_warn', e => e.innerHTML);
                    const encore = time.indexOf('encore') + 7;
                    const minute = time.indexOf('minutes.') - 1;
                    const rest = (parseInt(time.slice(encore, minute)) + 1)* 60 * 1000;

                    console.log("Attendre", rest, "ms")

                    downloader.inDownload.wait = true;
                    await sleep(rest)
                    downloader.inDownload.wait = false;

                    await page.goto(downloader.inDownload.link, {
                        waitUntil: 'networkidle2'
                    });
    
                    try {
                        await page.click('.ui-dialog-titlebar-close')
                    } catch (error) {}
                }

                await page.click('.btn-orange');
                await page.waitForTimeout(1000)
                const directLink = await page.$eval('.btn-orange', e => e.getAttribute('href'));
                await page.close();

                const down = new Downloader({
                    url: directLink,
                    directory: downloadPath,
                    onProgress:function(percentage, chunk, remainingSize) {
                        downloader.inDownload.percentage = percentage;
                    }
                })

                try {
                    await down.download();

                    downloader.inDownload = null;
                    console.log("Téléchargement terminé")
                } catch (error) {
                    
                }
            }            
            
        }

        setTimeout(main, 1000)
    }
    main()
}

function removeItem(array, item) {
    return array.filter(value => {
        if(value != item) {
            return value;
        }
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}