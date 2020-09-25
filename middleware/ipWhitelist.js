const config = require('config');
const ipRangeCheck = require("ip-range-check");

const ipWhitelist = (req, res, next) => {
  let ip = req.ip;
  if(req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(',')[0];
  }

  if (ipRangeCheck(ip, config.services.tableau.whiteListedIpRange)) {
    res.locals = res.locals || {};
    res.locals.ipWhitelisted = true;
  }
  return next()
}

module.exports = ipWhitelist;