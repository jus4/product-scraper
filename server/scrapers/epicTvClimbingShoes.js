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
            const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser', args: chromeFlags})
            const page = await browser.newPage();
            
            await page.goto(shoeUrl,
                { waitUntil: 'networkidle0'}
            );

            await page.setRequestInterception(true)

            page.on('request', req => {
              // disable webpack HMR, which breaks the 'networkidle0' setting
              if (req.url().endsWith('/__webpack_hmr')) {
                req.abort()
              } else {
                req.continue()
              }
            })

            //await page.setDefaultNavigationTimeout(0);

            // Thanks for google data layer we get the price easy
            // Not working now :( 
            //let datalayer = await page.evaluate('dataLayer');
            //let price;
            //datalayer.filter( data => {
            //    if (data.product_value) {
            //        price = data.product_value
            //    }
            //});
            

            // Get price
            // TODO this only works with discount products, damm you EpicTv
            await page.waitForSelector('.field.field-name-commerce-price.field-type-commerce-price.field-label-hidden > .field-items > div[class="field-item even"]');
            const pricePath = await page.$$('.field.field-name-commerce-price.field-type-commerce-price.field-label-hidden > .field-items > div[class="field-item even"]');
            let price = await page.evaluate(el => el.textContent, pricePath[0]);
            price = price.replace(/€/g, '');
            console.log(price);

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
                price: Math.ceil(parseInt(price)),
                sizes: shoeSizes
            } 
            console.log(product);
            
            return resolve(product);
        } catch(e) {
            console.log('error' + e);
            reject(e);
        }
    })
}

exports.scrape = scrape;
