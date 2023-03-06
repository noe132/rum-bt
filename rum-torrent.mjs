#!/usr/bin/env node

import { torrent } from 'rum-torrent';
import { parseArgs } from 'node:util';
import axios from 'axios';

// https://kgrz.io/node-has-native-arg-parsing.html
const { values: args } = parseArgs({
  options: {
    seed: {
      type: 'string',
      short: 's',
      default: '',
    },
    port: {
      type: 'string',
      short: 'p',
    },
  },
});

if (!args.seed) {
  console.log('Please provide a file to seed or torrent-info(.torrent or magnet link) to download.');
  process.exit(1);
}

await torrent.init({
  callback: (summary) => {
    axios.request({
      url: `http://127.0.0.1:${args.port}/pt-summary`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(summary),
    });
    // const req = request(`http://127.0.0.1:${args.port}/pt-summary`);
    // req.write(JSON.stringify(summary));
    // req.end();
  },
});

await torrent.seed(args.seed);
