const { remote } = require('electron');
const dialog = remote.dialog;
const locateChrome = require('locate-chrome');
const downloadsFolder = require('downloads-folder');
const store = remote.getGlobal('store');

var page,browser;

const vue = Vue.createApp({
    data() {
        return {
            stats: {
                ready: false,
                searched: false,
                resultSearched: false,
                video: false,
                isSettings: false,
                showDownload: false,
            },
            downloader: {
                toDownload: [],
                inDownload: null,
                downloaded: [],
            },
            input: {
                searched: "",
            },
            resultSearch: null,
            resultVideo: null,
            settings: {
                chromePath: null,
                headless: null,
                downloadPath: null,
            }
        }
    },
    methods: {
        frame(type) {
            switch(type) {
                case 'minimize':
                    remote.BrowserWindow.getFocusedWindow().minimize()
                    break;
                case 'maximize': 
                    if(remote.BrowserWindow.getFocusedWindow().isMaximized()) {
                        remote.BrowserWindow.getFocusedWindow().unmaximize()
                    } else remote.BrowserWindow.getFocusedWindow().maximize()
                    break;
                case 'close':
                    remote.getCurrentWindow().close()
                    break;
                case 'settings':
                    if(this.stats.isSettings) this.stats.isSettings = false;
                    else this.stats.isSettings = true;
                    break;
                case 'download':
                    if(this.stats.showDownload) this.stats.showDownload = false;
                    else this.stats.showDownload = true;
                    break;
            }
        },
        search() {
            (async() => {
                await page.type('#searchinputfull', this.input.searched)
                await page.click('#SearchOK')
            
                await page.waitForSelector('.cover_global')
                const list = await page.$$('.cover_global')
            
                var resultSearched = [];
                for(var el of list) {
                    const title = await el.$eval('.cover_infos_title', e => e.querySelector('a').innerText);
                    const quality = await el.$eval('.cover_infos_title', e => e.querySelector('b').innerText);
                    const language = await el.$eval('.cover_infos_title', e => e.querySelector('.detail_release b span').innerText);
                    const link = await el.$eval('.cover_infos_title', e => e.querySelector('a').getAttribute('href'));
                    resultSearched.push({title, quality, language, link})
                }

                this.resultSearch = resultSearched;
                this.stats.searched = false;
                this.stats.resultSearched = true;
            })()
        },
        getVideo(link, title) {
            (async () => {
                await page.goto(link, {waitUntil: 'networkidle2'})
                await page.click('.btn-primary')
                await page.waitForSelector('.postinfo')

                const videos = document.createElement('div'); 
                videos.innerHTML =  await page.$eval('.postinfo', e => e.innerHTML)

                const all = []
                var onefile = false;
                var count = 0;
                for(var el of videos.childNodes) {
                    if(!onefile) {
                        if(el.childNodes.length != 0) {
                            if(el.childNodes[0].tagName == 'DIV') {
                                if(el.childNodes[0].innerText == '1fichier') onefile = true
                            }
                        }
                    } else {
                        if(el.tagName == 'BR') {
                            if(count == 2) {
                                break;
                            } else count += 1;
                        } else {
                            count = 0;
                            all.push({title, name: el.childNodes[0].innerText, link: el.childNodes[0].getAttribute('href')})
                        }
                    }

                }
                this.resultVideo = all;

                // Change slide
                this.stats.resultSearched = false;
                this.stats.video = true;
            })()
        },
        getLink(link, title, name) {
            (async () => {
                const pageLink = await browser.newPage();
                await pageLink.goto(link, {waitUntil: 'networkidle2'})
                await pageLink.waitForSelector('.btn-primary')
                await pageLink.click('.btn-primary');
                await pageLink.waitForSelector('.showURL');
                this.downloader.toDownload.push({
                    title, name, isStart: false,
                    link: await pageLink.$eval('.showURL', e => e.innerText)
                });
                await pageLink.close()
            })()
        },
        setChromePath() {
            this.settings.chromePath = dialog.showOpenDialogSync({properties: ['openFile'], title: 'Emplacement de chrome'})[0]
            store.set('chromePath', this.settings.chromePath)
        },
        headless(less) {
            this.settings.headless = less;
            store.set('headless', less);
        },
        changeDownloadPath() {
            this.settings.downloadPath = dialog.showOpenDialogSync({properties: ['openDirectory'], title: 'Emplacement du téléchargement des fichiers'})[0]
            store.set('downloadPath', this.settings.downloadPath)
        }
    },
    async mounted() {
        /* Settings */
        this.settings.chromePath = (store.has('chromePath')) ? store.get('chromePath') : await locateChrome()
        this.settings.headless = (store.has('headless')) ? store.get('headless') : true;
        this.settings.downloadPath = (store.has('downloadPath')) ? store.get('downloadPath') : downloadsFolder();
        /* Settings */

        const puppeteer = require('puppeteer-extra');
        puppeteer.use(require('puppeteer-extra-plugin-stealth')())
        puppeteer.use(require('puppeteer-extra-plugin-adblocker')())

        browser = await puppeteer.launch({
            headless: this.settings.headless,
            executablePath: this.settings.chromePath
        })
        page = await browser.newPage();
    
        if(store.has('cookies')) {
            await page.setCookie(...store.get('cookies'))
        }

        await page.goto('https://www.zt-za.net/index.php?do=search&mode=advanced&subaction=search')
        await page.waitForSelector('.pagebg')
        store.set('cookies', await page.cookies())

        require('./assets/js/downloader')(browser, this.downloader, this.settings.downloadPath)

        this.stats.ready = true;
        this.stats.searched = true;
    }
}).mount('#app');