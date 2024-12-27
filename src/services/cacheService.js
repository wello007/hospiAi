const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 heure

class CacheService {
  generateKey(params) {
    return JSON.stringify(params);
  }

  get(scoreType, params) {
    const key = `${scoreType}:${this.generateKey(params)}`;
    return cache.get(key);
  }

  set(scoreType, params, result) {
    const key = `${scoreType}:${this.generateKey(params)}`;
    cache.set(key, result);
  }

  invalidate(pattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    matchingKeys.forEach(key => cache.del(key));
  }
}

module.exports = new CacheService(); 