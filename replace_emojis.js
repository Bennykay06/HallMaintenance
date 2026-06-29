const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'assets', 'screens');

const replacements = [
  // ArticleDetailScreen
  { file: 'ArticleDetailScreen.tsx', search: '<Text style={styles.backButtonText}>←</Text>', replace: '<ArrowLeftIcon color="#AF101A" size={24} />' },
  { file: 'ArticleDetailScreen.tsx', search: '<Text style={styles.shareButtonText}>↗</Text>', replace: '<ArrowRightIcon color="#AF101A" size={20} />' },
  { file: 'ArticleDetailScreen.tsx', search: '<Text style={styles.articleMetaText}>📅 {article.date}</Text>', replace: '<View style={{flexDirection: "row", alignItems: "center"}}><CalendarIcon color="#8F6F6C" size={14} /><Text style={styles.articleMetaText}> {article.date}</Text></View>' },
  { file: 'ArticleDetailScreen.tsx', search: '<Text style={styles.modalCloseText}>✕</Text>', replace: '<CloseIcon color="#666" size={24} />' },
  { file: 'ArticleDetailScreen.tsx', search: '<Text style={styles.navIcon}>🏠</Text>', replace: '<PersonIcon color={styles.navIcon.color || "#666"} size={24} />' },
  { file: 'ArticleDetailScreen.tsx', search: '<Text style={styles.navIcon}>🔧</Text>', replace: '<WrenchIcon color={styles.navIcon.color || "#666"} size={24} />' },
  { file: 'ArticleDetailScreen.tsx', search: '<Text style={styles.navIcon}>📰</Text>', replace: '<ClipboardIcon color={styles.navIcon.color || "#666"} size={24} />' },
  { file: 'ArticleDetailScreen.tsx', search: '<Text style={styles.navIcon}>🆘</Text>', replace: '<BellIcon color={styles.navIcon.color || "#666"} size={24} />' },

  // EditProfileScreen
  { file: 'EditProfileScreen.tsx', search: '<Text style={styles.backButtonText}>←</Text>', replace: '<ArrowLeftIcon color="#AF101A" size={24} />' },
  { file: 'EditProfileScreen.tsx', search: '<Text style={styles.editPhotoText}>📷</Text>', replace: '<CameraIcon color="#FFFFFF" size={16} />' },

  // EmergencyScreen
  { file: 'EmergencyScreen.tsx', search: '<Text style={styles.primaryIcon}>📞</Text>', replace: '<PersonIcon color="#AF101A" size={32} />' },
  { file: 'EmergencyScreen.tsx', search: '<Text style={styles.primaryCallButtonText}>📞 Call Now</Text>', replace: '<View style={{flexDirection: "row", alignItems: "center"}}><PersonIcon color="#FFFFFF" size={20} /><Text style={styles.primaryCallButtonText}> Call Now</Text></View>' },
  { file: 'EmergencyScreen.tsx', search: '<Text style={styles.headerIcon}>🏫</Text>', replace: '<SchoolIcon color="#FFFFFF" size={80} />' },
  { file: 'EmergencyScreen.tsx', search: '<Text style={styles.callButtonText}>📞</Text>', replace: '<PersonIcon color="#AF101A" size={20} />' },

  // Add more mapping later if needed
];

// Helper to add import if not exists
function addImport(content, iconName) {
  if (content.includes(iconName)) return content;
  
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+'\.\.\/components\/Icons'/;
  const match = content.match(importRegex);
  
  if (match) {
    const icons = match[1].split(',').map(i => i.trim()).filter(i => i);
    if (!icons.includes(iconName)) icons.push(iconName);
    return content.replace(importRegex, `import { ${icons.join(', ')} } from '../components/Icons'`);
  } else {
    // add new import after the last import
    const lastImportIndex = content.lastIndexOf("import ");
    const endOfLastImport = content.indexOf("\n", lastImportIndex);
    return content.slice(0, endOfLastImport) + `\nimport { ${iconName} } from '../components/Icons';` + content.slice(endOfLastImport);
  }
}

