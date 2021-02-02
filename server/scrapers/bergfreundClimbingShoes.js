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
      await page.waitForXPath(
        "/html/body/div[1]/div/section/div/div[1]/div[2]/div[1]/div/div[3]/div[1]/form/div[1]/meta[1]"
      );
      const pricePath = await page.$x(
        "/html/body/div[1]/div/section/div/div[1]/div[2]/div[1]/div/div[3]/div[1]/form/div[1]/meta[1]"
      );
      let price = await page.evaluate((el) => el.content, pricePath[0]);
      console.log(price);
      price.replace(/\D/g, "");

      // Get sizes
      await page.waitForSelector("#js-varlist-size");
      const shoeSizes = await page.evaluate(() => {
        let array = [];
        let elements = document.querySelectorAll("#js-varlist-size");
        const { children } = elements[0];

        for (i = 0; i < children.length; i++) {
          if (children[i].className !== "js-currently-not-available") {
            array.push(children[i].dataset.varsel);
          }
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
