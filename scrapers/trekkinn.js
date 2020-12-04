'use strict'
const puppeteer = require('puppeteer')
function scrapeTrekkin() {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            
            await page.goto('https://www.trekkinn.com/outdoor-mountain/la-sportiva-solution/136688721/p');

            // Get price
            const pricePath = await page.$x('/html/body/div[8]/div/div[5]/div[1]/div[2]/div[2]/p');
            let price = await page.evaluate(el => el.textContent, pricePath[0]);
            price.replace(/\D/g,'');

            // Get sizes
            await page.waitForSelector('#tallas_detalle');
            const solutionMenSizes = await page.evaluate(() => {
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
            return resolve({ shop: 'trekkin', solutionMenPrice: parseFloat(price), solutionMenSizes: solutionMenSizes});
        } catch(e) {
            reject(e);
        }
    })
}

exports.scrape = scrapeTrekkin;