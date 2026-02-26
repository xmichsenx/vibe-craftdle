/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/../tests/server"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          rootDir: "..",
          outDir: "./dist",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          resolveJsonModule: true,
          module: "commonjs",
          target: "ES2020",
        },
      },
    ],
  },
};
