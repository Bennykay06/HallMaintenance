const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'assets', 'screens');
fs.readdirSync(dir).forEach(file => {
  if(!file.endsWith('.tsx')) return;
  if(file === 'LoginScreen.tsx' || file === 'RegisterScreen.tsx') return; // Skip auth
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Replace color: '#FFFFFF' with color: theme.primaryText ONLY for specific style properties
  const lines = content.split('\n');
  for(let i=0; i<lines.length; i++) {
    const line = lines[i];
    if(line.includes("color: '#FFFFFF'")) {
      // Check the previous line to see what class it is
      if(i > 0) {
        const prevLine = lines[i-1];
        if(prevLine.toLowerCase().includes('text') || prevLine.toLowerCase().includes('arrow') || prevLine.toLowerCase().includes('icon')) {
          // It's probably text on a button or an icon on a button
          lines[i] = line.replace("'#FFFFFF'", "theme.primaryText");
        }
      }
    }
  }
  
  content = lines.join('\n');
  fs.writeFileSync(path.join(dir, file), content, 'utf8');
  console.log('Fixed button text colors in', file);
});
