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
            const pricePath = await page.$x('/html/body/div[8]/div/div[5]/div[1]/div[2]/div[2]/p');
            let price = await page.evaluate(el => el.textContent, pricePath[0]);
            price.replace(/\D/g,'');

            // Get sizes
            await page.waitForSelector('#tallas_detalle');
            const shoeSizes = await page.evaluate(() => {
                   let array = [];
                   let elements = document.querySelectorAll('#tallas_detalle');
                   const {options} = elements[0];
                 
                   for (i = 0; i < options.length; i++) {
                        let size = options[i].innerText;
                        const regrex = new RegExp('\d\d');
                        let sizeMatch = size.match(/(\d\d|\d..)/g);
                        array.push(sizeMatch.join(' '));
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