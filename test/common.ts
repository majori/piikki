process.env.NODE_ENV = 'test';

import { use } from 'chai';
import chaiSubset = require('chai-subset');
import chaiHttp = require('chai-http');
import chaiAsPromised = require('chai-as-promised');

use(chaiSubset);
use(chaiHttp);
use(chaiAsPromised);
