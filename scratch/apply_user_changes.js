const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..');

// 1. Remove avatars from headers
const notifPath = path.join(basePath, 'assets', 'screens', 'NotificationSettingsScreen.tsx');
let notifContent = fs.readFileSync(notifPath, 'utf8');
notifContent = notifContent.replace(/<View style=\{styles\.avatar\}>\s*<Text style=\{styles\.avatarText\}>\{getInitials\(\)\}<\/Text>\s*<\/View>/g, '<View style={{ width: 40 }} />');
fs.writeFileSync(notifPath, notifContent);

const helpPath = path.join(basePath, 'assets', 'screens', 'HelpSupportScreen.tsx');
let helpContent = fs.readFileSync(helpPath, 'utf8');
helpContent = helpContent.replace(/<View style=\{styles\.avatar\}>\s*<Text style=\{styles\.avatarText\}>\{getInitials\(\)\}<\/Text>\s*<\/View>/g, '<View style={{ width: 40 }} />');
fs.writeFileSync(helpPath, helpContent);

const facilityPath = path.join(basePath, 'assets', 'screens', 'FacilityRulesScreen.tsx');
let facilityContent = fs.readFileSync(facilityPath, 'utf8');
facilityContent = facilityContent.replace(/<View style=\{styles\.headerRight\}>\s*<SchoolIcon color=\{theme\.primary\} size=\{24\} \/>\s*<View style=\{styles\.avatar\}>\s*<Text style=\{styles\.avatarText\}>\{getInitials\(\)\}<\/Text>\s*<\/View>\s*<\/View>/g, '<View style={styles.headerRight}>\n          <SchoolIcon color={theme.primary} size={24} />\n        </View>');
fs.writeFileSync(facilityPath, facilityContent);

// 2. Modify "edit profile to be visible" in ProfileScreen.tsx
const profilePath = path.join(basePath, 'assets', 'screens', 'ProfileScreen.tsx');
let profileContent = fs.readFileSync(profilePath, 'utf8');

// Insert a prominent Edit Profile button below the studentId
const insertPillTarget = /<Text style=\{styles\.studentId\}>Student ID: <Text style=\{styles\.studentIdBold\}>\{studentId\}<\/Text><\/Text>/;
const pillReplacement = `<Text style={styles.studentId}>Student ID: <Text style={styles.studentIdBold}>{studentId}</Text></Text>
              <TouchableOpacity style={styles.editProfilePill} onPress={handleEditProfile}>
                <Text style={styles.editProfilePillText}>Edit Profile</Text>
              </TouchableOpacity>`;
profileContent = profileContent.replace(insertPillTarget, pillReplacement);

// Insert styles for the pill
const insertStyleTarget = /studentIdBold:\s*\{\s*fontWeight:\s*'700',\s*color:\s*theme\.text,\s*\},/;
const styleReplacement = `studentIdBold: {
    fontWeight: '700',
    color: theme.text,
  },
  editProfilePill: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editProfilePillText: {
    color: theme.primaryText,
    fontWeight: '700',
    fontSize: 14,
  },`;
profileContent = profileContent.replace(insertStyleTarget, styleReplacement);
fs.writeFileSync(profilePath, profileContent);

console.log('User changes applied.');
