import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'node:fs';

const LICENSE_HEADER = `/*
 * Copyright ${new Date().getFullYear()} Pongsakorn Thipayanate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

`;

const addLicenseHeader = (filePath: string) => {
  try {
    const content = readFileSync(filePath, 'utf8');

    if (content.includes('Apache License')) {
      console.log(
        `    🔄 Skipping \x1b[33m${filePath}\x1b[0m - License header already exists`
      );
      return;
    }

    let newContent = content.replace(/^\/\*[\s\S]*?\*\/\s*/, '');
    newContent = LICENSE_HEADER + newContent;

    writeFileSync(filePath, newContent);
    console.log(`    ✅ License header added to \x1b[32m${filePath}\x1b[0m`);
  } catch (error) {
    console.error(`    ❌ Error processing \x1b[31m${filePath}\x1b[0m:`, error);
  }
};

const processFiles = async () => {
  const srcFiles = await glob('src/**/*.ts');
  const distFiles = await glob('dist/*');
  const allFiles = [...srcFiles, ...distFiles];

  console.log(`\n===========================================`);
  console.log(`    📝 Starting License Header Addition...`);
  console.log(`===========================================\n`);

  if (allFiles.length === 0) {
    console.log('    ⚠️ No matching files found.');
    console.log(`===========================================\n`);
    return;
  }

  console.log(`    🔍 Found ${allFiles.length} files to process:\n`);

  allFiles.forEach((file) => {
    addLicenseHeader(file);
  });

  console.log(`\n===========================================`);
  console.log(`    🎉 License header addition complete!`);
  console.log(`===========================================\n`);
};

processFiles();
