import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  EmergencyMode: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  GuidesStack: NavigatorScreenParams<GuidesStackParamList>;
  MedicalStack: NavigatorScreenParams<MedicalStackParamList>;
  SettingsStack: NavigatorScreenParams<SettingsStackParamList>;
};

export type HomeStackParamList = {
  Home: undefined;
  EmergencyContacts: undefined;
  AddEmergencyContact: { contactId?: string };
};

export type GuidesStackParamList = {
  GuidesList: undefined;
  GuideDetail: { guideId: string };
  GuideSearch: undefined;
};

export type MedicalStackParamList = {
  MedicalProfile: undefined;
  MedicalEdit: { section?: 'allergies' | 'medications' | 'conditions' };
  AddAllergy: { allergyId?: string };
  AddMedication: { medicationId?: string };
  AddCondition: { conditionId?: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  About: undefined;
  Privacy: undefined;
  Notifications: undefined;
  DataSync: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = NativeStackScreenProps<
  HomeStackParamList,
  T
>;

export type GuidesStackScreenProps<T extends keyof GuidesStackParamList> = NativeStackScreenProps<
  GuidesStackParamList,
  T
>;

export type MedicalStackScreenProps<T extends keyof MedicalStackParamList> = NativeStackScreenProps<
  MedicalStackParamList,
  T
>;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  NativeStackScreenProps<SettingsStackParamList, T>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    type RootParamList = RootStackParamList;
  }
}
