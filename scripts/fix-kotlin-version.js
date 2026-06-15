const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targetVersion = '1.9.25';

function replaceInFile(filePath, patterns, replacement) {
  const fullPath = path.join(root, filePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  const contents = fs.readFileSync(fullPath, 'utf8');
  if (contents.includes(replacement)) {
    return;
  }

  let nextContents = contents;
  for (const pattern of patterns) {
    if (pattern.test(nextContents)) {
      nextContents = nextContents.replace(pattern, replacement);
      fs.writeFileSync(fullPath, nextContents);
      return;
    }
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
