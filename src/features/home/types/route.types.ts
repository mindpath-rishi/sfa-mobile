import { Van } from './van.types';

export interface RouteSelectionModalProps {
  visible: boolean;
  routes: Route[];
  assignedVan: Van;
  vanChangeReason: string;
  onClose: () => void;
  onSelectRoute: (route: Route) => void;
}

export interface Route {
  id: string;
  name: string;
  stops: number;
  distance: string;
}
