const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'assets', 'screens');
const ALL_ICONS = [
  'PersonIcon', 'GearIcon', 'ClipboardIcon', 'CalendarIcon', 'WrenchIcon', 
  'BellIcon', 'SnowflakeIcon', 'LockIcon', 'BoltIcon', 'DropIcon', 
  'HammerIcon', 'BrickIcon', 'CameraIcon', 'ImageIcon', 'VideoIcon', 
  'FolderIcon', 'CloseIcon', 'PlayIcon', 'ArrowLeftIcon', 'ArrowRightIcon', 
  'SchoolIcon', 'SearchIcon', 'GroupsIcon', 'EngineeringIcon', 'SecurityIcon', 
  'SanitizerIcon', 'MailIcon', 'LocationIcon'
];

fs.readdirSync(screensDir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(screensDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Find all used icons in this file
  const usedIcons = ALL_ICONS.filter(icon => content.includes(`<${icon}`) || content.includes(`${icon} `) || content.includes(`${icon},`));
  if (usedIcons.length === 0) return;

  // Remove existing Icons imports to rewrite them cleanly
  const importRegex1 = /import\s+\{[^}]+\}\s+from\s+'\.\.\/components\/Icons';?\s*/g;
  const importRegex2 = /import\s+\{[^}]+\}\s+from\s+"\.\.\/components\/Icons";?\s*/g;
  
  content = content.replace(importRegex1, '');
  content = content.replace(importRegex2, '');

  // Check if we accidentally added imports to the middle of the file from the previous script
  const badImportRegex = /import\s+\{[^}]+\}\s+from\s+'\.\.\/components\/Icons';?/g;
  content = content.replace(badImportRegex, '');

  // Prepend the clean import after the first line (usually a comment or standard import)
  const lines = content.split('\n');
  let insertIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      insertIndex = i;
      break;
    }
  }

  const importStatement = `import { ${usedIcons.join(', ')} } from '../components/Icons';\n`;
  lines.splice(insertIndex, 0, importStatement);
  
  content = lines.join('\n');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports in ${file}: ${usedIcons.join(', ')}`);
});
