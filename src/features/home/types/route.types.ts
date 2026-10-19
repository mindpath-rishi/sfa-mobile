import { Route } from '@/core/store/route.store';
import { Van } from './van.types';

export interface RouteSelectionModalProps {
  visible: boolean;
  routes: Route[];
  assignedVan: Van;
  vanChangeReason: string;
  onClose: () => void;
  onSelectRoute: (route: Route) => void;
}
