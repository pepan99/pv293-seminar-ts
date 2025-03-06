# First seminar - NestJS project initialization

Welcome to the first seminar. In this seminar we will focus on project initialization.

## Description

This guide demonstrates how to set up a robust NestJS project using TurboRepo, along with essential tooling for code quality, documentation, performance testing, and deployment workflows.

## Prerequisites

- Node.js (v18 or newer) -- `nvm` is useful for managing node versions
- pnpm (`npm install -g pnpm`, `brew install pnpm`...)
- k6 (`brew install k6` or equivalent for your OS)

## Project Initialization

### 1. Create TurboRepo project

```bash
# Create a new turborepo workspace, choose `example` as name of project
pnpm dlx create-turbo@latest

```

### 2. Add NestJS API package

```bash
cd apps

# Initialize NestJS project, name it `api` or whatever you want
pnpm dlx @nestjs/cli new . --package-manager pnpm --skip-git --skip-install

# Return to the root
cd ../..

# Install dependencies from the root
pnpm install
```

## Code Quality Setup

### 1. ESLint, TSConfig and Prettier

Eslint, prettier and tsconfig are installed by default when initializing the default turborepo template. Take a look around the project, look at how these utilities are setup.

Create `.eslintrc.js` in the root:

```javascript
import nestJsConfig from "@repo/eslint-config/nest";

/** @type {import("eslint").Linter.Config} */
export default nestJsConfig;
```

Create `.prettierrc` in the root:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```
## NestJS app recipe goodies

### 1. Install Swagger dependencies and configure the main file in the API package

[NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction)

### 2. Install Hot Module Replacement when running single app instance at a time

[NestJS Hot Reload](https://docs.nestjs.com/recipes/hot-reload)

note - `turborepo` caches the nestjs app and incrementally compiles it when running `turbo run dev`
(for turbo to be able to call `dev` you need to add `"dev": "nest start --watch"` script to `api/package.json`)

## Git Hooks with Husky, Lint-staged, and Commitlint

### 1. Install dependencies

```bash
pnpm add -D -w husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### 2. Configure Husky

```bash
# Initialize Husky
pnpm add --save-dev -w husky
pnpm exec husky init
```

[Commitlint](https://commitlint.js.org/guides/local-setup.html)


In `.husky/pre-commit`:
```bash
pnpm dlx lint-staged
```

### 3. Create lint-staged config

Create `.lintstagedrc` in the root:

```json
{
  "*.css": [
    "prettier --write"
  ],
  "(*.ts|!*.d.ts)": [
    "prettier  --cache --cache-strategy metadata --ignore-unknown --write ",
    "eslint  --cache --cache-location ./node_modules/.cache/eslint --fix"
  ]
}
```

### 4. Create commitlint config

Create `commitlint.config.js` in the root:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

## k6 Performance Testing

### 1. Create k6 test directory and script

```bash
mkdir -p apps/api/test/k6-tests
```

Create `apps/api/test/k6-tests`, then `k6 new` to create a k6 test.

Run with `k6 run script.js`