// Global Regex Replacement for common emojis across ALL files
const globalReplacements = [
  { emoji: '>←<', comp: 'ArrowLeftIcon', size: 24, color: '#AF101A' },
  { emoji: '>✕<', comp: 'CloseIcon', size: 24, color: '#666' },
  { emoji: '>📷<', comp: 'CameraIcon', size: 24, color: '#666' },
  { emoji: '>🔧<', comp: 'WrenchIcon', size: 24, color: '#666' },
  { emoji: '>📅<', comp: 'CalendarIcon', size: 24, color: '#666' },
  { emoji: '>📋<', comp: 'ClipboardIcon', size: 24, color: '#666' },
  { emoji: '>👤<', comp: 'PersonIcon', size: 24, color: '#666' },
  { emoji: '>⚙️<', comp: 'GearIcon', size: 24, color: '#666' },
  { emoji: '>🔔<', comp: 'BellIcon', size: 24, color: '#666' },
  { emoji: '>📝<', comp: 'ClipboardIcon', size: 24, color: '#666' },
  { emoji: '>✔️<', comp: 'PersonIcon', size: 24, color: '#666' }, // dummy
];

fs.readdirSync(screensDir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(screensDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Process specific replacements
  replacements.filter(r => r.file === file).forEach(r => {
    if (content.includes(r.search)) {
      content = content.replace(r.search, r.replace);
      // Auto-extract Icon names like <ArrowLeftIcon
      const match = r.replace.match(/<([A-Z][a-zA-Z0-9]+Icon)/g);
      if (match) {
        match.forEach(m => {
          content = addImport(content, m.substring(1));
        });
      }
    }
  });

  // Regex for <Text ...>EMOJI</Text> -> <Icon />
  const emojiRegex = /<Text[^>]*>([^<]+)<\/Text>/g;
  content = content.replace(emojiRegex, (match, textContent) => {
    // If exact match to a single emoji
    if (textContent.trim() === '←') {
      content = addImport(content, 'ArrowLeftIcon');
      return `<ArrowLeftIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '✕') {
      content = addImport(content, 'CloseIcon');
      return `<CloseIcon color="#333" size={24} />`;
    }
    if (textContent.trim() === '📷') {
      content = addImport(content, 'CameraIcon');
      return `<CameraIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🔧') {
      content = addImport(content, 'WrenchIcon');
      return `<WrenchIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '📅') {
      content = addImport(content, 'CalendarIcon');
      return `<CalendarIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '📋') {
      content = addImport(content, 'ClipboardIcon');
      return `<ClipboardIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '👤') {
      content = addImport(content, 'PersonIcon');
      return `<PersonIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '⚙️') {
      content = addImport(content, 'GearIcon');
      return `<GearIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🔔') {
      content = addImport(content, 'BellIcon');
      return `<BellIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '📝') {
      content = addImport(content, 'ClipboardIcon');
      return `<ClipboardIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '✔️' || textContent.trim() === '✓') {
      content = addImport(content, 'PersonIcon');
      return `<PersonIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🎉') {
      content = addImport(content, 'PersonIcon');
      return `<PersonIcon color="#AF101A" size={48} />`;
    }
    if (textContent.trim() === '🏛️') {
      content = addImport(content, 'SchoolIcon');
      return `<SchoolIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🏫') {
      content = addImport(content, 'SchoolIcon');
      return `<SchoolIcon color="#FFFFFF" size={80} />`;
    }
    if (textContent.trim() === '📞') {
      content = addImport(content, 'PersonIcon');
      return `<PersonIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🆘') {
      content = addImport(content, 'BellIcon');
      return `<BellIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '📰') {
      content = addImport(content, 'ClipboardIcon');
      return `<ClipboardIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🏠') {
      content = addImport(content, 'PersonIcon');
      return `<PersonIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🛡️') {
      content = addImport(content, 'SecurityIcon');
      return `<SecurityIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '👮') {
      content = addImport(content, 'PersonIcon');
      return `<PersonIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🧯') {
      content = addImport(content, 'SanitizerIcon');
      return `<SanitizerIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '💧') {
      content = addImport(content, 'DropIcon');
      return `<DropIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '⚡') {
      content = addImport(content, 'BoltIcon');
      return `<BoltIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🔨') {
      content = addImport(content, 'HammerIcon');
      return `<HammerIcon color="#AF101A" size={24} />`;
    }
    if (textContent.trim() === '🧱') {
      content = addImport(content, 'BrickIcon');
      return `<BrickIcon color="#AF101A" size={24} />`;
    }
    
    return match;
  });

  // Final manual inline fixes
  if (content.includes('📅 {')) {
    content = content.replace(/<Text[^>]*>📅 (\{[^}]+\})<\/Text>/g, '<View style={{flexDirection: "row", alignItems: "center"}}><CalendarIcon color="#8F6F6C" size={14} /><Text style={{color: "#8F6F6C", marginLeft: 4}}>$1</Text></View>');
    content = addImport(content, 'CalendarIcon');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
