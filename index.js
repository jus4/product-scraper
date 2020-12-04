const scrapers = require('./scrapers');

Promise.all([
  scrapers.epicTv.scrape(),
  scrapers.bergfreunde.scrape(),
  scrapers.trekkin.scrape(),
  scrapers.epicTvScarpa.scrape() ]).then((values) => {
  console.log(values);
});
