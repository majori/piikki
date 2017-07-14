process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiSubset = require('chai-subset');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiSubset);
chai.use(chaiHttp);
chai.use(chaiAsPromised);
