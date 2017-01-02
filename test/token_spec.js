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

    it('create a new token (group and generic)', (done) => {
        tokenCore.createGroupToken(GROUP.name, 'basic')
        .then((res) => {
            expect(res).to.be.string;
            return Promise.resolve();
        })
        .then(() => tokenCore.createGroupToken(GROUP.name, 'supervisor', 'Organization A'))
        .then((res) => {
            expect(res).to.be.string;
            return Promise.resolve();
        })
        .then(() => tokenCore.createGenericToken('Generic client'))
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
            expect(tokens[0]).to.have.property('role', 'basic');
            expect(tokens[0]).to.have.property('group_name', GROUP.name);

            expect(tokens[1]).to.have.property('token');
            expect(tokens[1]).to.have.property('role', 'supervisor');
            expect(tokens[1]).to.have.property('group_name', GROUP.name);

            expect(tokens[2]).to.have.property('token');
            expect(tokens[2]).to.have.property('role', 'generic');
            expect(tokens[2]).to.have.property('group_name', null);

            done();
        });
    });

    it('with group token client can access only to specific group');

    it('with generic token client can access all features');
});
