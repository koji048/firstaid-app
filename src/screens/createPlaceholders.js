// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const screens = {
  auth: ['WelcomeScreen', 'LoginScreen', 'RegisterScreen', 'ForgotPasswordScreen'],
  home: ['HomeScreen', 'EmergencyContactsScreen', 'AddEmergencyContactScreen'],
  guides: ['GuidesListScreen', 'GuideDetailScreen', 'GuideSearchScreen'],
  medical: [
    'MedicalProfileScreen',
    'MedicalEditScreen',
    'AddAllergyScreen',
    'AddMedicationScreen',
    'AddConditionScreen',
  ],
  settings: [
    'SettingsScreen',
    'ProfileScreen',
    'AboutScreen',
    'PrivacyScreen',
    'NotificationsScreen',
    'DataSyncScreen',
  ],
};

const template = (name) => `import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';

const ${name} = () => {
  return <PlaceholderScreen name="${name.replace('Screen', '')}" />;
};

export default ${name};`;

Object.entries(screens).forEach(([folder, screenList]) => {
  screenList.forEach((screenName) => {
    const content = template(screenName);
    const filePath = path.join(__dirname, folder, `${screenName}.tsx`);
    fs.writeFileSync(filePath, content);
    // eslint-disable-next-line no-console
    console.log(`Created ${filePath}`);
  });
});

// eslint-disable-next-line no-console
console.log('All placeholder screens created!');
