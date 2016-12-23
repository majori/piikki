process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const chaiHttp = require('chai-http');

chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(chaiHttp);
