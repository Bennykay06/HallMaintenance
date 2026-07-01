import os

filepath = 'assets/screens/EmergencyScreen.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
"""        <View style={styles.headerLeft}>
          <SchoolIcon color="#FFFFFF" size={80} />
          <Text style={styles.headerTitle}>Crimson Campus</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>""",
"""        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
        </View>
        <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileAvatar}>
            <PersonIcon color={theme.primaryText} size={20} />
          </View>
        </TouchableOpacity>""")

code = code.replace("backgroundColor: '#FFFFFF',", "backgroundColor: theme.surface,")
code = code.replace("backgroundColor: '#FFFFFF'", "backgroundColor: theme.surface")
code = code.replace("borderBottomColor: '#E8E8E8',", "borderBottomColor: theme.border,")
code = code.replace("backgroundColor: '#F3F3F3',", "backgroundColor: theme.surfaceContainer,")
code = code.replace("borderColor: '#E4BEBA',", "borderColor: theme.border,")
code = code.replace("color: '#1A1C1C',", "color: theme.text,")
code = code.replace("color: '#5B403D',", "color: theme.textSecondary,")
code = code.replace("color: '#FFFFFF'", "color: theme.primaryText")
code = code.replace("color: '#FFFFFF',", "color: theme.primaryText,")

code = code.replace(
"""  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },""",
"""  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },""")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(code)
