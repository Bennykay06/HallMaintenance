const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'assets', 'screens');

const colorMap = {
  "'#AF101A'": 'theme.primary',
  '"#AF101A"': 'theme.primary',
  "'#D32F2F'": 'theme.primaryContainer',
  '"#D32F2F"': 'theme.primaryContainer',
  "'#F9F9F9'": 'theme.background',
  '"#F9F9F9"': 'theme.background',
};

fs.readdirSync(screensDir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  
  // Skip the ones we already modified manually
  if (['HomeScreen.tsx', 'LoginScreen.tsx', 'OnboardingScreen.tsx'].includes(file)) return;
  
  const filePath = path.join(screensDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('useTheme(')) return; // already processed
  
  if (!content.includes('StyleSheet.create')) return; // No styles
  
  // 1. Add import
  const importLines = content.split('\n');
  let insertIdx = importLines.findIndex(l => l.startsWith('import '));
  if (insertIdx === -1) insertIdx = 0;
  
  // Insert import
  importLines.splice(insertIdx, 0, "import { useTheme } from '../context/ThemeContext';");
  content = importLines.join('\n');
  
  // 2. Add hook to default export component
  const componentRegex = /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/;
  content = content.replace(componentRegex, (match, p1, p2) => {
    return match + "\n  const { theme } = useTheme();\n  const styles = getStyles(theme);";
  });
  
  // 3. Change const styles = StyleSheet.create to const getStyles = (theme: any) => StyleSheet.create
  content = content.replace(/const\s+styles\s*=\s*StyleSheet\.create/g, 'const getStyles = (theme: any) => StyleSheet.create');
  
  // 4. In JSX, we need to make sure we don't have `<StatusBar backgroundColor="#F9F9F9" />`
  // For JSX props (e.g. color="#AF101A")
  content = content.replace(/color="#AF101A"/g, "color={theme.primary}");
  content = content.replace(/backgroundColor="#F9F9F9"/g, "backgroundColor={theme.background}");
  content = content.replace(/color="#D32F2F"/g, "color={theme.primaryContainer}");
  content = content.replace(/colors=\{\['#AF101A',\s*'#D32F2F'\]\}/g, "colors={[theme.primary, theme.primaryContainer]}");
  
  // For StyleSheet (which is now getStyles)
  for (const [hex, themeVar] of Object.entries(colorMap)) {
    content = content.split(hex).join(themeVar);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed', file);
});
