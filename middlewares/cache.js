// cacheMiddleware.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 }); // Set cache expiry to 60 seconds

function cacheMiddleware(req, res, next) {
  const cachedData = cache.get(req.originalUrl);

  if (cachedData) {
    // Data is in the cache, return it
    res.json(cachedData);
  } else {
    // Data is not in the cache, proceed to route handling
    next();
  }
}

module.exports = {cacheMiddleware};