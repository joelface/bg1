module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  testEnvironment: 'jest-environment-jsdom-global',
  setupFilesAfterEnv: ['./jest-setup.ts'],
};
