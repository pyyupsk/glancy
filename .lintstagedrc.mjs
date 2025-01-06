export default {
  '*': 'npx prettier --write --ignore-unknown',
  '**/*.(ts|tsx|js|jsx)': (filenames) => {
    return [
      `npx eslint --fix ${filenames.map((f) => JSON.stringify(f)).join(' ')}`,
      `npx tsc --noEmit ${filenames.map((f) => JSON.stringify(f)).join(' ')}`,
    ];
  },
};
