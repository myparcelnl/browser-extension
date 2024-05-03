#!/usr/bin/env node

import {spawnSync} from 'child_process';
import {Command} from 'commander';

const ALL_PLATFORMS = ['myparcel', 'sendmyparcel', 'flespakket'];

const program = new Command();

const callback = (platform, {environment}) => {
  const platforms = platform === 'all' ? ALL_PLATFORMS : [platform];

  return Promise.all(
    platforms.map((platform) => {
      let outDir = `dist/${platform}`;

      if (environment !== 'production') {
        outDir += `-${environment}`;
      }

      return spawnSync('npx', ['vite', 'build', '--mode', environment, '--outDir', outDir], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: {
          ...process.env,
          ENVIRONMENT: environment,
          PLATFORM: platform,
        },
      });
    }),
  );
};

program
  .name('builder')
  .description('CLI to build extension')
  .argument('[platform]', 'platform', 'all')
  .option('--environment <environment>', 'environment', 'production')
  .action(callback);

program.parse(process.argv);
