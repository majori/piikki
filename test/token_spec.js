const expect    = require('chai').expect;
const path = require('path');
const Promise = require('bluebird');

const cfg = require('../config');
const helper = require('./helpers');

const tokenCore = require(path.join(cfg.buildDir, 'core/token-core'));
const groupCore = require(path.join(cfg.buildDir, 'core/group-core'));
const userCore = require(path.join(cfg.buildDir, 'core/user-core'));

describe('Tokens', () => {

    const GROUP = helper.group;

    before((done) => {
        helper.clearDb()
        .then(helper.initializeUserAndGroup)
        .then(() => done())
    });

    it('create a new token (restricted and global)', (done) => {
        tokenCore.createRestrictedToken(GROUP.name, 'Organization A')
        .then((res) => {
            expect(res).to.be.string;
            return Promise.resolve();
        })
        .then(() => tokenCore.createGlobalToken('For my buddy Bob'))
        .then((res) => {
            expect(res).to.be.string;
            done();
        });
    });

    it('get existing tokens from database', (done) => {
        tokenCore.getTokens()
        .then((tokens) => {
            expect(tokens).to.be.an.array;
            expect(tokens).to.have.length(3);

            expect(tokens[0]).to.have.property('token');
            expect(tokens[0]).to.have.property('role', 'restricted');
            expect(tokens[0]).to.have.property('group_name', GROUP.name);

            expect(tokens[2]).to.have.property('token');
            expect(tokens[2]).to.have.property('role', 'global');
            expect(tokens[2]).to.have.property('group_name', null);

            done();
        });
    });
});
