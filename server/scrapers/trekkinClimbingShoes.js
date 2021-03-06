"use strict";
const puppeteer = require("puppeteer");
process.setMaxListeners(Infinity);
function scrape(shoeUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      const chromeFlags = [
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ];
      const browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium-browser",
        args: chromeFlags,
      });
      const page = await browser.newPage();

      // Configure the navigation timeout
      await page.setDefaultNavigationTimeout(0);

      await page.goto(shoeUrl, { waitUntil: "networkidle0" });

      await page.setRequestInterception(true);

      page.on("request", (req) => {
        // disable webpack HMR, which breaks the 'networkidle0' setting
        if (req.url().endsWith("/__webpack_hmr")) {
          req.abort();
        } else {
          req.continue();
        }
      });
      //await page.setDefaultNavigationTimeout(0);
      // Get price
      const pricePath = await page.$x(
        "/html/body/div[8]/div/div[5]/div[1]/div[2]/div[2]/p"
      );
      let price = await page.evaluate((el) => el.textContent, pricePath[0]);
      price.replace(/\D/g, "");

      // Get sizes
      await page.waitForSelector("#tallas_detalle");
      const shoeSizes = await page.evaluate(() => {
        let array = [];
        let elements = document.querySelectorAll("#tallas_detalle");
        const { options } = elements[0];

        for (i = 0; i < options.length; i++) {
          let size = options[i].innerText;
          const regrex = new RegExp("dd");
          let sizeMatch = size.match(/(\d\d|\d..)/g);
          array.push(sizeMatch.join(" "));
        }
        return array;
      });
      await browser.close();
      await browser.disconnect();
      await browser.on("disconnected", () => console.log("disconnected"));

      const product = {
        price: parseFloat(price),
        sizes: shoeSizes,
      };

      return resolve(product);
    } catch (e) {
      console.log("Error:" + e);
      reject(e);
    }
  });
}

exports.scrape = scrape;
