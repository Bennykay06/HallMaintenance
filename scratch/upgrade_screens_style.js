const fs = require('fs');
const path = require('path');

const filesToUpgrade = [
  'assets/screens/ProfileScreen.tsx',
  'assets/screens/EditProfileScreen.tsx',
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

  // Upgrade border radii
  content = content.replace(/borderRadius:\s*12/g, 'borderRadius: 24');
  content = content.replace(/borderRadius:\s*8/g, 'borderRadius: 16');
  
  // Upgrade shadows for softer, broader premium feel
  content = content.replace(/shadowOpacity:\s*0\.04/g, 'shadowOpacity: 0.08');
  content = content.replace(/shadowOpacity:\s*0\.1/g, 'shadowOpacity: 0.15');
  content = content.replace(/shadowOpacity:\s*0\.2/g, 'shadowOpacity: 0.25');
  
  content = content.replace(/shadowRadius:\s*4/g, 'shadowRadius: 12');
  content = content.replace(/shadowRadius:\s*8/g, 'shadowRadius: 20');
  
  content = content.replace(/elevation:\s*2/g, 'elevation: 8');
  content = content.replace(/elevation:\s*4/g, 'elevation: 12');

  // Remove generic borders to let the shadows shine and look cleaner
  content = content.replace(/borderWidth:\s*1,/g, 'borderWidth: 0,');
  content = content.replace(/borderBottomWidth:\s*1,/g, 'borderBottomWidth: 0.5,');
  
  // Make inputs look sleeker
  content = content.replace(/borderBottomColor:\s*theme\.border,/g, 'borderBottomColor: \'rgba(0,0,0,0.1)\',');

  // Increase paddings slightly for airier design
  content = content.replace(/padding:\s*14/g, 'padding: 20');
  content = content.replace(/padding:\s*16/g, 'padding: 24');

  // Add more spacing between cards
  content = content.replace(/marginBottom:\s*24/g, 'marginBottom: 32');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Upgraded styles in ${file}`);
});
