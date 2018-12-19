const fs = require('fs');
const path = require('path');
const r2 = require('r2');
const trash = require('trash');
const Git = require('nodegit');
const copydir = require('copy-dir');
const npminit = require('npm');
const { xor } = require('lodash');
const semver = require('semver');
const packageJson = require('./package.json');

const registry = 'https://registry.npmjs.org';
let currentPosition = 0;
let tagLength = 0;
let distTags = [];

(async () => {
  const originRawRes = await r2('https://registry.npmjs.org/bootstrap').response;
  const originRes = await originRawRes.json();
  const rawOriginReleases = originRes.versions;
  const originReleasesTagName = Object.keys(rawOriginReleases).map(release => `v${release}`);
  distTags = originRes['dist-tags'];

  const nojsRes = await r2('https://registry.npmjs.org/bootstrap-nojs').json;
  const rawNojsReleases = nojsRes.versions;
  const nojsReleasesTagName = Object.keys(rawNojsReleases).map(release => `v${release}`);

  const needRelease = xor(originReleasesTagName, nojsReleasesTagName, [
    'v3.3.7',
    'v3.3.6',
    'v4.1.3',
    'v4.1.2',
    'v4.1.1',
    'v4.1.0',
    'v4.0.0',
    'v4.0.0-beta.3',
    'v4.0.0-beta.2',
    'v4.0.0-beta',
    'v4.0.0-alpha.6',
    'v4.0.0-alpha.5',
    'v4.0.0-alpha.4',
    'v4.0.0-alpha.3',
    'v4.0.0-alpha.2',
  ]).filter(version => semver.gt(version, '3.3.5'));
  tagLength = needRelease.length;

  if (!needRelease.length) return;

  if (fs.existsSync('./bootstrap')) { await trash(['./bootstrap']); }
  await Git.Clone.clone('https://github.com/twbs/bootstrap', 'bootstrap');
  const repo = await Git.Repository.open(path.resolve(__dirname, 'bootstrap'));

  checkout(repo, needRelease, tagLength);
  await trash(['bootstrap*', '!bootstrap']);
})();

const checkout = (repo, versions, tagLength) => {
  const version = versions[currentPosition];
  let commit = null;
  Git.Reference.dwim(repo, `refs/tags/${version}`).then(function (ref) {
    return ref.peel(Git.Object.TYPE.COMMIT);
  }).then(function (ref) {
    return repo.getCommit(ref);
  }).then((rawCommit) => {
    commit = rawCommit;
    return Git.Checkout.tree(repo, commit, { checkoutStrategy: Git.Checkout.STRATEGY.SAFE });
  }).then(() => {
    return repo.setHeadDetached(commit, repo.defaultSignature, "Checkout: HEAD " + commit.id());
  }).then(async () => {
    await trash(['bootstrap*', '!bootstrap']);
    copydir.sync('./bootstrap/dist/css', '.');
    packageJson.version = version.substr(1);
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2), 'utf8');
    npminit.load({
    }, (er, npm) => {
      if (er) throw er;
      npm.config.setCredentialsByURI(registry, { token: process.env.NPM_TOKEN });
      npm.commands.publish(['.'], async () => {
        if (currentPosition < tagLength - 1) {
          currentPosition++;
          checkout(repo, versions, tagLength);
        } else {
          await trash(['bootstrap*', '!bootstrap']);
          Object.keys(distTags).map(tag => {
            npm.commands['dist-tag'](['add', `bootstrap-nojs@${distTags[tag]}`, tag]);
          });
        }
      });
    });
  }).catch(console.error);
};
