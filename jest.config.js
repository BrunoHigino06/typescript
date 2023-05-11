const config = {
  verbose: true,
  coverageReporters: [
    'clover',
    'json',
    'lcov',
    'text-summary',
    [
      'text',
      {
        skipFull: false,
      },
    ],
  ],
  roots: ['./test/infra'],
  testEnvironment: 'jsdom',
  coverageDirectory: 'test/test-reports/coverage',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 20,
      lines: 40,
      statements: 40,
    },
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test/test-reports/xunit',
        outputName: 'ut_report.xml',
      },
    ],
  ],
  collectCoverageFrom: ['infra/lib/**/*.ts'],
  moduleNameMapper: {
    '#node-web-compat': './node-web-compat-node.js',
    '^nimma/legacy$': 'nimma/dist/legacy/cjs/index.js',
    '^nimma/fallbacks$': 'nimma/dist/cjs/fallbacks/index.js',
  },
};

module.exports = config;
