import {spawnSync} from 'node:child_process';
import {Command} from 'commander';
import {Environment, PlatformName} from '../src/constants.js';

const program = new Command();

const BUILD_ALL = 'all';

const callback = (platform: string, {environment, watch}) => {
  const platforms = platform === BUILD_ALL ? Object.values(PlatformName) : [platform];

  const isProd = environment === Environment.Production;

  void Promise.all(
    platforms.map((platform) => {
      let outDir = `dist/${platform}`;

      if (!isProd) {
        outDir += `-${environment}`;
      }

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
};

program
  .name('builder')
  .description('CLI to build extension')
  .argument('[platform]', 'Platform', BUILD_ALL)
  .option('--environment <environment>', 'Environment', Environment.Production)
  .option('--watch', 'Watch mode')
  .action(callback);

program.parse(process.argv);
