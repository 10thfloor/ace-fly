#!/usr/bin/env node

import * as AceCLI from '../src/cli/AceCLI.js';

const [,, command, ...args] = process.argv;

switch (command) {
  case 'deploy':
    AceCLI.deploy(args);
    break;
  case 'dev':
    AceCLI.dev(args);
    break;
  default:
    console.log('Unknown command');
}