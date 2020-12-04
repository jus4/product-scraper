'use strict'
const puppeteer = require('puppeteer')
function scrapeEpicTv() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            
            await page.goto('https://shop.epictv.com/en/climbing-shoes/scarpa/instinct-vsr-climbing-shoe?sku=SCAW17_CLSHINVSR_35');

            // Get price
            const pricePath = await page.$x('/html/body/div[4]/div/div[3]/div/div/div/div/div/article/div[1]/div[1]/div/div[2]/div[1]/div[3]/div/div[2]/div/div/div/div');
            let price = await page.evaluate(el => el.textContent, pricePath[0]);
            price.replace(/\D/g,'');

            // Get sizes
            await page.waitForSelector('.size-link-wrapper');
            const solutionMenSizes = await page.evaluate(() => {
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
            return resolve({ shop: 'epictv', solutionMenPrice: parseFloat(price), solutionMenSizes: solutionMenSizes});
        } catch(e) {
            reject(e);
        }
    })
}

exports.scrape = scrapeEpicTv;