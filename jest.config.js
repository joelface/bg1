module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  moduleNameMapper: {
    '^/(.*)': '<rootDir>/src/$1',
  },
  testEnvironment: 'jsdom',
};
