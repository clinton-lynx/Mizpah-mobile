const fs = require('fs');
const path = require('path');

const root = process.cwd();

function replaceInFile(filePath, from, to) {
  const fullPath = path.join(root, filePath);
  const contents = fs.readFileSync(fullPath, 'utf8');
  if (!contents.includes(from)) {
    throw new Error(`Expected to find "${from}" in ${filePath}`);
  }
  fs.writeFileSync(fullPath, contents.replace(from, to));
}

replaceInFile(
  'node_modules/react-native/gradle/libs.versions.toml',
  'kotlin = "1.9.24"',
  'kotlin = "1.9.25"'
);

replaceInFile(
  'node_modules/@react-native/gradle-plugin/gradle/libs.versions.toml',
  'kotlin = "1.9.24"',
  'kotlin = "1.9.25"'
);

replaceInFile(
  'node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle',
  ': "1.9.24"',
  ': "1.9.25"'
);
