const showBanner = require('node-banner');
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const printBanner = async (title, color) => {
  await showBanner(title, '', color);
};

printBanner('Deploying', 'yellow');

const EnvDomain = {
  test: {
    host: '114.132.41.66',
    user: 'ys',
    password: 'b%RU470!',
    short: 'test',
  },
  production: {
    host: '43.142.154.244',
    user: 'ys',
    password: 'b%RU470!',
    short: 'prod',
  },
};

const env = EnvDomain[process.env.NODE_ENV];
const { user, host, password, short } = env;
printBanner(`Deploying ${short}`, 'yellow');

const config = {
  user,
  password,
  host,
  port: 21,
  localRoot: __dirname + '/public',
  remoteRoot: '/home',
  include: ['*', '**/*'],
  deleteRemote: true,
  forcePasv: true,
};

ftpDeploy
  .deploy(config)
  .then(() => printBanner(`Deploy ${short} Success`, 'green'))
  .catch(err => {
    console.log(err);
    printBanner(`Deploy ${short} failed`, 'red');
  });
