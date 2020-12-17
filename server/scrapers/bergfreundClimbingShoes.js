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
            await page.setDefaultNavigationTimeout(0);

            // Get price
            await page.waitForXPath('/html/body/div[1]/div/section/div/div[1]/div[2]/div[1]/div/div[3]/div[1]/form/div[1]/meta[1]');
            const pricePath = await page.$x('/html/body/div[1]/div/section/div/div[1]/div[2]/div[1]/div/div[3]/div[1]/form/div[1]/meta[1]');
            let price = await page.evaluate(el => el.content, pricePath[0]);
            console.log(price);
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
            console.log('Error:' + e);
            reject(e);
        }
    })
}

exports.scrape = scrape;