import {spawnSync} from 'node:child_process';
import {Command} from 'commander';

const ALL_PLATFORMS = ['myparcel', 'sendmyparcel', 'flespakket'];

const program = new Command();

const callback = (platform: string, {environment, watch}) => {
  const platforms = platform === 'all' ? ALL_PLATFORMS : [platform];

  void Promise.all(
    platforms.map((platform) => {
      let outDir = `dist/${platform}`;

      if (environment !== 'production') {
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
  .argument('[platform]', 'platform', 'all')
  .option('--environment <environment>', 'Environment', 'production')
  .option('--watch', 'Watch mode')
  .action(callback);

program.parse(process.argv);
