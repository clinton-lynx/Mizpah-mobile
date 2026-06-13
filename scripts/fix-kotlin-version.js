const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targetVersion = '1.9.25';

function replaceInFile(filePath, patterns, to) {
  const fullPath = path.join(root, filePath);
  const contents = fs.readFileSync(fullPath, 'utf8');
  if (contents.includes(to)) {
    return;
  }

  let nextContents = contents;
  let replaced = false;

  for (const pattern of patterns) {
    if (pattern.test(nextContents)) {
      nextContents = nextContents.replace(pattern, to);
      replaced = true;
      break;
    }
  }

  if (replaced) {
    fs.writeFileSync(fullPath, nextContents);
  }
}

replaceInFile(
  'node_modules/react-native/gradle/libs.versions.toml',
  [/kotlin = "1\.9\.(24|25)"/],
  `kotlin = "${targetVersion}"`
);

replaceInFile(
  'node_modules/@react-native/gradle-plugin/gradle/libs.versions.toml',
  [/kotlin = "1\.9\.(24|25)"/],
  `kotlin = "${targetVersion}"`
);

replaceInFile(
  'node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle',
  [/: "1\.9\.(24|25)"/],
  `: "${targetVersion}"`
);
