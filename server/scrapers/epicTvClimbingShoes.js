'use strict'
const puppeteer = require('puppeteer')
process.setMaxListeners(Infinity);
function scrape(shoeUrl) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            
            await page.goto(shoeUrl,
                { waitUntil: 'networkidle0'}
            );

            // Get price
            const pricePath = await page.$x('//*[@id="product-pricing-block"]/div[1]/div[3]/div/div[2]/div/div/div/div');
            let price = await page.evaluate(el => el.textContent, pricePath[0]);
            price.replace(/\D/g,'');
            console.log(parseFloat(price));

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

            browser.close()

            const product = {
                price: 99,
                sizes: shoeSizes
            } 
            
            return resolve(product);
        } catch(e) {
            console.log(e);
            reject(e);
        }
    })
}

exports.scrape = scrape;