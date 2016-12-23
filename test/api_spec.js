const path      = require('path');
const chai      = require('chai');
const expect    = chai.expect;
const assert    = chai.assert;
const request   = chai.request;

const cfg   = require('../config');

const UNAUTHORIZED = 401;

const app = require(path.join(cfg.buildDir, 'app'));

describe('API', () => {

    const api = app.createApp(cfg);

    it('should unauthorize client without token', (done) => {
        request(api)
            .get('/api/users')
            .end((err, res) => {
                expect(err).not.to.be.undefined;
                expect(err.status).to.equal(UNAUTHORIZED);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('ok', false);
                done();
            });
    });

});
