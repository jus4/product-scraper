'use strict'
const puppeteer = require('puppeteer')
process.setMaxListeners(Infinity);
function scrape(shoeUrl) {
    return new Promise(async (resolve, reject) => {
        try {
            const chromeFlags = [
                '--headless',
                '--no-sandbox',
                "--disable-gpu",
                "--single-process",
                "--no-zygote"
            ];
            const browser = await puppeteer.launch({args: chromeFlags})
            const page = await browser.newPage()
            
            await page.goto(shoeUrl,
                { waitUntil: 'networkidle0'}
            );
            await page.setDefaultNavigationTimeout(0);

            // Thanks for google data layer we get the price easy
            let datalayer = await page.evaluate('dataLayer');
            let price;
            datalayer.filter( data => {
                if (data.product_value) {
                    price = data.product_value
                }
            });

            // Get price
            // TODO this only works with discount products, damm you EpicTv
            //await page.waitForXPath('/html/body/div[4]/div/div[2]/div/div/div/div/div/article/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/div[2]/div/div/div/div');
            //const pricePath = await page.$x('/html/body/div[4]/div/div[2]/div/div/div/div/div/article/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/div[2]/div/div/div/div');
            //let price = await page.evaluate(el => el.textContent, pricePath[0]);
            //price = price.replace(/€/g, '');

            // Get sizes
            await page.waitForSelector('.size-link-wrapper');
            const shoeSizes = await page.evaluate(() => {
                   let array = [];
                   let elements = document.getElementsByClassName('size-link-wrapper');
                   for (i = 0; i < elements.length; i++) {
                     if ( !elements[i].classList.contains('outofstock') )  {
                       array.push(elements[i].childNodes[0].dataset.sizeEu);
                     }
                   }
                   return array;
            });

            await browser.close()
            await browser.disconnect();
            await browser.on('disconnected', () => console.log('disconnected'));

            const product = {
                price: Math.ceil(price),
                sizes: shoeSizes
            } 
            
            return resolve(product);
        } catch(e) {
            console.log('error' + e);
            reject(e);
        }
    })
}

exports.scrape = scrape;