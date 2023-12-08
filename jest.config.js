module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
  testEnvironment: 'jsdom',
  fakeTimers: {
    advanceTimers: true,
  },
};
