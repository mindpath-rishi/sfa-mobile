import { ActivityType } from './activity.types';
import { OtherWorkOption } from './salesExecutive.types';

export interface StartDayButtonProps {
  onPress: () => void;
}

export interface StartDayModalProps {
  visible: boolean;
  showOtherOptions: boolean;
  activityTypes: ActivityType[];
  otherWorkOptions: OtherWorkOption[];
  onClose: () => void;
  onActivitySelect: (activity: ActivityType) => void;
  onOtherWorkSelect: (option: OtherWorkOption) => void;
  onBackToOptions: () => void;
}
