#!/usr/bin/env node

/* eslint-disable no-console,@typescript-eslint/no-magic-numbers */
import * as fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {Command} from 'commander';
import chalk from 'chalk';
import archiver from 'archiver';
import {Environment, PlatformName} from '../src/constants.js';

const program = new Command();

const BUILD_ALL = 'all';

const zipFolder = (source: string, dest: string): Promise<void> => {
  const archive = archiver('zip', {zlib: {level: 9}});
  const stream = fs.createWriteStream(dest);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', (err) => {
        console.log(chalk.red(`failed to zip ${chalk.cyan(source)} to ${chalk.magenta(dest)}`));
        reject(err);
      })
      .pipe(stream);

    stream.on('close', () => {
      const destSize = (archive.pointer() / 1024).toFixed(2);
      const sizeMsg = chalk.gray.bold(`${destSize} kB`);

      console.log(chalk.green(`✓ zipped ${chalk.cyan(source)} to ${chalk.magenta(dest)}`.padEnd(90) + sizeMsg));

      resolve(undefined);
    });

    void archive.finalize();
  });
};

const callback = async (platform: string, {environment, watch, zip}) => {
  const platforms = platform === BUILD_ALL ? Object.values(PlatformName) : [platform];

  const isProd = environment === Environment.Production;

  await Promise.all(
    platforms.map((platform) => {
      const buildName = isProd ? platform : `${platform}-${environment}`;
      const outDir = `dist/${buildName}`;

      const command: string[] = ['vite', 'build', '--mode', environment, '--outDir', outDir];

      if (watch) {
        command.push('--watch');
      }

      return spawnSync('npx', command, {
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

  if (zip) {
    await Promise.all(
      platforms.map((platform) => {
        const buildName = isProd ? platform : `${platform}-${environment}`;
        const outDir = `dist/${buildName}`;

        return zipFolder(outDir, `dist/${buildName}.zip`);
      }),
    );
  }
};

program
  .name('builder')
  .description('Build the extension.')
  .argument('[platform]', 'Platform', BUILD_ALL)
  .option('--environment <environment>', 'Environment', Environment.Production)
  .option('--watch', 'Watch mode')
  .option('--zip', 'Zip build output')
  .action(callback);

program.parse(process.argv);
