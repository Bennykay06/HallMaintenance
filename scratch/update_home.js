const fs = require('fs');
const path = require('path');

const homeScreenPath = path.join(__dirname, '..', 'assets', 'screens', 'HomeScreen.tsx');
let homeContent = fs.readFileSync(homeScreenPath, 'utf8');

const targetStr = '<TouchableOpacity style={styles.iconButton}>';
const replacementStr = '<TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate(\'NotificationSettings\')}>';

if (homeContent.includes(targetStr)) {
  homeContent = homeContent.replace(targetStr, replacementStr);
  fs.writeFileSync(homeScreenPath, homeContent, 'utf8');
  console.log('HomeScreen updated successfully');
} else {
  console.log('Could not find target string in HomeScreen');
}
