const fs = require('fs');
const r2 = require('r2');
const trash = require('trash');
const Git = require('nodegit');
const copydir = require('copy-dir');
const npminit = require('npm');
const packageJson = require('./package.json');

(async () => {
  const data = await r2('https://api.github.com/repos/twbs/bootstrap/releases/latest', {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  }).json;

  const tagName = data.tag_name;
  if (!tagName) {
    console.error('Can\'t get tag name of bootstrap');
    process.exit(1);
  }
  const currentVersion = tagName.substr(1);

  const packageOnNPM = await r2('https://registry.npmjs.org/bootstrap-nojs').json;

  if (currentVersion === packageOnNPM['dist-tags'].latest) {
    console.error('This version is published');
    process.exit(1);
  }

  if (fs.existsSync('./bootstrap')) {
    await trash(['./bootstrap']);
  }

  Git.Clone('https://github.com/twbs/bootstrap', 'bootstrap').then(() => {
    copydir.sync('./bootstrap/dist/css', '.');

    packageJson.version = currentVersion;
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2), 'utf8');

    const registry = 'https://registry.npmjs.org';

    // publish
    npminit.load({

    }, (er, npm) => {
      if (er) throw er;

      npm.config.setCredentialsByURI(registry, { token: process.env.NPM_TOKEN });

      npm.commands.publish(['.']);
    });
  }).catch(console.error);
})();
