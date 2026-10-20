import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  MainTabs: undefined;
  TaskForm: { taskId?: string; initialDueDate?: string } | undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Calendar: undefined;
  Tasks: undefined;
  Profile: undefined;
};

export type TabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type TaskFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TaskForm'
>;
