const path = require('path');
const crypto = require('crypto');

// electron doesn't have crypto global var
global.crypto = crypto;

require('ts-node').register({
  transpileOnly: true,
  project: path.join(__dirname, 'src/main/tsconfig.json'),
});

require('./src/main/index');
