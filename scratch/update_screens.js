const fs = require('fs');
const path = require('path');

const files = [
    'assets/screens/ProfileScreen.tsx',
    'assets/screens/EditProfileScreen.tsx',
    'assets/screens/NotificationSettingsScreen.tsx',
    'assets/screens/FacilityRulesScreen.tsx',
    'assets/screens/HelpSupportScreen.tsx'
];

const replacements = [
    { regex: /backgroundColor:\s*'(#FFFFFF|#FFF)'/g, replacement: "backgroundColor: theme.surface" },
    { regex: /backgroundColor:\s*'#F3F3F3'/g, replacement: "backgroundColor: theme.surfaceContainer" },
    { regex: /backgroundColor:\s*'#F9F9F9'/g, replacement: "backgroundColor: theme.surfaceContainer" },
    { regex: /backgroundColor:\s*'#F0F0F0'/g, replacement: "backgroundColor: theme.surfaceContainer" },
    { regex: /backgroundColor:\s*'#F8F9FA'/g, replacement: "backgroundColor: theme.surfaceContainer" },
    { regex: /backgroundColor:\s*'#FAFAFA'/g, replacement: "backgroundColor: theme.surfaceContainer" },
    { regex: /borderBottomColor:\s*'#[A-F0-9]{6}'/gi, replacement: "borderBottomColor: theme.border" },
    { regex: /borderTopColor:\s*'#[A-F0-9]{6}'/gi, replacement: "borderTopColor: theme.border" },
    { regex: /borderColor:\s*'#E4BEBA'/gi, replacement: "borderColor: theme.border" },
    { regex: /borderColor:\s*'#[A-F0-9]{6}'/gi, replacement: "borderColor: theme.border" },
    { regex: /color:\s*'#1A1C1C'/gi, replacement: "color: theme.text" },
    { regex: /color:\s*'#333333'/gi, replacement: "color: theme.text" },
    { regex: /color:\s*'#000000'/gi, replacement: "color: theme.text" },
    { regex: /color:\s*'#5B403D'/gi, replacement: "color: theme.textSecondary" },
    { regex: /color:\s*'#666666'/gi, replacement: "color: theme.textSecondary" },
    { regex: /color:\s*'#888888'/gi, replacement: "color: theme.textSecondary" },
    { regex: /color:\s*'#999999'/gi, replacement: "color: theme.textSecondary" },
    { regex: /color:\s*'#FFFFFF'/gi, replacement: "color: theme.primaryText" },
    { regex: /color:\s*'#FFF'/gi, replacement: "color: theme.primaryText" },
];

for (const filepath of files) {
    if (fs.existsSync(filepath)) {
        let code = fs.readFileSync(filepath, 'utf8');
        
        for (const { regex, replacement } of replacements) {
            code = code.replace(regex, replacement);
        }
        
        fs.writeFileSync(filepath, code);
        console.log(`Updated ${filepath}`);
    } else {
        console.log(`File not found: ${filepath}`);
    }
}
