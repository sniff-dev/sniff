/* eslint-env node */

const branch = process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_BRANCH;

const config = {
  branches: [
    {
      name: 'main',
      channel: 'latest',
    },
  ],
  tagFormat: 'web-v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/git',
      {
        assets: ['package.json'],
        message:
          'chore(release): @sniff-dev/web ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};

module.exports = config;
