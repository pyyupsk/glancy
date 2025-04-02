// In .lintstagedrc.mjs
export default {
  '**/*.(ts|tsx|js|jsx)': [
    'npx prettier --write --ignore-unknown',
    'npx eslint --fix',
  ],
  'src/**/*.(ts|tsx|js|jsx)': [
    (files) => `npx tsc --noEmit ${files.join(' ')}`,
  ],
};
