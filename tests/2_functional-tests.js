const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Viewing one stock', done => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'msft' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        done();
      });
  });

  test('Viewing one stock and liking it', done => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'msft', like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, 'likes');
        done();
      });
  });

  test('Viewing the same stock and liking it again (like count should not increase)', done => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'msft', like: true })
      .end((err, res) => {
        const initialLikes = res.body.stockData.likes;
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'msft', like: true })
          .end((err, res) => {
            assert.equal(res.body.stockData.likes, initialLikes);
            done();
          });
      });
  });

  test('Viewing two stocks', done => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['msft', 'aapl'] })
      .end((err, res) => {
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        done();
      });
  });

  test('Viewing two stocks and liking them', done => {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['msft', 'aapl'], like: true })
      .end((err, res) => {
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], 'rel_likes');
        done();
      });
  });
});

