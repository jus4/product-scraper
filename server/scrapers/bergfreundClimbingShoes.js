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
            const pricePath = await page.$x('/html/body/div[1]/div/section/div/div[1]/div[2]/div[1]/div/div[3]/div[1]/form/div[1]/span[3]/span/span[3]/span');
            let price = await page.evaluate(el => el.textContent, pricePath[0]);
            price.replace(/\D/g,'');

            // Get sizes
            await page.waitForSelector('#js-varlist-size');
            const shoeSizes = await page.evaluate(() => {
                   let array = [];
                   let elements = document.querySelectorAll('#js-varlist-size');
                   const {children} = elements[0]
                   
                   for (i = 0; i < children.length; i++) {
                        if ( children[i].className !== 'js-currently-not-available') {
                            array.push(children[i].dataset.varsel);
                        }
                   }
                   return array;
            });
            
            browser.close()

            const product = {
                price: parseFloat(price),
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