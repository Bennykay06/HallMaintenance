const fs = require('fs');
const path = require('path');

const filesToUpgrade = [
  'assets/screens/ProfileScreen.tsx',
  'assets/screens/NotificationSettingsScreen.tsx',
  'assets/screens/FacilityRulesScreen.tsx',
  'assets/screens/HelpSupportScreen.tsx'
];

const basePath = path.join(__dirname, '..');

filesToUpgrade.forEach(file => {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - does not exist.`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Safely map hardcoded colors to theme properties in StyleSheet
  content = content.replace(/'#FFFFFF'/g, 'theme.surface');
  content = content.replace(/'#F9F9F9'/g, 'theme.background');
  content = content.replace(/'#1A1C1C'/g, 'theme.text');
  content = content.replace(/'#5B403D'/g, 'theme.textSecondary');
  content = content.replace(/'#E4BEBA'/g, 'theme.border');
  content = content.replace(/'#AF101A'/g, 'theme.primary');
  content = content.replace(/'#D32F2F'/g, 'theme.primaryContainer');
  content = content.replace(/'#F3F3F3'/g, 'theme.surfaceContainer');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Upgraded colors in ${file}`);
});
