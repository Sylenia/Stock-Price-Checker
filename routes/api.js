'use strict';

const axios = require('axios');
const Stock = require('../models/Stock');
const crypto = require('crypto');

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const { stock, like } = req.query;
      const stocks = Array.isArray(stock) ? stock : [stock];
      const ipHash = crypto.createHash('sha256').update(req.ip).digest('hex');

      try {
        const stockData = await Promise.all(stocks.map(async symbol => {
          const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
          const price = response.data.latestPrice;

          let stockInfo = await Stock.findOne({ symbol });
          if (!stockInfo) {
            stockInfo = new Stock({ symbol, likes: 0, ips: [] });
          }

          if (like && !stockInfo.ips.includes(ipHash)) {
            stockInfo.ips.push(ipHash);
            stockInfo.likes += 1;
          }

          await stockInfo.save();
          return { stock: symbol, price, likes: stockInfo.likes };
        }));

        if (stockData.length === 2) {
          const rel_likes = stockData[0].likes - stockData[1].likes;
          stockData[0].rel_likes = rel_likes;
          stockData[1].rel_likes = -rel_likes;
          delete stockData[0].likes;
          delete stockData[1].likes;
        }

        res.json({ stockData: stockData.length === 1 ? stockData[0] : stockData });
      } catch (error) {
        res.status(500).send('Error fetching stock data');
      }
    });
};

