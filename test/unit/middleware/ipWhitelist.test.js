const { sinon, expect } = require('test/unit/util/chai');
const config = require('config');
const ipWhitelist = require('middleware/ipWhitelist');

describe('middleware/ipWhitelist', () => {
  it('adds ipWhitelisted to locals on IP match', () => {
    config.services.tableau.whiteListedIpRange = ['192.168.1.1'];
    const req = { ip: '192.168.1.1', headers: {} };
    const res = { locals: {} };
    const next = sinon.stub();

    ipWhitelist(req, res, next)

    expect(res.locals.ipWhitelisted).to.eql(true);
    sinon.assert.calledOnce(next);
  });

  it('adds matches ip from x-forwarded-for header ', () => {
    config.services.tableau.whiteListedIpRange = ['192.168.1.1'];
    const req = { ip: 'no-ip', headers: { 'x-forwarded-for': '192.168.1.1' } };
    const res = { locals: {} };
    const next = sinon.stub();

    ipWhitelist(req, res, next)

    expect(res.locals.ipWhitelisted).to.eql(true);
    sinon.assert.calledOnce(next);
  });

  it('matches first ip from x-forwarded-for header ', () => {
    config.services.tableau.whiteListedIpRange = ['192.168.1.1'];
    const req = { ip: 'no-ip', headers: { 'x-forwarded-for': '192.168.1.1, 192.168.1.10' } };
    const res = { locals: {} };
    const next = sinon.stub();

    ipWhitelist(req, res, next)

    expect(res.locals.ipWhitelisted).to.eql(true);
    sinon.assert.calledOnce(next);
  });

  it('doesnt add ipWhitelisted to locals on IP mismatch', () => {
    config.services.tableau.whiteListedIpRange = ['192.168.1.100'];
    const req = { ip: '192.168.1.1', headers: {} };
    const res = { locals: {} };
    const next = sinon.stub();

    ipWhitelist(req, res, next)

    expect(res.locals.ipWhitelisted).to.be.undefined;
    sinon.assert.calledOnce(next);
  });
})