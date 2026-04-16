import { ActivityType } from '../types/activity.types';
import { LoadSummaryData } from '../types/loadSummaryModal.types';
import { QuickAction } from '../types/quickaction.types';
import { Route } from '../types/route.types';
import { OtherWorkOption } from '../types/salesExecutive.types';
import { Van } from '../types/van.types';

export const MOCK_DATA = {
  todayVisits: 8,
  totalVisits: 12,
  targetAchieved: 65,
  pendingOrders: 5,
  completedOrders: 12,
  collections: 'K45,000',
  incentives: 'K2,500',
};

export const QUICK_ACTIONS: QuickAction[] = [
  { icon: 'location', label: 'Active Visit', color: '#4158D0', route: '/checkin' },
  // { icon: 'cart', label: 'New Order', color: '#C850C0', route: '/orders/new', badge: 3 },
  { icon: 'cash', label: 'Collection', color: '#FF512F', route: '/collection' },
  // { icon: 'people', label: 'Outlets', color: '#11998e', route: '/outlets' },
  { icon: 'map', label: 'Route', color: '#F37335', route: '/route' },
];

export const ACTIVITY_TYPES: ActivityType[] = [
  { id: '1', name: 'Retailing', icon: 'storefront', color: '#4158D0' },
  { id: '2', name: 'Other Work', icon: 'briefcase', color: '#C850C0' },
];

export const OTHER_WORK_OPTIONS: OtherWorkOption[] = [
  { id: 'office', name: 'Office Work', icon: 'business', color: '#11998e' },
  { id: 'collection', name: 'Collection', icon: 'cash', color: '#FF512F' },
  { id: 'meeting', name: 'Meetings', icon: 'people', color: '#F37335' },
];

export const RETAILING_ROUTES: Route[] = [
  { routeId: 'route1', name: 'Andheri East Route', totalShops: 12, distance: '8.5 km' },
  { routeId: 'route2', name: 'Bandra West Route', totalShops: 15, distance: '10.2 km' },
  { routeId: 'route3', name: 'Juhu Circle Route', totalShops: 8, distance: '6.3 km' },
  { routeId: 'route4', name: 'Dadar Route', totalShops: 10, distance: '7.8 km' },
  { routeId: 'route5', name: 'Malad Route', totalShops: 14, distance: '9.1 km' },
];

export const ASSIGNED_VAN: Van = {
  vanId: 'van2',
  name: 'Van #MH-02-CD-5678',
  // vanNumber: 'Mahindra Pickup',
  capacity: '750 kg',
  vanNumber: 'MH-02-CD-5678',
};

export const LOAD_SUMMARY_DATA: LoadSummaryData = {
  loadNumber: 'ST-5176',
  totalQuantity: '0 Cases 0 Pcs',
  totalValue: 'ZMW 0',
  skuDetails: [
    {
      id: '1',
      sku: 'DWB-DR. WASH SOAP BLUE 20 X 300G',
      code: '28073',
      carryForward: '7 Cases 0 Pcs',
      freshStock: '0 Cases 0 Pcs',
    },
    {
      id: '2',
      sku: 'BOS-BOOM DISH LIQUID ORANGE 25 X 750ML (SPONGE)',
      code: '21452',
      carryForward: '7 Cases 0 Pcs',
      freshStock: '0 Cases 0 Pcs',
    },
    {
      id: '3',
      sku: 'B3G-BOOM BEAUTY SOAP GREEN 20 X 300G',
      code: '25272',
      carryForward: '5 Cases 0 Pcs',
      freshStock: '0 Cases 0 Pcs',
    },
    {
      id: '4',
      sku: 'A32-ALOHA POWDER POUCH SR 120 X 32G',
      code: '32014',
      carryForward: '5 Cases 0 Pcs',
      freshStock: '0 Cases 0 Pcs',
    },
    {
      id: '5',
      sku: 'A30-ALOHA S.RAIN POWDER POUCH 150 X 30G',
      code: '25776',
      carryForward: '5 Cases 0 Pcs',
      freshStock: '0 Cases 0 Pcs',
    },
    {
      id: '6',
      sku: '19GS-AMAZON MONSTA (TKSA) GRAPE',
      code: '',
      carryForward: '',
      freshStock: '',
    },
  ],
};
