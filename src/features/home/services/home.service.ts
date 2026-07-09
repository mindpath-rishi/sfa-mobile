// import { api } from '@/core/network';
// import { uploadFormData } from '@/core/network/upload';
// import type { ApiRequestConfig, ApiResponse } from '@/core/network/api.types';
// import { CreateActivityPayload, DayStartPayload } from '../types/home.types';
// import { Platform } from 'react-native';
// import {
//   captureCurrentLocation,
//   stopSalesmanBackgroundLocation,
//   type CapturedLocation,
// } from '@/shared/services/location.service';
// import { isSalesman } from '@/core/navigation/role.utils';
// import { useAuthStore } from '@/core/store/auth.store';
// import { isOfflineMode, useOfflineStore } from '@/core/offline/offline.store';
// import { repositories } from '@/repositories';
// import { syncService } from '@/sync/sync.service';
// import { createSchemaId } from '@/utils/uuid';
// import { useLoaderStore } from '@/core/loader/loader.store';

// /**
//  * Auth API contract used by the app.
//  * Keeps login/logout strongly-typed and easy to mock in tests.
//  */
// export interface ManagerStatsResponse {
//   userSummary: {
//     retailing: number;
//     officeWork: number;
//     leave: number;
//     absent: number;
//     total: number;
//   };
//   callSummary: {
//     productivity: number;
//     covered: number;
//     pc: number;
//     tc: number;
//     sc: number;
//     qtyCases: number;
//     qtyTonnage?: number;
//     qtyValue?: number;
//   };
// }

// export interface ManagerTargetData {
//   startDate: string;
//   endDate: string;
//   targetCases: number;
//   achievedCases: number;
//   remainingCases: number;
//   targetTonnage: number;
//   achievedTonnage: number;
//   targetValue: number;
//   achievedValue: number;
//   achievementPercentage: number;
//   display: {
//     percentage: string;
//     achievedCases: string;
//     remainingMessage: string;
//   };
// }

// export type ManagerTargetResponse = {
//   startDate?: string;
//   endDate?: string;

//   targetCases?: number;
//   achievedCases?: number;
//   remainingCases?: number;

//   targetTonnage?: number;
//   achievedTonnage?: number;
//   remainingTonnage?: number;

//   targetValue?: number;
//   achievedValue?: number;
//   remainingValue?: number;

//   achievementPercentage?: number;
//   tonnageAchievementPercentage?: number;
//   valueAchievementPercentage?: number;

//   uboTarget?: number;
//   uboAchievement?: number;
//   uboRemaining?: number;
//   uboAchievementPercentage?: number;

//   display?: {
//     percentage?: string;
//     achievedCases?: string;
//     remainingMessage?: string;

//     uboPercentage?: string;
//     uboAchievement?: string;
//     uboRemainingMessage?: string;
//   };
// };

// export interface UserWiseTargetSummary {
//   employeeId: string;
//   employeeName: string;
//   designation?: string;
//   targetCases: number;
//   achievementCases: number;
//   remainingCases: number;
//   targetTonnage?: number;
//   achievementTonnage?: number;
//   remainingTonnage?: number;
//   targetValue?: number;
//   achievementValue?: number;
//   remainingValue?: number;
//   achievementPercentage: number;
//   rrr: number;
//   crr: number;
//   hasTarget: boolean;
// }

// export interface UserPrimaryCategoryTargetSummary {
//   categoryId: string;
//   category: string;
//   targetCases: number;
//   achievementCases: number;
//   remainingCases: number;
//   targetTonnage: number;
//   achievementTonnage: number;
//   remainingTonnage: number;
//   targetValue: number;
//   achievementValue: number;
//   remainingValue: number;
//   achievementPercentage: number;
// }

// export interface UserUboTargetBreakdown {
//   categoryId: string;
//   category: string;
//   target: number;
//   achievement: number;
// }

// export interface UserFocusedPackTargetBreakdown {
//   productId: string;
//   productName: string;
//   targetCases: number;
//   achievementCases: number;
//   targetTonnage: number;
//   achievementTonnage: number;
//   targetValue: number;
//   achievementValue: number;
// }

// export interface ManagerOrderSummaryResponse {
//   primaryCategoryWiseOrder: {
//     totalCases: number;
//     totalTonnage?: number;
//     totalValue?: number;
//     categories: {
//       categoryId: string;
//       category: string;
//       cases: number;
//       tonnage?: number;
//       value?: number;
//       percentage: number;
//       tonnagePercentage?: number;
//       valuePercentage?: number;
//     }[];
//   };
//   managerOrderSummary: {
//     orders: number;
//     validation: number;
//     orderCases?: number;
//     orderTonnage?: number;
//     orderValue?: number;
//     validationCases?: number;
//     validationTonnage?: number;
//     validationValue?: number;
//   };
//   outletSummary: {
//     utc?: {
//       count: number;
//       percentage: number;
//     };
//     upc: {
//       count: number;
//       percentage: number;
//     };
//     zeroOrder: {
//       count: number;
//       percentage: number;
//     };
//     notVisited: {
//       count: number;
//       percentage: number;
//     };
//     total: {
//       count: number;
//       percentage: number;
//     };
//     productivity: {
//       pc: number;
//       tc: number;
//       percentage: number;
//     };
//     ordered?: {
//       count: number;
//       percentage: number;
//     };
//   };
// }

// export interface ManagerTeamCoverageResponse {
//   users: number;
//   vans: number;
//   warehouse: number;
//   routes: number;
//   outlets: number;
//   outletsPlanned: number;
//   upc: number;
//   uic: number;
//   userList?: Array<{
//     employeeId?: string;
//     name?: string;
//     mobile?: string;
//     designationId?: string;
//   }>;
//   vanList?: Array<{
//     vanId?: string;
//     name?: string;
//     vanNumber?: string;
//     driverName?: string;
//     capacity?: number;
//     warehouseId?: string;
//     associatedUsers?: string[];
//     routeCount?: number;
//   }>;
//   outletList?: Array<{
//     customerId?: string;
//     name?: string;
//     ownerName?: string;
//     phoneNumber?: string;
//     marketId?: string;
//     segmentation?: string;
//   }>;
//   plannedOutletList?: Array<{
//     customerId?: string;
//     name?: string;
//     ownerName?: string;
//     phoneNumber?: string;
//     marketId?: string;
//     segmentation?: string;
//   }>;
// }

// export interface ManagerBeatOMeterResponse {
//   employeeId?: string;
//   employeeName?: string;
//   designation?: string;
//   totalOutlets?: number;
//   summary?: {
//     visitedOutlets?: number;
//     orderedOutlets?: number;
//     visitedPercentage?: number;
//     orderedPercentage?: number;
//   };
//   outletTypes?: {
//     type?: string;
//     color?: string;
//     total?: number;
//     mtdVisited?: {
//       count?: number;
//       percentage?: number;
//     };
//     mtdOrder?: {
//       count?: number;
//       percentage?: number;
//     };
//   }[];
// }

// export interface ManagerFieldUserSummary {
//   employeeId: string;
//   employeeName: string;
//   mobile?: string;
//   activity?: {
//     name?: string;
//     color?: string;
//   } | null;
//   routeName?: string | null;
//   location?: string | null;
//   summary?: {
//     firstCallTime?: string | null;
//     firstPcTime?: string | null;
//     tc?: number;
//     pc?: number;
//     lpc?: number;
//   } | null;
// }

// export interface TimelineLocation {
//   latitude: number;
//   longitude: number;
//   accuracy?: number | null;
//   altitude?: number | null;
//   speed?: number | null;
//   capturedAt?: string | null;
// }

// export interface ManagerUserTimelineResponse {
//   employeeId: string;
//   employeeName: string;
//   date: string;
//   dayStartTime?: string | null;
//   dayEndTime?: string | null;
//   dayStartImageUrl?: string | null;
//   dayStartImageMediaId?: string | null;
//   dayStartLocation?: TimelineLocation | null;
//   dayEndLocation?: TimelineLocation | null;
//   currentLocation?: TimelineLocation | null;
//   activities: {
//     id: string;
//     source?: string;
//     type: string;
//     time: string;
//     duration: string;
//     outlet: string;
//     owner: string;
//     location?: TimelineLocation | null;
//     checkInLocation?: TimelineLocation | null;
//     checkOutLocation?: TimelineLocation | null;
//     metrics: {
//       label: string;
//       value: string;
//     }[];
//     order?: {
//       orderNo: string;
//       outlet: string;
//       quantityCases: string;
//       quantitySuperUnit: string;
//       totalPieces: string;
//       netValue: string;
//       categories: {
//         id: string;
//         name: string;
//         meta: string;
//         value: string;
//         lines: {
//           id: string;
//           name: string;
//           ptr: string;
//           qty: string;
//           unit: string;
//           value: string;
//         }[];
//       }[];
//       schemeDiscount: string;
//       cashDiscount: string;
//       tax: string;
//       payableAmount: string;
//     };
//   }[];
// }

// export interface ManagerUserMtdSummaryResponse {
//   employeeId: string;
//   employeeName: string;
//   date: string;
//   utc: number;
//   upc: number;
//   zeroOrder: number;
//   notVisited: number;
//   total: number;
// }

// export interface ManagerUserRoutePlanResponse {
//   employeeId: string;
//   employeeName: string;
//   date: string;
//   stops: {
//     id: string;
//     outletId: string;
//     name: string;
//     time: string;
//     status: 'completed' | 'pending' | 'missed';
//     type: string;
//   }[];
// }

// export interface SalesmanDayWiseSummaryItem {
//   date: string;
//   label: string;
//   dayStatus?: 'Retailing' | 'Official Work' | 'Leave' | 'Absent';
//   retailing: number;
//   officialWork: number;
//   leave: number;
//   absent: number;
//   totalActivities: number;
//   retailingDuration?: string | null;
//   totalDuration?: string | null;
//   tc: number;
//   pc: number;
//   upc: number;
//   netValue: number;
//   cases: number;
//   firstCallTime?: string | null;
//   firstPcTime?: string | null;
// }

// export type SalesmanProductSalesGroupBy = 'PRIMARYCATEGORY' | 'SECONDARYCATEGORY' | 'SKU';

// export interface SalesmanProductSalesResponse {
//   overview: {
//     sc: number;
//     tc: number;
//     pc: number;
//     netValue: number;
//     cases: number;
//     lpc: number;
//   };
//   categories: {
//     id: string;
//     name: string;
//     value: number;
//     pcs: number;
//     cases: number;
//     growth: number;
//   }[];
// }

// export interface SalesmanPocketTargetResponse {
//   startDate: string;
//   endDate: string;
//   retailingDays: number;
//   avgRetailingTime?: string | null;
//   avgTotalTime?: string | null;
//   dayWiseSummary?: SalesmanDayWiseSummaryItem[];
//   target: {
//     metric?: TargetMetric;
//     selected?: {
//       target: number;
//       achieved: number;
//       remaining: number;
//       achievementPercentage: number;
//       mtd: number;
//       lmtd: number;
//       improvement: number;
//       crr: number;
//       rrr: number;
//     };
//     targetCases: number;
//     achievedCases: number;
//     remainingCases: number;
//     targetTonnage: number;
//     achievedTonnage: number;
//     remainingTonnage: number;
//     targetValue: number;
//     achievedValue: number;
//     remainingValue: number;
//     achievementPercentage: number;
//     crr: number;
//     rrr: number;
//   };
//   pocket: {
//     tc: number;
//     avgTc: number;
//     pc: number;
//     avgPc: number;
//     upc: number;
//     utc: number;
//     totalLinesSold: number;
//     lpc: number;
//     avgFirstCallTime?: string | null;
//     avgFirstPcTime?: string | null;
//   };
//   vanUtilization?: {
//     openingStockCases: number;
//     topupStockCases: number;
//     totalStockCases: number;
//     salesCases: number;
//     utilizationPercentage: number;
//   };
// }

// export interface SalesmanReportShareResponse {
//   message?: string;
//   shareText?: string;
//   text?: string;
//   url?: string;
//   reportUrl?: string;
//   fileUrl?: string;
// }

// export type SalesmanReportType = 'MST' | 'MSR' | 'DSR';

// export interface SalesmanDispatchStatusItem {
//   orderId?: string;
//   orderNo?: string;
//   outletName?: string;
//   outlet?: string;
//   invoiceNo?: string;
//   status?: string;
//   orderDate?: string;
//   dispatchDate?: string;
//   vehicleNo?: string;
//   cases?: number;
//   pieces?: number;
//   netValue?: number;
// }

// export type TargetMetric = 'cases' | 'tonnage' | 'value';

// export interface HomeService {
//   /** Authenticates user and returns token/user payload from backend */
//   dayStart(payload: DayStartPayload, config?: ApiRequestConfig): Promise<ApiResponse<any>>;
//   uploadDayStartImage: (
//     params: {
//       uri: string;
//       ownerId: string;
//       subOwnerId: string;
//     },
//     config?: ApiRequestConfig,
//   ) => Promise<ApiResponse<{ mediaId: string; url: string }>>;
//   getDayStatus(workSessionId: string, config?: ApiRequestConfig): Promise<ApiResponse<any>>;
//   getTodayActivities(workSessionId: string): Promise<ApiResponse<any>>;
//   createActivity(payload: CreateActivityPayload): Promise<ApiResponse<any>>;
//   getRoutes: (vanId: string) => Promise<ApiResponse<any>>;
//   getVanMappedRoutes: () => Promise<ApiResponse<any>>;
//   getVan: (userId: string) => Promise<ApiResponse<any>>;
//   getVans: (params?: { limit?: number; page?: number }) => Promise<ApiResponse<any>>;
//   dayComplete(
//     carryForwardStock:
//       | any
//       | {
//           carryForwardStock?: any;
//           dayEndLocation?: CapturedLocation;
//         },
//     config?: ApiRequestConfig,
//   ): Promise<ApiResponse<any>>;
//   cancelVanChangeRequest(vanChangeRequestId: string): Promise<ApiResponse<any>>;
//   requestVanChange(
//     workSessionId: string,
//     payload: {
//       requestedVanId: string;
//       requestedVanName?: string;
//       vanChangeReason?: string;
//     },
//   ): Promise<ApiResponse<any>>;
//   getEmployeeStats(employeeId: string): Promise<ApiResponse<any>>;
//   getSalesmanPocketAndTarget: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//     metric?: TargetMetric;
//   }) => Promise<ApiResponse<SalesmanPocketTargetResponse>>;
//   getSalesmanDayWiseSummary: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//   }) => Promise<ApiResponse<SalesmanDayWiseSummaryItem[]>>;
//   getSalesmanProductSales: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//     groupBy?: SalesmanProductSalesGroupBy;
//   }) => Promise<ApiResponse<SalesmanProductSalesResponse>>;
//   shareSalesmanMSR: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//   }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
//   shareSalesmanMST: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//   }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
//   shareSalesmanDSR: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//   }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
//   shareSalesmanReport: (
//     type: SalesmanReportType,
//     params?: {
//       date?: string;
//       startDate?: string;
//       endDate?: string;
//     },
//   ) => Promise<ApiResponse<SalesmanReportShareResponse>>;
//   getSalesmanDispatchOrders: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//   }) => Promise<ApiResponse<SalesmanDispatchStatusItem[]>>;
//   getSalesmanDispatchStatus: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//   }) => Promise<ApiResponse<SalesmanDispatchStatusItem[]>>;
//   getManagerStats(
//     params?:
//       | string
//       | {
//           date?: string;
//           startDate?: string;
//           endDate?: string;
//         },
//   ): Promise<ApiResponse<ManagerStatsResponse>>;
//   getManagerTarget: (date?: string) => Promise<ApiResponse<ManagerTargetResponse>>;
//   getUserWiseTargetSummary: (date?: string) => Promise<ApiResponse<UserWiseTargetSummary[]>>;
//   getUboTargetSummary: (date?: string) => Promise<ApiResponse<UserWiseTargetSummary[]>>;
//   getFocusedPackTargetSummary: (date?: string) => Promise<ApiResponse<UserWiseTargetSummary[]>>;
//   getUserPrimaryCategoryTargets: (params: {
//     employeeId: string;
//     date?: string;
//   }) => Promise<ApiResponse<UserPrimaryCategoryTargetSummary[]>>;
//   getUserUboTargets: (params: {
//     employeeId: string;
//     date?: string;
//   }) => Promise<ApiResponse<UserUboTargetBreakdown[]>>;
//   getUserFocusedPackTargets: (params: {
//     employeeId: string;
//     date?: string;
//   }) => Promise<ApiResponse<UserFocusedPackTargetBreakdown[]>>;
//   getManagerOrderSummary: (params?: {
//     date?: string;
//     startDate?: string;
//     endDate?: string;
//   }) => Promise<ApiResponse<ManagerOrderSummaryResponse>>;
//   getManagerTeamCoverage: () => Promise<ApiResponse<ManagerTeamCoverageResponse>>;
//   getManagerBeatOMeter: () => Promise<ApiResponse<ManagerBeatOMeterResponse>>;
//   getManagerFieldUsers: (params?: {
//     date?: string;
//     searchKey?: string;
//     searchText?: string;
//   }) => Promise<ApiResponse<ManagerFieldUserSummary[]>>;
//   getManagerUserTimeline: (params: {
//     employeeId: string;
//     date?: string;
//   }) => Promise<ApiResponse<ManagerUserTimelineResponse>>;
//   getManagerUserMtdSummary: (params: {
//     employeeId: string;
//     date?: string;
//   }) => Promise<ApiResponse<ManagerUserMtdSummaryResponse>>;
//   getManagerUserRoutePlan: (params: {
//     employeeId: string;
//     date?: string;
//   }) => Promise<ApiResponse<ManagerUserRoutePlanResponse>>;
// }


// const isActiveStatusValue = (value: unknown) =>
//   String(value ?? '').toUpperCase() === 'ACTIVE';

// const completeActiveRouteSessions = async ({
//   ownerId,
//   workSessionId,
//   endedAt,
// }: {
//   ownerId: string;
//   workSessionId: string;
//   endedAt: string;
// }) => {
//   const records = await repositories.routeSessions.findAll(ownerId, {
//     limit: 1000,
//   });

//   await Promise.all(
//     records
//       .filter(
//         (item: any) =>
//           String(item.workSessionId || '') === String(workSessionId) &&
//           isActiveStatusValue(item.status) &&
//           item.isDeleted !== true &&
//           !item.deletedAt,
//       )
//       .map((item: any) =>
//         repositories.routeSessions.update(ownerId, item.uuid || item.routeSessionId, {
//           status: 'COMPLETED',
//           isActive: false,
//           endTime: endedAt,
//         }),
//       ),
//   );
// };

// const createOfflineRouteSession = async ({
//   ownerId,
//   user,
//   payload,
//   workSessionId,
//   vanId,
//   vanName,
//   nowIso,
//   completeExisting = true,
// }: {
//   ownerId: string;
//   user: any;
//   payload: any;
//   workSessionId: string;
//   vanId: string;
//   vanName?: string;
//   nowIso: string;
//   completeExisting?: boolean;
// }) => {
//   if (completeExisting) {
//     await completeActiveRouteSessions({
//       ownerId,
//       workSessionId,
//       endedAt: nowIso,
//     });
//   }

//   const routeSessionId = createSchemaId('RouteSession');

//   return repositories.routeSessions.create(ownerId, {
//     uuid: routeSessionId,
//     routeSessionId,

//     workSessionId,

//     userId: user?.userId ?? ownerId,
//     userName: user?.name,

//     vanId,
//     vanName,

//     routeId: payload.routeId,
//     routeName: payload.routeName || '',
//     customerCategoryId: payload.customerCategoryId,

//     totalShops: payload.totalShops ?? 0,
//     visitedShops: 0,

//     startTime: nowIso,
//     sessionDate: nowIso,

//     status: 'ACTIVE',
//     isActive: true,
//   } as unknown as Record<string, unknown>);
// };

// /**
//  * Thin service layer on top of the shared HTTP client.
//  * No UI logic here — only network calls + typing.
//  */
// export const homeService: HomeService = {
//   dayStart: async (payload, config) => {
//     const user = useAuthStore.getState().user;

//     /**
//      * ONLINE MODE
//      */
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.post<any, DayStartPayload>('/work-session', payload, config);
//     }

//     /**
//      * OFFLINE MODE
//      *
//      * Same flow as backend:
//      * 1. Check active work session
//      * 2. Create work session
//      * 3. Create route session when routeId exists
//      * 4. Create van daily stock
//      *    - First from latest ERP closing stock
//      *    - Else from local inventory stock
//      * 5. Create activity
//      */
//     const ownerId = user?.userId ?? '';

//     const now = new Date();
//     const nowIso = now.toISOString();

//     const vanId = payload.vanId || user?.vanId;
//     const vanName = payload.vanName || user?.vanName;

//     const safeFindAll = async (repoName: string, limit = 10000) => {
//       const repo = (repositories as any)?.[repoName];

//       if (!repo?.findAll) return [];

//       try {
//         return await repo.findAll(ownerId, { limit });
//       } catch {
//         return [];
//       }
//     };

//     const safeCreate = async (repoName: string, record: Record<string, unknown>) => {
//       const repo = (repositories as any)?.[repoName];

//       if (!repo?.create) return null;

//       return repo.create(ownerId, record);
//     };

//     const safeUpdate = async (repoName: string, uuid: string, changes: Record<string, unknown>) => {
//       const repo = (repositories as any)?.[repoName];

//       if (!repo?.update) return null;

//       return repo.update(ownerId, uuid, changes);
//     };

//     const toNumber = (value: unknown, fallback = 0) => {
//       const numberValue = Number(value);

//       return Number.isFinite(numberValue) ? numberValue : fallback;
//     };

//     const toServerEndOfDay = (date: Date) => {
//       const value = new Date(date);

//       return new Date(
//         Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 23, 59, 59, 999),
//       );
//     };

//     const isSameServerDate = (a: unknown, b: unknown) => {
//       if (!a || !b) return false;

//       const dateA = new Date(String(a));
//       const dateB = new Date(String(b));

//       if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) {
//         return false;
//       }

//       return (
//         dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
//         dateA.getUTCMonth() === dateB.getUTCMonth() &&
//         dateA.getUTCDate() === dateB.getUTCDate()
//       );
//     };

//     const isActiveStatus = (value: unknown) => String(value ?? '').toUpperCase() === 'ACTIVE';

//     /**
//      * ======================================================
//      * CHECK EXISTING ACTIVE SESSION
//      * Backend:
//      * userId + vanId + status ACTIVE
//      * ======================================================
//      */
//     const attendanceRecords = await safeFindAll('attendance', 5000);

//     const existingActiveSession = attendanceRecords.find(
//       (item: any) =>
//         String(item.userId || item.ownerId || ownerId) === String(ownerId) &&
//         String(item.vanId || '') === String(vanId || '') &&
//         isActiveStatus(item.status) &&
//         item.isDeleted !== true,
//     );

//     if (existingActiveSession) {
//       return {
//         success: false,
//         statusCode: 409,
//         message: 'Active work session already exists',
//         data: existingActiveSession,
//         offline: true,
//       } as ApiResponse<any>;
//     }

//     /**
//      * ======================================================
//      * CREATE WORK SESSION
//      * Backend WorkSessionService.create()
//      * ======================================================
//      */
//     const workSessionId = createSchemaId('WorkSession');

//     const dayStartLocation = payload.dayStartLocation || (payload as any).startLocation || null;

//     const workSessionPayload: Record<string, unknown> = {
//       ...payload,

//       uuid: workSessionId,
//       workSessionId,

//       userId: ownerId,
//       userName: user?.name,

//       vanId,
//       vanName,

//       dayStartTime: nowIso,
//       startTime: nowIso,

//       dayStartImageMediaId: payload.dayStartImageMediaId,
//       dayStartImageUrl: payload.dayStartImageUrl,
//       dayStartLocation,

//       status: 'ACTIVE',
//     };

//     const record = await repositories.attendance.create(ownerId, workSessionPayload);

//     /**
//      * ======================================================
//      * ROUTE SESSION + VAN DAILY STOCK
//      * Backend ActivityService.create()
//      * Only when routeId exists.
//      * ======================================================
//      */
//     if (payload.routeId) {
//       await createOfflineRouteSession({
//         ownerId,
//         user,
//         payload,
//         workSessionId,
//         vanId: String(vanId || ''),
//         vanName,
//         nowIso,
//       });

//       /**
//        * ======================================================
//        * CREATE VAN DAILY STOCK
//        *
//        * Same as backend:
//        * const erpClosing = getLatestOpeningStock(vanId)
//        * const inventories = erpClosing.length
//        *   ? erpClosing converted to quantity
//        *   : inventoryService.findByVanId(vanId)
//        * ======================================================
//        */
//       const existingDailyStock = await safeFindAll('vanDailyStock', 20000);

//       const hasDailyStockForSession = existingDailyStock.some(
//         (item: any) => String(item.workSessionId || '') === String(workSessionId),
//       );

//       if (!hasDailyStockForSession) {

//         /**
//          * ======================================================
//          * LATEST ERP CLOSING STOCK
//          *
//          * Offline equivalent of:
//          * getLatestOpeningStock(vanId, asOf)
//          * ======================================================
//          */
//         const erpClosingRecords = await safeFindAll('vanErpClosing', 20000);

//         const endOfDay = toServerEndOfDay(now);

//         const validErpClosingRows = erpClosingRecords
//           .filter((item: any) => {
//             if (String(item.vanId || '') !== String(vanId || '')) return false;
//             if (item.isDeleted === true) return false;
//             if (!item.date) return false;

//             const itemDate = new Date(item.date);

//             return !Number.isNaN(itemDate.getTime()) && itemDate.getTime() <= endOfDay.getTime();
//           })
//           .sort((a: any, b: any) => {
//             const dateA = new Date(a.date || 0).getTime();
//             const dateB = new Date(b.date || 0).getTime();

//             if (dateA !== dateB) return dateB - dateA;

//             const modifiedA = new Date(a.modifiedDate || a.updatedAt || 0).getTime();

//             const modifiedB = new Date(b.modifiedDate || b.updatedAt || 0).getTime();

//             return modifiedB - modifiedA;
//           });

//         const latestErpDate = validErpClosingRows[0]?.date;

//         const latestErpClosingRows = latestErpDate
//           ? validErpClosingRows.filter((item: any) => {
//               return isSameServerDate(item.date, latestErpDate);
//             })
//           : [];

//         /**
//          * Product lookup same as backend $lookup product_master.
//          */
//         const productRecords = await safeFindAll('products', 20000);

//         const productMap = new Map<string, any>(
//           productRecords
//             .map((item: any): [string, any] => [
//               String(item.productId || item.uuid || item.id || ''),
//               item,
//             ])
//             .filter(([id]) => Boolean(id)),
//         );

//         let openingStocks: Array<{
//           productId: string;
//           unitQtyInCase: number;
//           quantity: number;
//           piecePrice: number;
//           pieceNetWeight: number;
//         }> = [];

//         if (latestErpClosingRows.length) {
//           /**
//            * ERP closing exists.
//            *
//            * Backend:
//            * closingCases = qtyInCase || qty
//            * quantity = closingCases * unitQtyInCase
//            */
//           openingStocks = latestErpClosingRows
//             .map((item: any) => {
//               const product = productMap.get(String(item.productId || '')) || {};

//               const unitQtyInCase = toNumber(product.unitQtyInCase || item.unitQtyInCase, 1);

//               const closingCases = toNumber(item.qtyInCase ?? item.qty ?? item.closingCases, 0);

//               return {
//                 productId: String(item.productId || ''),
//                 unitQtyInCase,
//                 quantity: closingCases * unitQtyInCase,
//                 piecePrice: toNumber(product.piecePrice || item.piecePrice, 0),
//                 pieceNetWeight: toNumber(product.pieceNetWeight || item.pieceNetWeight, 0),
//               };
//             })
//             .filter((item) => Boolean(item.productId) && toNumber(item.quantity) > 0);
//         } else {
//           /**
//            * No ERP closing.
//            *
//            * Backend fallback:
//            * inventoryService.findByVanId(vanId)
//            *
//            * Offline fallback:
//            * local stock/inventory repository.
//            */
//           const stockRecords = await safeFindAll('stock', 20000);

//           openingStocks = stockRecords
//             .filter((item: any) => {
//               if (String(item.vanId || '') !== String(vanId || '')) return false;
//               if (item.isDeleted === true) return false;

//               const status = String(item.status || 'ACTIVE').toUpperCase();

//               if (status === 'INACTIVE') return false;

//               return toNumber(item.quantity) > 0;
//             })
//             .map((item: any) => ({
//               productId: String(item.productId || ''),
//               unitQtyInCase: toNumber(item.unitQtyInCase, 1),
//               quantity: toNumber(item.quantity),
//               piecePrice: toNumber(item.piecePrice, 0),
//               pieceNetWeight: toNumber(item.pieceNetWeight, 0),
//             }))
//             .filter((item) => Boolean(item.productId) && toNumber(item.quantity) > 0);
//         }

//         for (const stock of openingStocks) {
//           const vanDailyStockId = createSchemaId('VanDailyStock');
//           const openingQty = toNumber(stock.quantity, 0);

//           await safeCreate('vanDailyStock', {
//             uuid: vanDailyStockId,
//             vanDailyStockId,

//             date: nowIso,

//             vanId,
//             employeeId: ownerId,

//             productId: stock.productId,
//             unitQtyInCase: stock.unitQtyInCase || 1,

//             openingQty,
//             inQty: 0,
//             outQty: 0,
//             adjustmentQty: 0,
//             closingQty: openingQty,

//             pieceNetWeight: stock.pieceNetWeight,
//             piecePrice: stock.piecePrice,

//             workSessionId,
//             status: 'DRAFT',
//           });
//         }
//       }
//     }

//     /**
//      * ======================================================
//      * CREATE ACTIVITY
//      * Backend ActivityService.create()
//      * ======================================================
//      */

//     /**
//      * Complete existing active activities for this work session.
//      * Usually none during Day Start, but same behavior as online.
//      */
//     const activityRecords = await safeFindAll('activities', 5000);

//     const activeActivities = activityRecords.filter(
//       (item: any) =>
//         String(item.workSessionId || '') === String(workSessionId) && isActiveStatus(item.status),
//     );

//     for (const activity of activeActivities) {
//       await safeUpdate('activities', String(activity.uuid || activity.activityId), {
//         status: 'COMPLETED',
//         endTime: nowIso,
//       });
//     }

//     const activityId = createSchemaId('Activity');

//     await repositories.activities.create(ownerId, {
//       uuid: activityId,
//       activityId,

//       workSessionId,

//       userId: ownerId,
//       userName: user?.name,

//       vanId,
//       vanName,

//       name: payload.activityName || 'Work Session',
//       description: payload.description || '',

//       routeId: payload.routeId,
//       routeName: payload.routeName,
//       totalShops: payload.totalShops,
//       customerCategoryId: payload.customerCategoryId,

//       startTime: nowIso,
//       startLocation: (payload as any).startLocation || payload.dayStartLocation,

//       status: 'ACTIVE',
//     });

//     useAuthStore.getState().setWorkSessionId(workSessionId);

//     return {
//       success: true,
//       statusCode: 202,
//       message: 'Day start saved locally',
//       data: {
//         ...record,
//         workSessionId,
//       },
//       offline: true,
//     } as ApiResponse<any>;
//   },

//   uploadDayStartImage: async ({ uri, ownerId, subOwnerId }, config) => {
//     const formData = new FormData();
//     const cleanUri = uri.split('?')[0];
//     const extension = cleanUri.includes('.') ? cleanUri.split('.').pop() || 'jpg' : 'jpg';
//     const mimeType = extension.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
//     const fileName = `day-start-${Date.now()}.${extension}`;

//     if (Platform.OS === 'web') {
//       const blob = await fetch(uri).then((response) => response.blob());
//       const WebFile = (globalThis as any).File;
//       const file =
//         typeof WebFile !== 'undefined'
//           ? new WebFile([blob], fileName, { type: blob.type || mimeType })
//           : blob;

//       formData.append('file', file, fileName);
//     } else {
//       formData.append('file', {
//         uri,
//         name: fileName,
//         type: mimeType,
//       } as any);
//     }

//     formData.append('ownerType', 'EMPLOYEE');
//     formData.append('ownerId', ownerId);
//     formData.append('mediaType', 'IMAGE');
//     formData.append('purpose', 'PROOF');
//     formData.append('title', 'Day Start Selfie');
//     formData.append('isPrimary', 'false');
//     formData.append('subOwnerId', subOwnerId || '');

//     return uploadFormData<{ mediaId: string; url: string }>('/media/upload', formData, config);
//   },
//   getDayStatus: async (_workSessionId, config) => {
//     const user = useAuthStore.getState().user;
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<any>(`/work-session/today-activity`, config);
//     }
//     const isToday = (value: unknown) => {
//       if (!value) return false;
//       const date = new Date(String(value));
//       const today = new Date();
//       return (
//         !Number.isNaN(date.getTime()) &&
//         date.getFullYear() === today.getFullYear() &&
//         date.getMonth() === today.getMonth() &&
//         date.getDate() === today.getDate()
//       );
//     };
//     const records = await repositories.attendance.findAll(user?.userId ?? '', { limit: 10 });
//     const todayRecords = records.filter((item) =>
//       isToday(item.dayStartTime ?? item.startTime ?? item.createdAt),
//     );
//     const record =
//       todayRecords.find((item) => String(item.status ?? '').toUpperCase() === 'ACTIVE') ??
//       todayRecords[0] ??
//       null;
//     const activityRecords = await repositories.activities.findAll(user?.userId ?? '', {
//       limit: 200,
//     });
//     const activities = activityRecords
//       .filter((item) => isToday(item.startTime ?? item.createdAt))
//       .map((item) => ({
//         ...item,
//         _id: item._id ?? item.activityId ?? item.uuid,
//         activityId: item.activityId ?? item.uuid,
//         name: item.name ?? item.activityName ?? 'Activity',
//         startTime: item.startTime ?? item.createdAt,
//         status: String(item.status ?? '').toUpperCase() === 'ACTIVE' ? 'ongoing' : 'completed',
//       }));
//     const routeSessions = await repositories.routeSessions.findAll(user?.userId ?? '', {
//       limit: 200,
//     });
//     const activeRouteSession = routeSessions.find(
//       (item) =>
//         String(item.status ?? '').toUpperCase() === 'ACTIVE' &&
//         Boolean(record) &&
//         [record?.uuid, record?.workSessionId]
//           .filter(Boolean)
//           .map(String)
//           .includes(String(item.workSessionId ?? '')),
//     );
//     const legacyRetailingRouteId =
//       routeSessions.length === 0 && record?.activityName === 'Retailing'
//         ? record?.routeId
//         : undefined;
//     const routeId = String(activeRouteSession?.routeId ?? legacyRetailingRouteId ?? '');
//     const routeRecord = routeId
//       ? await repositories.routes.findById(user?.userId ?? '', routeId)
//       : null;
//     const selectedRoute = routeId
//       ? {
//           ...routeRecord,
//           routeId,
//           name: activeRouteSession?.routeName ?? routeRecord?.name,
//           routeName: activeRouteSession?.routeName ?? routeRecord?.name,
//           routeSessionId: activeRouteSession?.routeSessionId ?? activeRouteSession?.uuid ?? '',
//           workSessionId: activeRouteSession?.workSessionId ?? record?.uuid,
//           totalShops: activeRouteSession?.totalShops ?? routeRecord?.outletCount ?? 0,
//           vanId: activeRouteSession?.vanId ?? record?.vanId ?? user?.vanId,
//         }
//       : null;
//     const currentActivity = activities.find((item) => item.status === 'ongoing' && !item.endTime);
//     const activeActivity = currentActivity
//       ? {
//           ...currentActivity,
//           name: currentActivity.name,
//           startTime: currentActivity.startTime ?? currentActivity.createdAt,
//         }
//       : record &&
//           activities.length === 0 &&
//           String(record.status ?? '').toUpperCase() === 'ACTIVE' &&
//           record.activityName
//         ? {
//             _id: `work-session-${record.uuid}`,
//             name: record.activityName,
//             startTime: record.startTime,
//             status: 'ongoing',
//           }
//         : null;
//     return {
//       success: true,
//       statusCode: 200,
//       data: record
//         ? {
//             ...record,
//             workSessionId: record.uuid,
//             activeActivity,
//             selectedRoute,
//             todayActivities: activities.length
//               ? activities
//               : activeActivity
//                 ? [activeActivity]
//                 : [],
//           }
//         : null,
//       offline: true,
//     } as ApiResponse<any>;
//   },
//   getTodayActivities: async (workSessionId) => {
//     const user = useAuthStore.getState().user;
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<any>(`/activity`, {
//         params: { workSessionId },
//       }) as Promise<ApiResponse<any>>;
//     }
//     const records = await repositories.activities.findAll(user?.userId ?? '', { limit: 200 });
//     const data = records
//       .filter((item) => !workSessionId || item.workSessionId === workSessionId)
//       .map((item) => ({
//         ...item,
//         _id: item._id ?? item.activityId ?? item.uuid,
//         activityId: item.activityId ?? item.uuid,
//         name: item.name ?? item.activityName ?? 'Activity',
//         startTime: item.startTime ?? item.createdAt,
//         status: String(item.status ?? '').toUpperCase() === 'ACTIVE' ? 'ongoing' : 'completed',
//       }));
//     return { success: true, statusCode: 200, data, offline: true } as ApiResponse<any>;
//   },
//   createActivity: async (payload) => {
//   const user = useAuthStore.getState().user;

//   /**
//    * ======================================================
//    * NON-SALESMAN
//    * ======================================================
//    */
//   if (!isSalesman(user)) {
//     return api.post<any, CreateActivityPayload>('/activity', payload);
//   }

//   /**
//    * ======================================================
//    * ONLINE MODE
//    * ======================================================
//    */
//   if (!isOfflineMode()) {
//     const response = await api.post<any, CreateActivityPayload>(
//       '/activity',
//       payload,
//     );

//     if (response?.success) return response;

//     /**
//      * Network reachability can change before listener updates Zustand.
//      * Fall through to SQLite so activity is not lost.
//      */
//     useOfflineStore.getState().setConnection(false, false);
//   }

//   /**
//    * ======================================================
//    * OFFLINE MODE
//    * Same behavior as online ActivityService.create()
//    * ======================================================
//    */
//   const ownerId = user?.userId ?? '';
//   const now = new Date().toISOString();

//   const workSessionId = String(payload.workSessionId || '');
//   const vanId = String(payload.vanId || user?.vanId || '');
//   const vanName = payload.vanName || user?.vanName;

//   if (!ownerId) {
//     throw new Error('User is required for offline activity');
//   }

//   if (!workSessionId) {
//     throw new Error('Work session is required. Please start your day first.');
//   }

//   if (!vanId) {
//     throw new Error('Van is required for offline activity');
//   }

//   const toNumber = (value: unknown, fallback = 0) => {
//     const num = Number(value);
//     return Number.isFinite(num) ? num : fallback;
//   };

//   const toTime = (value: unknown) => {
//     const time = value ? new Date(String(value)).getTime() : 0;
//     return Number.isFinite(time) ? time : 0;
//   };

//   const loadAll = async (repository: any, maxRecords = 10000) => {
//     const records: Record<string, any>[] = [];

//     for (let page = 1; ; page += 1) {
//       const batch = await repository.findAll(ownerId, {
//         page,
//         limit: 200,
//       });

//       records.push(...batch);

//       if (batch.length < 200 || records.length >= maxRecords) {
//         return records;
//       }
//     }
//   };

//   /**
//    * ======================================================
//    * 1. COMPLETE PREVIOUS ACTIVE ACTIVITIES
//    * Same as backend updateMany({ workSessionId, ACTIVE })
//    * ======================================================
//    */
//   const existingActivities = await loadAll(repositories.activities, 1000);

//   await Promise.all(
//     existingActivities
//       .filter(
//         (item) =>
//           String(item.workSessionId || '') === workSessionId &&
//           String(item.status ?? '').toUpperCase() === 'ACTIVE' &&
//           item.isDeleted !== true &&
//           !item.deletedAt,
//       )
//       .map((item) =>
//         repositories.activities.update(ownerId, item.uuid, {
//           status: 'COMPLETED',
//           endTime: now,
//         }),
//       ),
//   );

//   /**
//    * ======================================================
//    * 2. COMPLETE PREVIOUS ACTIVE ROUTE SESSIONS
//    * Same as routeSessionService.markCompleted()
//    * ======================================================
//    */
//   const existingRouteSessions = await loadAll(
//     repositories.routeSessions,
//     1000,
//   );

//   await Promise.all(
//     existingRouteSessions
//       .filter(
//         (item) =>
//           String(item.workSessionId || '') === workSessionId &&
//           String(item.status ?? '').toUpperCase() === 'ACTIVE' &&
//           item.isDeleted !== true &&
//           !item.deletedAt,
//       )
//       .map((item) =>
//         repositories.routeSessions.update(ownerId, item.uuid, {
//           status: 'COMPLETED',
//           isActive: false,
//           endTime: now,
//         }),
//       ),
//   );

//   /**
//    * ======================================================
//    * 3. CREATE NEW ACTIVITY
//    * ======================================================
//    */
//   const activityId = createSchemaId('Activity');

//   const record = await repositories.activities.create(ownerId, {
//     ...payload,

//     uuid: activityId,
//     activityId,

//     userId: user?.userId,
//     userName: user?.name,

//     vanId,
//     vanName,

//     name: payload.name,
//     description: payload.description || '',

//     startTime: now,
//     status: 'ACTIVE',
//   } as unknown as Record<string, unknown>);

//   /**
//    * ======================================================
//    * 4. CREATE ROUTE SESSION + VAN DAILY STOCK
//    * Only when activity has routeId
//    * ======================================================
//    */
//   if (payload.routeId) {
//     await createOfflineRouteSession({
//       ownerId,
//       user,
//       payload,
//       workSessionId,
//       vanId,
//       vanName,
//       nowIso: now,
//       completeExisting: false,
//     });

//     /**
//      * ======================================================
//      * 5. CREATE VAN DAILY STOCK
//      *
//      * Same as online:
//      * - If daily stock already exists for workSessionId, do nothing.
//      * - Else use vanErpClosing first.
//      * - If vanErpClosing not found, fallback to stock/inventories.
//      * ======================================================
//      */
//     const existingDailyStock = await loadAll(
//       repositories.vanDailyStock,
//       10000,
//     );

//     const hasDailyStockForSession = existingDailyStock.some(
//       (item) =>
//         String(item.workSessionId || '') === workSessionId &&
//         String(item.vanId || '') === vanId &&
//         item.isDeleted !== true &&
//         !item.deletedAt,
//     );

//     /**
//      * Important:
//      * Route change inside same work session must not reset stock.
//      */
//     if (!hasDailyStockForSession) {
//       const [erpClosingRecords, stockRecords, productRecords] =
//         await Promise.all([
//           loadAll(repositories.vanErpClosing, 10000),
//           loadAll(repositories.stock, 10000),
//           loadAll(repositories.products, 10000),
//         ]);

//       const productById = new Map(
//         productRecords.map((product) => [
//           String(product.productId),
//           product,
//         ]),
//       );

//       /**
//        * ======================================================
//        * PREFER LATEST ERP CLOSING STOCK FOR VAN
//        * Same as backend getLatestOpeningStock(vanId)
//        * ======================================================
//        */
//       const validErpClosing = erpClosingRecords
//         .filter(
//           (item) =>
//             String(item.vanId || '') === vanId &&
//             item.isDeleted !== true &&
//             !item.deletedAt,
//         )
//         .sort((a, b) => {
//           const aTime = toTime(
//             a.date ||
//               a.closeDate ||
//               a.modifiedDate ||
//               a.createdDate ||
//               a.updatedAt ||
//               a.createdAt,
//           );

//           const bTime = toTime(
//             b.date ||
//               b.closeDate ||
//               b.modifiedDate ||
//               b.createdDate ||
//               b.updatedAt ||
//               b.createdAt,
//           );

//           return bTime - aTime;
//         });

//       const latestErpDate = validErpClosing[0]
//         ? String(
//             validErpClosing[0].date ||
//               validErpClosing[0].closeDate ||
//               validErpClosing[0].modifiedDate ||
//               validErpClosing[0].createdDate ||
//               '',
//           ).slice(0, 10)
//         : '';

//       const latestErpRows = latestErpDate
//         ? validErpClosing.filter((item) =>
//             String(
//               item.date ||
//                 item.closeDate ||
//                 item.modifiedDate ||
//                 item.createdDate ||
//                 '',
//             ).startsWith(latestErpDate),
//           )
//         : [];

//       /**
//        * ======================================================
//        * BUILD OPENING STOCK
//        * ERP first, fallback stock second
//        * ======================================================
//        */
//       const openingStocks = latestErpRows.length
//         ? latestErpRows
//             .map((item) => {
//               const productId = String(item.productId || item.itemCode || '');
//               const product = productById.get(productId);

//               const unitQtyInCase = Math.max(
//                 toNumber(
//                   item.unitQtyInCase ??
//                     item.piecePerCase ??
//                     product?.unitQtyInCase,
//                   1,
//                 ),
//                 1,
//               );

//               /**
//                * ERP can have cases or direct quantity.
//                */
//               const quantity =
//                 toNumber(item.quantity) ||
//                 toNumber(item.qty) ||
//                 toNumber(item.closingQty) ||
//                 toNumber(item.closingCases) * unitQtyInCase;

//               return {
//                 productId,
//                 productName:
//                   item.productName ||
//                   item.itemName ||
//                   product?.productName ||
//                   product?.name,

//                 unitQtyInCase,
//                 quantity,

//                 pieceNetWeight: toNumber(
//                   item.pieceNetWeight ?? product?.pieceNetWeight,
//                 ),

//                 caseNetWeight: toNumber(
//                   item.caseNetWeight ?? product?.caseNetWeight,
//                 ),

//                 piecePrice: toNumber(
//                   item.piecePrice ?? product?.piecePrice,
//                 ),

//                 casePrice: toNumber(
//                   item.casePrice ?? product?.casePrice,
//                 ),
//               };
//             })
//             .filter((item) => item.productId && item.quantity > 0)
//         : stockRecords
//             .filter(
//               (item) =>
//                 String(item.vanId || '') === vanId &&
//                 item.isDeleted !== true &&
//                 !item.deletedAt &&
//                 toNumber(item.quantity) > 0,
//             )
//             .map((item) => {
//               const product = productById.get(String(item.productId));

//               const unitQtyInCase = Math.max(
//                 toNumber(item.unitQtyInCase ?? product?.unitQtyInCase, 1),
//                 1,
//               );

//               const pieceNetWeight = toNumber(
//                 item.pieceNetWeight ?? product?.pieceNetWeight,
//               );

//               const piecePrice = toNumber(
//                 item.piecePrice ?? product?.piecePrice,
//               );

//               return {
//                 productId: String(item.productId),
//                 productName:
//                   item.productName ||
//                   product?.productName ||
//                   product?.name,

//                 unitQtyInCase,
//                 quantity: toNumber(item.quantity),

//                 pieceNetWeight,
//                 caseNetWeight:
//                   toNumber(item.caseNetWeight ?? product?.caseNetWeight) ||
//                   pieceNetWeight * unitQtyInCase,

//                 piecePrice,
//                 casePrice:
//                   toNumber(item.casePrice ?? product?.casePrice) ||
//                   piecePrice * unitQtyInCase,
//               };
//             });

//       /**
//        * ======================================================
//        * DEDUPLICATE OPENING STOCK PRODUCT-WISE
//        * Protects local from duplicate vanDailyStock rows.
//        * ======================================================
//        */
//       const stockByProduct = new Map<string, any>();

//       for (const stock of openingStocks) {
//         const productId = String(stock.productId || '');

//         if (!productId) continue;

//         const existing = stockByProduct.get(productId);

//         if (existing) {
//           existing.quantity += toNumber(stock.quantity);

//           /**
//            * Keep latest non-empty pricing/weight.
//            */
//           existing.unitQtyInCase =
//             stock.unitQtyInCase || existing.unitQtyInCase;
//           existing.pieceNetWeight =
//             stock.pieceNetWeight || existing.pieceNetWeight;
//           existing.caseNetWeight =
//             stock.caseNetWeight || existing.caseNetWeight;
//           existing.piecePrice = stock.piecePrice || existing.piecePrice;
//           existing.casePrice = stock.casePrice || existing.casePrice;
//         } else {
//           stockByProduct.set(productId, { ...stock });
//         }
//       }

//       const uniqueOpeningStocks = Array.from(stockByProduct.values());

//       /**
//        * ======================================================
//        * CREATE VAN DAILY STOCK ROWS
//        * One product per workSessionId
//        * ======================================================
//        */
//       for (const stock of uniqueOpeningStocks) {
//         const productId = String(stock.productId || '');

//         if (!productId) continue;

//         /**
//          * Final safety:
//          * Do not create duplicate product row for same workSessionId.
//          */
//         const alreadyExists = existingDailyStock.some(
//           (item) =>
//             String(item.workSessionId || '') === workSessionId &&
//             String(item.vanId || '') === vanId &&
//             String(item.productId || '') === productId &&
//             item.isDeleted !== true &&
//             !item.deletedAt,
//         );

//         if (alreadyExists) continue;

//         const vanDailyStockId = createSchemaId('VanDailyStock');

//         await repositories.vanDailyStock.create(ownerId, {
//           uuid: vanDailyStockId,
//           vanDailyStockId,

//           date: now,

//           vanId,
//           employeeId: user?.userId,

//           productId,
//           productName: stock.productName,

//           unitQtyInCase: stock.unitQtyInCase || 1,

//           openingQty: stock.quantity || 0,
//           inQty: 0,
//           outQty: 0,
//           adjustmentQty: 0,
//           closingQty: stock.quantity || 0,

//           pieceNetWeight: stock.pieceNetWeight || 0,
//           caseNetWeight: stock.caseNetWeight || 0,

//           piecePrice: stock.piecePrice || 0,
//           casePrice: stock.casePrice || 0,

//           workSessionId,

//           status: 'DRAFT',
//         } as unknown as Record<string, unknown>);
//       }
//     }
//   }

//   return {
//     success: true,
//     statusCode: 202,
//     message: 'Activity saved locally',
//     data: {
//       ...record,
//       activityId,
//     },
//     offline: true,
//   } as ApiResponse<any>;
// },
//   getRoutes: async (vanId) => {
//     const user = useAuthStore.getState().user;
//     if (!isSalesman(user)) {
//       return api.get<any>('/route');
//     }
//     if (!isOfflineMode()) {
//       // Route-to-van assignments live on the van document. The generic route
//       // listing does not accept vanId and rejects it as a non-whitelisted query.
//       return api.get<any>('/van/mapped-routes');
//     }
//     const data = await repositories.routes.findAll(user?.userId ?? '', { limit: 200 });
//     return {
//       success: true,
//       statusCode: 200,
//       data: {
//         vanId,
//         routes: data.map((record) => ({
//           routeId: record.routeId ?? record.uuid,
//           ...(record.assignment && typeof record.assignment === 'object'
//             ? (record.assignment as Record<string, unknown>)
//             : {}),
//           route: record,
//         })),
//       },
//     } as ApiResponse<any>;
//   },
//   getVanMappedRoutes: async () => {
//     const user = useAuthStore.getState().user;
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<any>(`/van/mapped-routes`, {}) as Promise<ApiResponse<any>>;
//     }

//     const records = await repositories.routes.findAll(user?.userId ?? '', { limit: 200 });
//     if (!records.length) {
//       // The HTTP layer restores the login-prefetched snapshot while offline.
//       return api.get<any>(`/van/mapped-routes`, {}) as Promise<ApiResponse<any>>;
//     }
//     const routes = records.map((record) => {
//       const assignment =
//         record.assignment && typeof record.assignment === 'object'
//           ? (record.assignment as Record<string, unknown>)
//           : {};
//       return {
//         routeId: record.routeId ?? record.uuid,
//         ...assignment,
//         route: record,
//       };
//     });

//     return {
//       success: true,
//       statusCode: 200,
//       data: { vanId: user?.vanId, routes },
//       offline: true,
//     } as ApiResponse<any>;
//   },
//   getVan: async (userId: string) => {
//     const user = useAuthStore.getState().user;
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<any>(`/van`, { params: { limit: 1, page: 1, userId } });
//     }
//     const data = await repositories.vans.findAll(user?.userId ?? '', { limit: 1 });
//     return {
//       success: true,
//       statusCode: 200,
//       data,
//       offline: true,
//     } as ApiResponse<any>;
//   },
//   getVans: async (params) => {
//     const user = useAuthStore.getState().user;
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<any>(`/van`, { params: { limit: 50, page: 1, ...(params || {}) } });
//     }
//     const data = await repositories.vans.findAll(user?.userId ?? '', { limit: 50 });
//     return {
//       success: true,
//       statusCode: 200,
//       data,
//       meta: { total: data.length, page: 1, limit: 50 },
//       offline: true,
//     } as ApiResponse<any>;
//   },
//   dayComplete: async (carryForwardStock, config) => {
//     const pendingEntries = await syncService.getPendingCount();
//     if (pendingEntries > 0) {
//       useLoaderStore.getState().show({
//         message: `Uploading ${pendingEntries} pending entr${pendingEntries === 1 ? 'y' : 'ies'} before settlement...`,
//       });
//       await syncService.uploadPendingBeforeSettlement();
//       useLoaderStore
//         .getState()
//         .show({ message: 'Pending entries uploaded. Completing settlement...' });
//     }

//     const payload =
//       carryForwardStock &&
//       typeof carryForwardStock === 'object' &&
//       'dayEndLocation' in carryForwardStock
//         ? carryForwardStock
//         : {
//             carryForwardStock,
//             dayEndLocation: await captureCurrentLocation(),
//           };

//     const user = useAuthStore.getState().user;
//     if (isSalesman(user) && isOfflineMode()) {
//       const workSessionId = useAuthStore.getState().workSessionId;
//       if (!workSessionId)
//         return {
//           success: false,
//           statusCode: 404,
//           message: 'No active work session',
//           data: null,
//         } as ApiResponse<any>;
//       const ownerId = user?.userId ?? '';
//       const endedAt = new Date().toISOString();
//       const [activities, routeSessions] = await Promise.all([
//         repositories.activities.findAll(ownerId, { limit: 200 }),
//         repositories.routeSessions.findAll(ownerId, { limit: 200 }),
//       ]);
//       await Promise.all([
//         ...activities
//           .filter(
//             (item) =>
//               item.workSessionId === workSessionId &&
//               String(item.status ?? '').toUpperCase() === 'ACTIVE',
//           )
//           .map((item) =>
//             repositories.activities.update(ownerId, item.uuid, {
//               status: 'COMPLETED',
//               endTime: endedAt,
//             }),
//           ),
//         ...routeSessions
//           .filter(
//             (item) =>
//               item.workSessionId === workSessionId &&
//               String(item.status ?? '').toUpperCase() === 'ACTIVE',
//           )
//           .map((item) =>
//             repositories.routeSessions.update(ownerId, item.uuid, {
//               status: 'COMPLETED',
//               isActive: false,
//               endTime: endedAt,
//             }),
//           ),
//       ]);
//       const record = await repositories.attendance.update(ownerId, workSessionId, {
//         ...payload,
//         status: 'COMPLETED',
//         dayEndTime: endedAt,
//         endTime: endedAt,
//       });
//       await stopSalesmanBackgroundLocation();
//       return {
//         success: true,
//         statusCode: 202,
//         message: 'Day completion saved locally',
//         data: record,
//       } as ApiResponse<any>;
//     }
//     const response = (await api.post(
//       '/work-session/complete',
//       payload,
//       config,
//     )) as ApiResponse<any>;

//     if (response?.success) {
//       await stopSalesmanBackgroundLocation();
//       // Pull the completed work session/activity immediately. Otherwise the
//       // local database still contains the pre-settlement ACTIVE records and
//       // shows an ongoing activity after switching offline.
//       // Settlement is already complete on the server, so do not keep the user
//       // waiting for a full upload/download and snapshot refresh.
//       void syncService.sync().catch(() => undefined);
//     }

//     return response;
//   },
//   cancelVanChangeRequest: (vanChangeRequestId: string) =>
//     api.patch<any>(`/van-change-request/${vanChangeRequestId}/cancel`, {}) as Promise<
//       ApiResponse<any>
//     >,
//   requestVanChange: (workSessionId, payload) =>
//     api.post<any>('/van-change-request', {
//       workSessionId,
//       requestedVanId: payload.requestedVanId,
//       requestedVanName: payload.requestedVanName,
//       reason: payload.vanChangeReason,
//     }) as Promise<ApiResponse<any>>,
//   getEmployeeStats: async (employeeId: string) => {
//     const user = useAuthStore.getState().user;
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<any>(`/employee/${employeeId}/stats`, {}) as Promise<ApiResponse<any>>;
//     }

//     const ownerId = user?.userId ?? employeeId;
//     const [visits, orders] = await Promise.all([
//       repositories.visits.findAll(ownerId, { limit: 200 }),
//       repositories.orders.findAll(ownerId, { limit: 200 }),
//     ]);
//     const today = new Date();
//     const isToday = (value: unknown) => {
//       if (!value) return false;
//       const date = new Date(String(value));
//       return (
//         !Number.isNaN(date.getTime()) &&
//         date.getFullYear() === today.getFullYear() &&
//         date.getMonth() === today.getMonth() &&
//         date.getDate() === today.getDate()
//       );
//     };
//     const todayVisits = visits.filter((item) => isToday(item.checkInTime ?? item.createdAt));
//     const completedVisits = todayVisits.filter(
//       (item) => String(item.status ?? '').toUpperCase() === 'COMPLETED',
//     );
//     const todayOrders = orders.filter((item) => isToday(item.date ?? item.createdAt));
//     const sum = (key: string) =>
//       todayOrders.reduce((total, order) => total + Number(order[key] ?? 0), 0);

//     return {
//       success: true,
//       statusCode: 200,
//       data: {
//         visits: completedVisits.length,
//         totalVisits: todayVisits.length,
//         tc: completedVisits.length,
//         pc: todayOrders.length,
//         orders: {
//           count: todayOrders.length,
//           value: sum('totalValue'),
//           cases: sum('totalCases'),
//           weight: sum('totalWeight'),
//           pending: todayOrders.filter(
//             (item) => String(item.status ?? '').toUpperCase() === 'PENDING',
//           ).length,
//         },
//         incentives: { earned: 0, target: 0, nextMilestone: 0 },
//       },
//       offline: true,
//     } as ApiResponse<any>;
//   },
//   // getSalesmanPocketAndTarget: (params) =>
//   //   api.get<SalesmanPocketTargetResponse>(`/employee/salesman/my-pocket-target`, {
//   //     params,
//   //   }) as Promise<ApiResponse<SalesmanPocketTargetResponse>>,
//   getSalesmanPocketAndTarget: async (params) => {
//     const user = useAuthStore.getState().user;

//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<SalesmanPocketTargetResponse>(`/employee/salesman/my-pocket-target`, {
//         params,
//       }) as Promise<ApiResponse<SalesmanPocketTargetResponse>>;
//     }

//     const ownerId = user?.userId ?? '';

//     const parseDate = (value?: string) => {
//       const date = value ? new Date(value) : new Date();
//       return Number.isNaN(date.getTime()) ? new Date() : date;
//     };

//     const now = params?.endDate
//       ? parseDate(params.endDate)
//       : params?.date
//         ? parseDate(params.date)
//         : new Date();

//     const hasDateRange = Boolean(params?.startDate || params?.endDate);

//     const startDate = params?.startDate
//       ? parseDate(params.startDate)
//       : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

//     startDate.setHours(0, 0, 0, 0);

//     const endDate = hasDateRange ? parseDate(params?.endDate || params?.startDate) : now;

//     endDate.setHours(23, 59, 59, 999);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     if (endDate > todayEnd) {
//       endDate.setTime(todayEnd.getTime());
//     }

//     const monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

//     const lmtdDate = new Date(
//       now.getFullYear(),
//       now.getMonth() - 1,
//       Math.min(now.getDate(), new Date(now.getFullYear(), now.getMonth(), 0).getDate()),
//       now.getHours(),
//       now.getMinutes(),
//       now.getSeconds(),
//       now.getMilliseconds(),
//     );

//     const lmtdStartDate = new Date(lmtdDate.getFullYear(), lmtdDate.getMonth(), 1, 0, 0, 0, 0);

//     const normalizedMetric: TargetMetric = ['cases', 'tonnage', 'value'].includes(
//       params?.metric || 'cases',
//     )
//       ? (params?.metric as TargetMetric)
//       : 'cases';

//     const openActivityEnd = endDate.getTime() > Date.now() ? new Date() : endDate;

//     const isBetween = (value: unknown, from: Date, to: Date) => {
//       if (!value) return false;

//       const date = new Date(String(value));

//       return !Number.isNaN(date.getTime()) && date >= from && date <= to;
//     };

//     const formatCalendarDate = (value: Date) => {
//       const year = value.getFullYear();
//       const month = String(value.getMonth() + 1).padStart(2, '0');
//       const day = String(value.getDate()).padStart(2, '0');

//       return `${year}-${month}-${day}`;
//     };

//     const formatTime = (value?: Date | string | null) => {
//       if (!value) return null;

//       const parsedDate = new Date(value);

//       if (Number.isNaN(parsedDate.getTime())) return null;

//       return parsedDate.toLocaleTimeString('en-IN', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//       });
//     };

//     const formatAverageTime = (values: Array<Date | string | null | undefined>) => {
//       const minutes = values
//         .map((value) => {
//           if (!value) return null;

//           const parsedDate = new Date(value);

//           if (Number.isNaN(parsedDate.getTime())) return null;

//           return parsedDate.getHours() * 60 + parsedDate.getMinutes();
//         })
//         .filter((value): value is number => value !== null);

//       if (!minutes.length) return null;

//       const averageMinutes = Math.round(
//         minutes.reduce((sum, value) => sum + value, 0) / minutes.length,
//       );

//       const averageDate = new Date();

//       averageDate.setHours(Math.floor(averageMinutes / 60), averageMinutes % 60, 0, 0);

//       return formatTime(averageDate);
//     };

//     const formatDurationMinutes = (value: number) => {
//       if (!Number.isFinite(value) || value < 1) return '< 1 min';

//       const hours = Math.floor(value / 60);
//       const minutes = value % 60;

//       if (!hours) return `${minutes} min${minutes === 1 ? '' : 's'}`;
//       if (!minutes) return `${hours} hr${hours === 1 ? '' : 's'}`;

//       return `${hours} hr${hours === 1 ? '' : 's'} ${minutes} min${minutes === 1 ? '' : 's'}`;
//     };

//     const formatAverageDuration = (values: Array<number | null | undefined>) => {
//       const minutes = values
//         .map((value) => Math.max(Math.round(Number(value || 0) / 60000), 0))
//         .filter((value) => value > 0);

//       if (!minutes.length) return null;

//       const averageMinutes = Math.round(
//         minutes.reduce((sum, value) => sum + value, 0) / minutes.length,
//       );

//       return formatDurationMinutes(averageMinutes);
//     };

//     const formatDayLabel = (value: Date) =>
//       value.toLocaleDateString('en-IN', {
//         weekday: 'short',
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       });

//     const [
//       targetRecords,
//       orderRecords,
//       visitRecords,
//       activityRecords,
//       leaveRecords,
//       workSessionRecords,
//       vanStockRecords,
//     ] = await Promise.all([
//       repositories.targets.findAll(ownerId, { limit: 5000 }),
//       repositories.orders.findAll(ownerId, { limit: 5000 }),
//       repositories.visits.findAll(ownerId, { limit: 5000 }),
//       repositories.activities.findAll(ownerId, { limit: 5000 }),
//       repositories.leaves.findAll(ownerId, { limit: 5000 }),
//       repositories.attendance.findAll(ownerId, { limit: 5000 }),
//       repositories.vanDailyStock.findAll(ownerId, { limit: 5000 }),
//     ]);

//     const targets = targetRecords.filter(
//       (item: any) => new Date(item.startDate) <= endDate && new Date(item.endDate) >= startDate,
//     );

//     const lmtdTargets = targetRecords.filter(
//       (item: any) =>
//         new Date(item.startDate) <= lmtdDate && new Date(item.endDate) >= lmtdStartDate,
//     );

//     const sales = orderRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(item.date || item.createdAt, startDate, endDate),
//     );

//     const lmtdSales = orderRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(item.date || item.createdAt, lmtdStartDate, lmtdDate),
//     );

//     const totalVisits = visitRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(item.checkInTime || item.createdAt, startDate, endDate),
//     );

//     const uniqueVisitedOutlets = new Set(
//       totalVisits.map((item: any) => item.outletId).filter(Boolean),
//     );

//     const activities = activityRecords.filter(
//       (item: any) =>
//         ['ACTIVE', 'COMPLETED'].includes(String(item.status ?? '').toUpperCase()) &&
//         isBetween(item.startTime || item.createdAt, startDate, endDate),
//     );

//     const retailingDays = new Set(
//       activities
//         .filter((item: any) => item.name === 'Retailing')
//         .map((item: any) => formatCalendarDate(new Date(item.startTime || item.createdAt))),
//     );

//     const vanStock = vanStockRecords.filter((item: any) =>
//       isBetween(item.date || item.createdAt, startDate, endDate),
//     );

//     const leaves = leaveRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(item.createdAt, startDate, endDate),
//     );

//     const workSessions = workSessionRecords.filter((item: any) =>
//       isBetween(item.dayStartTime || item.createdAt, startDate, endDate),
//     );

//     const targetCases = targets.reduce(
//       (sum: number, item: any) => sum + Number(item.targetCases || 0),
//       0,
//     );
//     const targetTonnage = targets.reduce(
//       (sum: number, item: any) => sum + Number(item.targetTonnage || 0),
//       0,
//     );
//     const targetValue = targets.reduce(
//       (sum: number, item: any) => sum + Number(item.targetValue || 0),
//       0,
//     );

//     const achievedCases = sales.reduce(
//       (sum: number, item: any) => sum + Number(item.netCases || item.totalCases || 0),
//       0,
//     );
//     const achievedTonnage = sales.reduce(
//       (sum: number, item: any) => sum + Number(item.totalWeight || 0) / 1000,
//       0,
//     );
//     const achievedValue = sales.reduce(
//       (sum: number, item: any) => sum + Number(item.totalValue || 0),
//       0,
//     );

//     const remainingCases = Math.max(targetCases - achievedCases, 0);
//     const remainingTonnage = Math.max(targetTonnage - achievedTonnage, 0);
//     const remainingValue = Math.max(targetValue - achievedValue, 0);

//     const lmtdTargetCases = lmtdTargets.reduce(
//       (sum: number, item: any) => sum + Number(item.targetCases || 0),
//       0,
//     );
//     const lmtdTargetTonnage = lmtdTargets.reduce(
//       (sum: number, item: any) => sum + Number(item.targetTonnage || 0),
//       0,
//     );
//     const lmtdTargetValue = lmtdTargets.reduce(
//       (sum: number, item: any) => sum + Number(item.targetValue || 0),
//       0,
//     );

//     const lmtdAchievedCases = lmtdSales.reduce(
//       (sum: number, item: any) => sum + Number(item.netCases || item.totalCases || 0),
//       0,
//     );
//     const lmtdAchievedTonnage = lmtdSales.reduce(
//       (sum: number, item: any) => sum + Number(item.totalWeight || 0) / 1000,
//       0,
//     );
//     const lmtdAchievedValue = lmtdSales.reduce(
//       (sum: number, item: any) => sum + Number(item.totalValue || 0),
//       0,
//     );

//     const pc = sales.length;
//     const tc = totalVisits.length;
//     const upc = new Set(sales.map((item: any) => item.customerId).filter(Boolean)).size;
//     const utc = uniqueVisitedOutlets.size;
//     const retailingDayCount = retailingDays.size;

//     const totalLinesSold = sales.reduce(
//       (sum: number, item: any) => sum + Number(item.lineCount || item.totalLines || 0),
//       0,
//     );

//     const openingStockCases = vanStock.reduce((sum: number, item: any) => {
//       const unitQty = Number(item.unitQtyInCase || 1);
//       return sum + Number(item.openingQty || 0) / unitQty;
//     }, 0);

//     const topupStockCases = vanStock.reduce((sum: number, item: any) => {
//       const unitQty = Number(item.unitQtyInCase || 1);
//       return sum + Number(item.inQty || 0) / unitQty;
//     }, 0);

//     const stockSalesCases = vanStock.reduce((sum: number, item: any) => {
//       const unitQty = Number(item.unitQtyInCase || 1);
//       return sum + Number(item.outQty || 0) / unitQty;
//     }, 0);

//     const totalStockCases = openingStockCases + topupStockCases;

//     const utilizationPercentage =
//       totalStockCases > 0 ? Number(((stockSalesCases / totalStockCases) * 100).toFixed(2)) : 0;

//     const selectedTarget =
//       normalizedMetric === 'tonnage'
//         ? targetTonnage
//         : normalizedMetric === 'value'
//           ? targetValue
//           : targetCases;

//     const selectedAchieved =
//       normalizedMetric === 'tonnage'
//         ? achievedTonnage
//         : normalizedMetric === 'value'
//           ? achievedValue
//           : achievedCases;

//     const selectedRemaining = Math.max(selectedTarget - selectedAchieved, 0);

//     const lmtdTarget =
//       normalizedMetric === 'tonnage'
//         ? lmtdTargetTonnage
//         : normalizedMetric === 'value'
//           ? lmtdTargetValue
//           : lmtdTargetCases;

//     const lmtdAchieved =
//       normalizedMetric === 'tonnage'
//         ? lmtdAchievedTonnage
//         : normalizedMetric === 'value'
//           ? lmtdAchievedValue
//           : lmtdAchievedCases;

//     const elapsedDays =
//       Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

//     const remainingDays = Math.max(monthEndDate.getDate() - elapsedDays, 1);

//     const achievementPercentage =
//       targetCases > 0 ? Number(((achievedCases / targetCases) * 100).toFixed(2)) : 0;

//     const selectedAchievementPercentage =
//       selectedTarget > 0 ? Number(((selectedAchieved / selectedTarget) * 100).toFixed(2)) : 0;

//     const lmtdAchievementPercentage =
//       lmtdTarget > 0 ? Number(((lmtdAchieved / lmtdTarget) * 100).toFixed(2)) : 0;

//     const improvement = Number(
//       (selectedAchievementPercentage - lmtdAchievementPercentage).toFixed(2),
//     );

//     const selectedDecimalPlaces = normalizedMetric === 'tonnage' ? 3 : 2;

//     const activityDayMap = new Map<string, any>();
//     const visitDayMap = new Map<string, any>();
//     const salesDayMap = new Map<string, any>();
//     const leaveDayMap = new Map<string, any>();
//     const workSessionDayMap = new Map<string, any>();

//     for (const item of activities) {
//       const start = new Date(item.startTime || item.createdAt);
//       const dayKey = formatCalendarDate(start);

//       const existing = activityDayMap.get(dayKey) || {
//         retailing: 0,
//         officialWork: 0,
//         totalActivities: 0,
//         retailingDurationMs: 0,
//         totalDurationMs: 0,
//       };

//       const isRetailing = item.name === 'Retailing';
//       const end = item.endTime ? new Date(item.endTime) : openActivityEnd;
//       const durationMs = Math.max(end.getTime() - start.getTime(), 0);

//       existing.totalActivities += 1;
//       existing.totalDurationMs += durationMs;

//       if (isRetailing) {
//         existing.retailing += 1;
//         existing.retailingDurationMs += durationMs;
//       } else {
//         existing.officialWork += 1;
//       }

//       activityDayMap.set(dayKey, existing);
//     }

//     for (const item of totalVisits) {
//       const checkInTime = new Date(item.checkInTime || item.createdAt);
//       const dayKey = formatCalendarDate(checkInTime);

//       const existing = visitDayMap.get(dayKey) || {
//         tc: 0,
//         firstCallTime: null,
//       };

//       existing.tc += 1;

//       if (!existing.firstCallTime || checkInTime < new Date(existing.firstCallTime)) {
//         existing.firstCallTime = checkInTime;
//       }

//       visitDayMap.set(dayKey, existing);
//     }

//     for (const item of sales) {
//       const saleDate = new Date(item.date || item.createdAt);
//       const dayKey = formatCalendarDate(saleDate);

//       const existing = salesDayMap.get(dayKey) || {
//         pc: 0,
//         upc: new Set<string>(),
//         cases: 0,
//         tonnage: 0,
//         netValue: 0,
//         firstPcTime: null,
//       };

//       existing.pc += 1;

//       if (item.customerId) {
//         existing.upc.add(item.customerId);
//       }

//       existing.cases += Number(item.netCases || item.totalCases || 0);
//       existing.tonnage += Number(item.totalWeight || 0) / 1000;
//       existing.netValue += Number(item.totalValue || 0);

//       if (!existing.firstPcTime || saleDate < new Date(existing.firstPcTime)) {
//         existing.firstPcTime = saleDate;
//       }

//       salesDayMap.set(dayKey, existing);
//     }

//     for (const item of leaves) {
//       const leaveDate = new Date(item.createdAt);
//       const dayKey = formatCalendarDate(leaveDate);

//       const existing = leaveDayMap.get(dayKey) || {
//         leave: 0,
//       };

//       existing.leave += 1;

//       leaveDayMap.set(dayKey, existing);
//     }

//     for (const item of workSessions) {
//       const dayStartTime = new Date(item.dayStartTime || item.createdAt);
//       const dayKey = formatCalendarDate(dayStartTime);

//       const existing = workSessionDayMap.get(dayKey) || {
//         dayStarted: 0,
//         dayCompleted: 0,
//         latestStatus: null,
//       };

//       existing.dayStarted += 1;

//       if (String(item.status ?? '').toUpperCase() === 'COMPLETED') {
//         existing.dayCompleted += 1;
//       }

//       existing.latestStatus = item.status ?? null;

//       workSessionDayMap.set(dayKey, existing);
//     }

//     const avgFirstCallTime = formatAverageTime(
//       Array.from(visitDayMap.values()).map((item) => item.firstCallTime),
//     );

//     const avgFirstPcTime = formatAverageTime(
//       Array.from(salesDayMap.values()).map((item) => item.firstPcTime),
//     );

//     const avgRetailingTime = formatAverageDuration(
//       Array.from(activityDayMap.values()).map((item) => item.retailingDurationMs),
//     );

//     const avgTotalTime = formatAverageDuration(
//       Array.from(activityDayMap.values()).map((item) => item.totalDurationMs),
//     );

//     const dayWiseSummary: SalesmanDayWiseSummaryItem[] = [];
//     const dayCursor = new Date(startDate);

//     while (dayCursor <= endDate) {
//       const dayKey = formatCalendarDate(dayCursor);

//       const activity = activityDayMap.get(dayKey) || {};
//       const visits = visitDayMap.get(dayKey) || {};
//       const daySales = salesDayMap.get(dayKey) || {};
//       const leave = leaveDayMap.get(dayKey) || {};
//       const workSession = workSessionDayMap.get(dayKey) || {};

//       const retailing = Number(activity.retailing || 0);
//       const officialWork = Number(activity.officialWork || 0);
//       const leaveCount = Number(leave.leave || 0);
//       const totalActivities = Number(activity.totalActivities || 0);
//       const tcCount = Number(visits.tc || 0);
//       const pcCount = Number(daySales.pc || 0);
//       const dayStarted = Number(workSession.dayStarted || 0) > 0;

//       const hasWorkRecord = dayStarted || totalActivities > 0 || tcCount > 0 || pcCount > 0;

//       const absent = leaveCount > 0 || hasWorkRecord ? 0 : 1;

//       const dayStatus =
//         leaveCount > 0
//           ? 'Leave'
//           : retailing > 0 || tcCount > 0 || pcCount > 0
//             ? 'Retailing'
//             : officialWork > 0
//               ? 'Official Work'
//               : dayStarted
//                 ? 'Official Work'
//                 : 'Absent';

//       dayWiseSummary.push({
//         date: dayKey,
//         label: formatDayLabel(dayCursor),
//         dayStatus,
//         retailing,
//         officialWork,
//         leave: leaveCount,
//         absent,
//         totalActivities,
//         retailingDuration: formatDurationMinutes(
//           Math.max(Math.round(Number(activity.retailingDurationMs || 0) / 60000), 0),
//         ),
//         totalDuration: formatDurationMinutes(
//           Math.max(Math.round(Number(activity.totalDurationMs || 0) / 60000), 0),
//         ),
//         tc: tcCount,
//         pc: pcCount,
//         upc: daySales.upc?.size || 0,
//         netValue: Number((daySales.netValue || 0).toFixed(2)),
//         cases: Number((daySales.cases || 0).toFixed(2)),
//         firstCallTime: formatTime(visits.firstCallTime),
//         firstPcTime: formatTime(daySales.firstPcTime),
//       });

//       dayCursor.setDate(dayCursor.getDate() + 1);
//     }

//     return {
//       success: true,
//       statusCode: 200,
//       message: 'Salesman pocket and target fetched successfully',
//       data: {
//         startDate: startDate.toISOString(),
//         endDate: endDate.toISOString(),
//         retailingDays: retailingDayCount,
//         avgRetailingTime,
//         avgTotalTime,

//         target: {
//           metric: normalizedMetric,

//           selected: {
//             target: Number(selectedTarget.toFixed(selectedDecimalPlaces)),
//             achieved: Number(selectedAchieved.toFixed(selectedDecimalPlaces)),
//             remaining: Number(selectedRemaining.toFixed(selectedDecimalPlaces)),
//             achievementPercentage: selectedAchievementPercentage,
//             mtd: selectedAchievementPercentage,
//             lmtd: lmtdAchievementPercentage,
//             improvement,

//             crr:
//               elapsedDays > 0
//                 ? Number((selectedAchieved / elapsedDays).toFixed(selectedDecimalPlaces))
//                 : 0,

//             rrr:
//               remainingDays > 0
//                 ? Number((selectedRemaining / remainingDays).toFixed(selectedDecimalPlaces))
//                 : 0,
//           },

//           targetCases: Number(targetCases.toFixed(2)),
//           achievedCases: Number(achievedCases.toFixed(2)),
//           remainingCases: Number(remainingCases.toFixed(2)),

//           targetTonnage: Number(targetTonnage.toFixed(3)),
//           achievedTonnage: Number(achievedTonnage.toFixed(3)),
//           remainingTonnage: Number(remainingTonnage.toFixed(3)),

//           targetValue: Number(targetValue.toFixed(2)),
//           achievedValue: Number(achievedValue.toFixed(2)),
//           remainingValue: Number(remainingValue.toFixed(2)),

//           achievementPercentage,

//           crr: elapsedDays > 0 ? Number((achievedCases / elapsedDays).toFixed(2)) : 0,

//           rrr: remainingDays > 0 ? Number((remainingCases / remainingDays).toFixed(2)) : 0,
//         },

//         pocket: {
//           tc,
//           avgTc: retailingDayCount > 0 ? Number((tc / retailingDayCount).toFixed(2)) : 0,
//           pc,
//           avgPc: retailingDayCount > 0 ? Number((pc / retailingDayCount).toFixed(2)) : 0,
//           upc,
//           utc,
//           totalLinesSold,
//           lpc: pc > 0 ? Number((totalLinesSold / pc).toFixed(2)) : 0,
//           avgFirstCallTime,
//           avgFirstPcTime,
//         },

//         vanUtilization: {
//           openingStockCases: Number(openingStockCases.toFixed(2)),
//           topupStockCases: Number(topupStockCases.toFixed(2)),
//           totalStockCases: Number(totalStockCases.toFixed(2)),
//           salesCases: Number(stockSalesCases.toFixed(2)),
//           utilizationPercentage,
//         },

//         dayWiseSummary,
//       },
//       offline: true,
//     } as ApiResponse<SalesmanPocketTargetResponse>;
//   },
//   getSalesmanDayWiseSummary: async (params) => {
//     const user = useAuthStore.getState().user;

//     /**
//      * ONLINE MODE
//      */
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<SalesmanDayWiseSummaryItem[]>(`/employee/salesman/day-wise-summary`, {
//         params,
//       }) as Promise<ApiResponse<SalesmanDayWiseSummaryItem[]>>;
//     }

//     /**
//      * OFFLINE MODE
//      * Separate calculation, not dependent on getSalesmanPocketAndTarget.
//      */
//     const ownerId = user?.userId ?? '';

//     const parseDate = (value?: string) => {
//       const parsed = value ? new Date(value) : new Date();

//       return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
//     };

//     const now = params?.endDate
//       ? parseDate(params.endDate)
//       : params?.date
//         ? parseDate(params.date)
//         : new Date();

//     const hasDateRange = Boolean(params?.startDate || params?.endDate);

//     const startDate = params?.startDate
//       ? parseDate(params.startDate)
//       : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

//     startDate.setHours(0, 0, 0, 0);

//     const endDate = hasDateRange ? parseDate(params?.endDate || params?.startDate) : now;

//     endDate.setHours(23, 59, 59, 999);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     if (endDate > todayEnd) {
//       endDate.setTime(todayEnd.getTime());
//     }

//     const openActivityEnd = endDate.getTime() > Date.now() ? new Date() : endDate;

//     const isBetween = (value: unknown, from: Date, to: Date) => {
//       if (!value) return false;

//       const parsed = new Date(String(value));

//       return !Number.isNaN(parsed.getTime()) && parsed >= from && parsed <= to;
//     };

//     const formatCalendarDate = (value: Date) => {
//       const year = value.getFullYear();
//       const month = String(value.getMonth() + 1).padStart(2, '0');
//       const day = String(value.getDate()).padStart(2, '0');

//       return `${year}-${month}-${day}`;
//     };

//     const formatDayLabel = (value: Date) =>
//       value.toLocaleDateString('en-IN', {
//         weekday: 'short',
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       });

//     const formatTime = (value?: Date | string | null) => {
//       if (!value) return null;

//       const parsedDate = new Date(value);

//       if (Number.isNaN(parsedDate.getTime())) return null;

//       return parsedDate.toLocaleTimeString('en-IN', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//       });
//     };

//     const formatDurationMinutes = (value: number) => {
//       if (!Number.isFinite(value) || value < 1) return '< 1 min';

//       const hours = Math.floor(value / 60);
//       const minutes = value % 60;

//       if (!hours) return `${minutes} min${minutes === 1 ? '' : 's'}`;
//       if (!minutes) return `${hours} hr${hours === 1 ? '' : 's'}`;

//       return `${hours} hr${hours === 1 ? '' : 's'} ${minutes} min${minutes === 1 ? '' : 's'}`;
//     };

//     const [orderRecords, visitRecords, activityRecords, leaveRecords, workSessionRecords] =
//       await Promise.all([
//         repositories.orders.findAll(ownerId, { limit: 5000 }),
//         repositories.visits.findAll(ownerId, { limit: 5000 }),
//         repositories.activities.findAll(ownerId, { limit: 5000 }),
//         repositories.leaves.findAll(ownerId, { limit: 5000 }),
//         repositories.attendance.findAll(ownerId, { limit: 5000 }),
//       ]);

//     const sales = orderRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(item.date || item.createdAt, startDate, endDate),
//     );

//     const visits = visitRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(item.checkInTime || item.createdAt, startDate, endDate),
//     );

//     const activities = activityRecords.filter(
//       (item: any) =>
//         ['ACTIVE', 'COMPLETED'].includes(String(item.status ?? '').toUpperCase()) &&
//         isBetween(item.startTime || item.createdAt, startDate, endDate),
//     );

//     const leaves = leaveRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(item.createdAt, startDate, endDate),
//     );

//     const workSessions = workSessionRecords.filter((item: any) =>
//       isBetween(item.dayStartTime || item.createdAt, startDate, endDate),
//     );

//     const activityDayMap = new Map<string, any>();
//     const visitDayMap = new Map<string, any>();
//     const salesDayMap = new Map<string, any>();
//     const leaveDayMap = new Map<string, any>();
//     const workSessionDayMap = new Map<string, any>();

//     for (const item of activities) {
//       const start = new Date(item.startTime || item.createdAt);
//       const dayKey = formatCalendarDate(start);

//       const existing = activityDayMap.get(dayKey) || {
//         retailing: 0,
//         officialWork: 0,
//         totalActivities: 0,
//         retailingDurationMs: 0,
//         totalDurationMs: 0,
//       };

//       const isRetailing = item.name === 'Retailing';
//       const end = item.endTime ? new Date(item.endTime) : openActivityEnd;
//       const durationMs = Math.max(end.getTime() - start.getTime(), 0);

//       existing.totalActivities += 1;
//       existing.totalDurationMs += durationMs;

//       if (isRetailing) {
//         existing.retailing += 1;
//         existing.retailingDurationMs += durationMs;
//       } else {
//         existing.officialWork += 1;
//       }

//       activityDayMap.set(dayKey, existing);
//     }

//     for (const item of visits) {
//       const checkInTime = new Date(item.checkInTime || item.createdAt);
//       const dayKey = formatCalendarDate(checkInTime);

//       const existing = visitDayMap.get(dayKey) || {
//         tc: 0,
//         firstCallTime: null,
//       };

//       existing.tc += 1;

//       if (!existing.firstCallTime || checkInTime < new Date(existing.firstCallTime)) {
//         existing.firstCallTime = checkInTime;
//       }

//       visitDayMap.set(dayKey, existing);
//     }

//     for (const item of sales) {
//       const saleDate = new Date(item.date || item.createdAt);
//       const dayKey = formatCalendarDate(saleDate);

//       const existing = salesDayMap.get(dayKey) || {
//         pc: 0,
//         upc: new Set<string>(),
//         cases: 0,
//         netValue: 0,
//         firstPcTime: null,
//       };

//       existing.pc += 1;

//       if (item.customerId) {
//         existing.upc.add(item.customerId);
//       }

//       existing.cases += Number(item.netCases || item.totalCases || 0);
//       existing.netValue += Number(item.totalValue || 0);

//       if (!existing.firstPcTime || saleDate < new Date(existing.firstPcTime)) {
//         existing.firstPcTime = saleDate;
//       }

//       salesDayMap.set(dayKey, existing);
//     }

//     for (const item of leaves) {
//       const leaveDate = new Date(item.createdAt);
//       const dayKey = formatCalendarDate(leaveDate);

//       const existing = leaveDayMap.get(dayKey) || {
//         leave: 0,
//       };

//       existing.leave += 1;

//       leaveDayMap.set(dayKey, existing);
//     }

//     for (const item of workSessions) {
//       const dayStartTime = new Date(item.dayStartTime || item.createdAt);
//       const dayKey = formatCalendarDate(dayStartTime);

//       const existing = workSessionDayMap.get(dayKey) || {
//         dayStarted: 0,
//         dayCompleted: 0,
//         latestStatus: null,
//       };

//       existing.dayStarted += 1;

//       if (String(item.status ?? '').toUpperCase() === 'COMPLETED') {
//         existing.dayCompleted += 1;
//       }

//       existing.latestStatus = item.status ?? null;

//       workSessionDayMap.set(dayKey, existing);
//     }

//     const data: SalesmanDayWiseSummaryItem[] = [];
//     const dayCursor = new Date(startDate);

//     while (dayCursor <= endDate) {
//       const dayKey = formatCalendarDate(dayCursor);

//       const activity = activityDayMap.get(dayKey) || {};
//       const visitsForDay = visitDayMap.get(dayKey) || {};
//       const daySales = salesDayMap.get(dayKey) || {};
//       const leave = leaveDayMap.get(dayKey) || {};
//       const workSession = workSessionDayMap.get(dayKey) || {};

//       const retailing = Number(activity.retailing || 0);
//       const officialWork = Number(activity.officialWork || 0);
//       const leaveCount = Number(leave.leave || 0);
//       const totalActivities = Number(activity.totalActivities || 0);
//       const tcCount = Number(visitsForDay.tc || 0);
//       const pcCount = Number(daySales.pc || 0);
//       const dayStarted = Number(workSession.dayStarted || 0) > 0;

//       const hasWorkRecord = dayStarted || totalActivities > 0 || tcCount > 0 || pcCount > 0;

//       const absent = leaveCount > 0 || hasWorkRecord ? 0 : 1;

//       const dayStatus =
//         leaveCount > 0
//           ? 'Leave'
//           : retailing > 0 || tcCount > 0 || pcCount > 0
//             ? 'Retailing'
//             : officialWork > 0
//               ? 'Official Work'
//               : dayStarted
//                 ? 'Official Work'
//                 : 'Absent';

//       data.push({
//         date: dayKey,
//         label: formatDayLabel(dayCursor),
//         dayStatus,
//         retailing,
//         officialWork,
//         leave: leaveCount,
//         absent,
//         totalActivities,
//         retailingDuration: formatDurationMinutes(
//           Math.max(Math.round(Number(activity.retailingDurationMs || 0) / 60000), 0),
//         ),
//         totalDuration: formatDurationMinutes(
//           Math.max(Math.round(Number(activity.totalDurationMs || 0) / 60000), 0),
//         ),
//         tc: tcCount,
//         pc: pcCount,
//         upc: daySales.upc?.size || 0,
//         netValue: Number((daySales.netValue || 0).toFixed(2)),
//         cases: Number((daySales.cases || 0).toFixed(2)),
//         firstCallTime: formatTime(visitsForDay.firstCallTime),
//         firstPcTime: formatTime(daySales.firstPcTime),
//       });

//       dayCursor.setDate(dayCursor.getDate() + 1);
//     }

//     return {
//       success: true,
//       statusCode: 200,
//       message: 'Salesman day wise summary fetched successfully',
//       data,
//       offline: true,
//     } as ApiResponse<SalesmanDayWiseSummaryItem[]>;
//   },
//   getSalesmanProductSales: async (params) => {
//     const user = useAuthStore.getState().user;

//     /**
//      * ONLINE MODE
//      */
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<SalesmanProductSalesResponse>(`/employee/salesman/product-sales`, {
//         params,
//       }) as Promise<ApiResponse<SalesmanProductSalesResponse>>;
//     }

//     /**
//      * OFFLINE MODE
//      */
//     const ownerId = user?.userId ?? '';

//     const parseDate = (value?: string) => {
//       const parsed = value ? new Date(value) : new Date();
//       return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
//     };

//     const now = params?.endDate
//       ? parseDate(params.endDate)
//       : params?.date
//         ? parseDate(params.date)
//         : new Date();

//     const hasDateRange = Boolean(params?.startDate || params?.endDate);

//     const startDate = params?.startDate
//       ? parseDate(params.startDate)
//       : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

//     startDate.setHours(0, 0, 0, 0);

//     const endDate = hasDateRange ? parseDate(params?.endDate || params?.startDate) : now;

//     endDate.setHours(23, 59, 59, 999);

//     const normalizedGroupBy: SalesmanProductSalesGroupBy = [
//       'PRIMARYCATEGORY',
//       'SECONDARYCATEGORY',
//       'SKU',
//     ].includes(params?.groupBy || 'PRIMARYCATEGORY')
//       ? (params?.groupBy as SalesmanProductSalesGroupBy)
//       : 'PRIMARYCATEGORY';

//     const isBetween = (value: unknown, from: Date, to: Date) => {
//       if (!value) return false;

//       const parsed = new Date(String(value));

//       return !Number.isNaN(parsed.getTime()) && parsed >= from && parsed <= to;
//     };

//     const getSaleDate = (item: any) => item.date || item.orderDate || item.createdAt;

//     const getCases = (item: any) => {
//       if (item.netCases !== undefined && item.netCases !== null) {
//         return Number(item.netCases || 0);
//       }

//       const caseQty = Number(item.caseQty || 0);
//       const pieceQty = Number(item.pieceQty || 0);
//       const unitQtyInCase = Number(item.unitQtyInCase || 0);

//       return caseQty + (unitQtyInCase > 0 ? pieceQty / unitQtyInCase : 0);
//     };

//     const [orderRecords, saleItemRecords, visitRecords, productRecords, categoryRecords] =
//       await Promise.all([
//         repositories.orders.findAll(ownerId, { limit: 5000 }),
//         repositories.orderItems?.findAll
//           ? repositories.orderItems.findAll(ownerId, { limit: 10000 })
//           : Promise.resolve([]),
//         repositories.visits.findAll(ownerId, { limit: 5000 }),
//         repositories.products?.findAll
//           ? repositories.products.findAll(ownerId, { limit: 5000 })
//           : Promise.resolve([]),
//         repositories.categories?.findAll
//           ? repositories.categories.findAll(ownerId, { limit: 5000 })
//           : Promise.resolve([]),
//       ]);

//     console.log(categoryRecords);

//     const sales = orderRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(getSaleDate(item), startDate, endDate),
//     );

//     const saleIds = new Set(
//       sales
//         .map((item: any) => item.saleId || item.orderId || item.uuid)
//         .filter(Boolean)
//         .map(String),
//     );

//     const tc = visitRecords.filter(
//       (item: any) =>
//         String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
//         isBetween(item.checkInTime || item.createdAt, startDate, endDate),
//     ).length;

//     const items = saleItemRecords.filter((item: any) =>
//       saleIds.has(String(item.saleId || item.orderId || '')),
//     );

//     const productMap = new Map<string, any>(
//       productRecords
//         .map((item: any): [string, any] => [
//           String(item.productId || item.uuid || item.id || ''),
//           item,
//         ])
//         .filter(([id]) => Boolean(id)),
//     );

//     const categoryMap = new Map<string, any>(
//       categoryRecords
//         .map((item: any): [string, any] => [
//           String(item.categoryId || item.uuid || item.id || ''),
//           item,
//         ])
//         .filter(([id]) => Boolean(id)),
//     );

//     const itemTotals = items.reduce(
//       (acc: any, item: any) => {
//         acc.totalValue += Number(item.totalValue || 0);
//         acc.totalPieces += Number(item.quantity || 0);
//         acc.totalCases += getCases(item);

//         if (item.productId) {
//           acc.skuIds.add(String(item.productId));
//         }

//         acc.lineCount += 1;

//         return acc;
//       },
//       {
//         totalValue: 0,
//         totalPieces: 0,
//         totalCases: 0,
//         skuIds: new Set<string>(),
//         lineCount: 0,
//       },
//     );

//     const salesTotalValue = sales.reduce(
//       (sum: number, item: any) => sum + Number(item.totalValue || 0),
//       0,
//     );

//     const salesTotalCases = sales.reduce(
//       (sum: number, item: any) => sum + Number(item.netCases || item.totalCases || 0),
//       0,
//     );

//     const totalValue = Number(itemTotals.totalValue || salesTotalValue || 0);
//     const totalCases = Number(itemTotals.totalCases || salesTotalCases || 0);
//     const pc = sales.length;

//     const groupMap = new Map<
//       string,
//       {
//         id: string;
//         name: string;
//         value: number;
//         pcs: number;
//         cases: number;
//       }
//     >();

//     for (const item of items) {
//       const product = productMap.get(String(item.productId || '')) || {};

//       const productId = item.productId || product.productId || 'UNKNOWN';
//       const productName = item.productName || product.name || 'Unknown';

//       const categoryId = item.categoryId || product.categoryId || 'UNKNOWN';
//       const parentCategoryId = item.parentCategoryId || product.parentCategoryId || 'UNKNOWN';

//       const secondaryCategory = categoryMap.get(String(categoryId)) || {};
//       const primaryCategory = categoryMap.get(String(parentCategoryId)) || {};

//       let groupId = 'UNKNOWN';
//       let groupName = 'Unknown';

//       if (normalizedGroupBy === 'SKU') {
//         groupId = String(productId || 'UNKNOWN');
//         groupName = String(productName || 'Unknown');
//       } else if (normalizedGroupBy === 'SECONDARYCATEGORY') {
//         groupId = String(categoryId || 'UNKNOWN');
//         groupName = String(
//           secondaryCategory.name || item.categoryName || product.categoryName || 'Unknown',
//         );
//       } else {
//         console.log(primaryCategory, item, product);
//         groupId = String(parentCategoryId || 'UNKNOWN');
//         groupName = String(
//           primaryCategory.name ||
//             item.parentCategoryName ||
//             product.parentCategoryName ||
//             'Unknown',
//         );
//       }

//       const existing = groupMap.get(groupId) || {
//         id: groupId,
//         name: groupName,
//         value: 0,
//         pcs: 0,
//         cases: 0,
//       };

//       existing.value += Number(item.totalValue || 0);
//       existing.pcs += Number(item.quantity || 0);
//       existing.cases += getCases(item);

//       groupMap.set(groupId, existing);
//     }

//     const categories = Array.from(groupMap.values())
//       .sort((a, b) => b.value - a.value)
//       .map((item) => ({
//         id: item.id || 'UNKNOWN',
//         name: item.name || 'Unknown',
//         value: Number((item.value || 0).toFixed(2)),
//         pcs: Number((item.pcs || 0).toFixed(2)),
//         cases: Number((item.cases || 0).toFixed(2)),
//         growth:
//           totalValue > 0 ? Number(((Number(item.value || 0) / totalValue) * 100).toFixed(2)) : 0,
//       }));

//     return {
//       success: true,
//       statusCode: 200,
//       message: 'Salesman product sales fetched successfully',
//       data: {
//         overview: {
//           sc: itemTotals.skuIds.size,
//           tc: Number(tc || 0),
//           pc,
//           netValue: Number(totalValue.toFixed(2)),
//           cases: Number(totalCases.toFixed(2)),
//           lpc: pc > 0 ? Number((Number(itemTotals.lineCount || 0) / pc).toFixed(2)) : 0,
//         },
//         categories,
//       },
//       offline: true,
//     } as ApiResponse<SalesmanProductSalesResponse>;
//   },
//   shareSalesmanReport: (type, params) =>
//     api.post<SalesmanReportShareResponse, typeof params>(
//       `/employee/salesman/share-${type.toLowerCase()}`,
//       params,
//     ) as Promise<ApiResponse<SalesmanReportShareResponse>>,
//   shareSalesmanMSR: (params) => homeService.shareSalesmanReport('MSR', params),
//   shareSalesmanMST: (params) => homeService.shareSalesmanReport('MST', params),
//   shareSalesmanDSR: (params) => homeService.shareSalesmanReport('DSR', params),
//   getSalesmanDispatchOrders: async (params) => {
//     const user = useAuthStore.getState().user;

//     /**
//      * ONLINE MODE
//      */
//     if (!isSalesman(user) || !isOfflineMode()) {
//       return api.get<SalesmanDispatchStatusItem[]>(`/employee/salesman/dispatch-order`, {
//         params,
//       }) as Promise<ApiResponse<SalesmanDispatchStatusItem[]>>;
//     }

//     /**
//      * OFFLINE MODE
//      *
//      * Same logic as backend:
//      * - default current month
//      * - filter completed sales/orders
//      * - sort by date desc
//      * - map as dispatch order with Pending Dispatch
//      */
//     const ownerId = user?.userId ?? '';

//     const parseDate = (value?: string) => {
//       const parsed = value ? new Date(value) : new Date();

//       return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
//     };

//     const now = params?.endDate
//       ? parseDate(params.endDate)
//       : params?.date
//         ? parseDate(params.date)
//         : new Date();

//     const hasDateRange = Boolean(params?.startDate || params?.endDate);

//     const startDate = params?.startDate
//       ? parseDate(params.startDate)
//       : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

//     startDate.setHours(0, 0, 0, 0);

//     const endDate = hasDateRange ? parseDate(params?.endDate || params?.startDate) : now;

//     endDate.setHours(23, 59, 59, 999);

//     const isBetween = (value: unknown) => {
//       if (!value) return false;

//       const parsed = new Date(String(value));

//       return !Number.isNaN(parsed.getTime()) && parsed >= startDate && parsed <= endDate;
//     };

//     const orders = await repositories.orders.findAll(ownerId, {
//       limit: 5000,
//     });

//     const data: SalesmanDispatchStatusItem[] = orders
//       .filter(
//         (order: any) =>
//           String(order.status ?? '').toUpperCase() === 'COMPLETED' &&
//           isBetween(order.date || order.createdAt),
//       )
//       .sort((a: any, b: any) => {
//         const dateA = new Date(a.date || a.createdAt || 0).getTime();
//         const dateB = new Date(b.date || b.createdAt || 0).getTime();

//         return dateB - dateA;
//       })
//       .map((order: any): SalesmanDispatchStatusItem => {
//         const saleId = String(order.saleId || order.orderId || order.uuid || '');

//         return {
//           orderId: saleId,
//           orderNo: saleId,
//           outletName: String(order.customerName || order.outletName || ''),
//           outlet: String(order.customerName || order.outletName || ''),
//           invoiceNo: saleId,
//           status: 'Pending Dispatch',
//           orderDate: order.date ? String(order.date) : String(order.createdAt || ''),
//           dispatchDate: undefined,
//           vehicleNo: order.vanName ? String(order.vanName) : undefined,
//           cases: Number(order.netCases || order.totalCases || 0),
//           pieces: Number(order.totalPieces || order.totalQty || 0),
//           netValue: Number(order.totalValue || 0),
//         };
//       });

//     return {
//       success: true,
//       statusCode: 200,
//       message: 'Salesman dispatch orders fetched successfully',
//       data,
//       offline: true,
//     } satisfies ApiResponse<SalesmanDispatchStatusItem[]>;
//   },
//   getSalesmanDispatchStatus: (params) => homeService.getSalesmanDispatchOrders(params),
//   getManagerStats: (params) => {
//     const queryParams = typeof params === 'string' ? { date: params } : params;

//     return api.get<ManagerStatsResponse>(`/employee/manager/stats`, {
//       params: queryParams,
//     }) as Promise<ApiResponse<ManagerStatsResponse>>;
//   },
//   getManagerTarget: (date?: string) =>
//     api.get<ManagerTargetResponse>(`/employee/manager/target`, {
//       params: date ? { date } : undefined,
//     }) as Promise<ApiResponse<ManagerTargetResponse>>,
//   getUserWiseTargetSummary: (date?: string) =>
//     api.get<UserWiseTargetSummary[]>(`/employee/manager/user-wise-target`, {
//       params: date ? { date } : undefined,
//     }) as Promise<ApiResponse<UserWiseTargetSummary[]>>,
//   getUboTargetSummary: (date?: string) =>
//     api.get<UserWiseTargetSummary[]>(`/employee/manager/ubo-target`, {
//       params: date ? { date } : undefined,
//     }) as Promise<ApiResponse<UserWiseTargetSummary[]>>,
//   getFocusedPackTargetSummary: (date?: string) =>
//     api.get<UserWiseTargetSummary[]>(`/employee/manager/focused-pack-target`, {
//       params: date ? { date } : undefined,
//     }) as Promise<ApiResponse<UserWiseTargetSummary[]>>,
//   getUserPrimaryCategoryTargets: (params) =>
//     api.get<UserPrimaryCategoryTargetSummary[]>(`/employee/manager/user-primary-category-target`, {
//       params,
//     }) as Promise<ApiResponse<UserPrimaryCategoryTargetSummary[]>>,
//   getUserUboTargets: (params) =>
//     api.get<UserUboTargetBreakdown[]>(`/employee/manager/user-ubo-target`, {
//       params,
//     }) as Promise<ApiResponse<UserUboTargetBreakdown[]>>,
//   getUserFocusedPackTargets: (params) =>
//     api.get<UserFocusedPackTargetBreakdown[]>(`/employee/manager/user-focused-pack-target`, {
//       params,
//     }) as Promise<ApiResponse<UserFocusedPackTargetBreakdown[]>>,
//   getManagerOrderSummary: (params) =>
//     api.get<ManagerOrderSummaryResponse>(`/employee/manager/order-summary`, { params }) as Promise<
//       ApiResponse<ManagerOrderSummaryResponse>
//     >,
//   getManagerTeamCoverage: () =>
//     api.get<ManagerTeamCoverageResponse>(`/employee/manager/team-coverage`, {}) as Promise<
//       ApiResponse<ManagerTeamCoverageResponse>
//     >,
//   getManagerBeatOMeter: () =>
//     api.get<ManagerBeatOMeterResponse>(`/employee/manager/get-beat-o-meter`, {}) as Promise<
//       ApiResponse<ManagerBeatOMeterResponse>
//     >,
//   getManagerFieldUsers: (params) =>
//     api.get<ManagerFieldUserSummary[]>(`/employee/manager/field-user`, {
//       params: {
//         ...(params?.date ? { date: params.date } : {}),
//         ...(params?.searchKey ? { searchKey: params.searchKey } : {}),
//         ...(params?.searchKey ? { searchText: params.searchKey } : {}),
//         ...(params?.searchText ? { searchText: params.searchText } : {}),
//       },
//     }) as Promise<ApiResponse<ManagerFieldUserSummary[]>>,
//   getManagerUserTimeline: (params) =>
//     api.get<ManagerUserTimelineResponse>(`/employee/manager/user-timeline`, {
//       params,
//     }) as Promise<ApiResponse<ManagerUserTimelineResponse>>,
//   getManagerUserMtdSummary: (params) =>
//     api.get<ManagerUserMtdSummaryResponse>(`/employee/manager/user-mtd-summary`, {
//       params,
//     }) as Promise<ApiResponse<ManagerUserMtdSummaryResponse>>,
//   getManagerUserRoutePlan: (params) =>
//     api.get<ManagerUserRoutePlanResponse>(`/employee/manager/user-route-plan`, {
//       params,
//     }) as Promise<ApiResponse<ManagerUserRoutePlanResponse>>,
// };



import { api } from '@/core/network';
import { uploadFormData } from '@/core/network/upload';
import type { ApiRequestConfig, ApiResponse } from '@/core/network/api.types';
import { CreateActivityPayload, DayStartPayload } from '../types/home.types';
import { Platform } from 'react-native';
import {
  captureCurrentLocation,
  stopSalesmanBackgroundLocation,
  type CapturedLocation,
} from '@/shared/services/location.service';
import { isSalesman } from '@/core/navigation/role.utils';
import { useAuthStore } from '@/core/store/auth.store';
import { isOfflineMode, useOfflineStore } from '@/core/offline/offline.store';
import { repositories } from '@/repositories';
import { syncService } from '@/sync/sync.service';
import { createSchemaId } from '@/utils/uuid';
import { useLoaderStore } from '@/core/loader/loader.store';

/**
 * Auth API contract used by the app.
 * Keeps login/logout strongly-typed and easy to mock in tests.
 */
export interface ManagerStatsResponse {
  userSummary: {
    retailing: number;
    officeWork: number;
    leave: number;
    absent: number;
    total: number;
  };
  callSummary: {
    productivity: number;
    covered: number;
    pc: number;
    tc: number;
    sc: number;
    qtyCases: number;
    qtyTonnage?: number;
    qtyValue?: number;
  };
}

export interface ManagerTargetData {
  startDate: string;
  endDate: string;
  targetCases: number;
  achievedCases: number;
  remainingCases: number;
  targetTonnage: number;
  achievedTonnage: number;
  targetValue: number;
  achievedValue: number;
  achievementPercentage: number;
  display: {
    percentage: string;
    achievedCases: string;
    remainingMessage: string;
  };
}

export type ManagerTargetResponse = {
  startDate?: string;
  endDate?: string;

  targetCases?: number;
  achievedCases?: number;
  remainingCases?: number;

  targetTonnage?: number;
  achievedTonnage?: number;
  remainingTonnage?: number;

  targetValue?: number;
  achievedValue?: number;
  remainingValue?: number;

  achievementPercentage?: number;
  tonnageAchievementPercentage?: number;
  valueAchievementPercentage?: number;

  uboTarget?: number;
  uboAchievement?: number;
  uboRemaining?: number;
  uboAchievementPercentage?: number;

  display?: {
    percentage?: string;
    achievedCases?: string;
    remainingMessage?: string;

    uboPercentage?: string;
    uboAchievement?: string;
    uboRemainingMessage?: string;
  };
};

export interface UserWiseTargetSummary {
  employeeId: string;
  employeeName: string;
  designation?: string;
  targetCases: number;
  achievementCases: number;
  remainingCases: number;
  targetTonnage?: number;
  achievementTonnage?: number;
  remainingTonnage?: number;
  targetValue?: number;
  achievementValue?: number;
  remainingValue?: number;
  achievementPercentage: number;
  rrr: number;
  crr: number;
  hasTarget: boolean;
}

export interface UserPrimaryCategoryTargetSummary {
  categoryId: string;
  category: string;
  targetCases: number;
  achievementCases: number;
  remainingCases: number;
  targetTonnage: number;
  achievementTonnage: number;
  remainingTonnage: number;
  targetValue: number;
  achievementValue: number;
  remainingValue: number;
  achievementPercentage: number;
}

export interface UserUboTargetBreakdown {
  categoryId: string;
  category: string;
  target: number;
  achievement: number;
}

export interface UserFocusedPackTargetBreakdown {
  productId: string;
  productName: string;
  targetCases: number;
  achievementCases: number;
  targetTonnage: number;
  achievementTonnage: number;
  targetValue: number;
  achievementValue: number;
}

export interface ManagerOrderSummaryResponse {
  primaryCategoryWiseOrder: {
    totalCases: number;
    totalTonnage?: number;
    totalValue?: number;
    categories: {
      categoryId: string;
      category: string;
      cases: number;
      tonnage?: number;
      value?: number;
      percentage: number;
      tonnagePercentage?: number;
      valuePercentage?: number;
    }[];
  };
  managerOrderSummary: {
    orders: number;
    validation: number;
    orderCases?: number;
    orderTonnage?: number;
    orderValue?: number;
    validationCases?: number;
    validationTonnage?: number;
    validationValue?: number;
  };
  outletSummary: {
    utc?: {
      count: number;
      percentage: number;
    };
    upc: {
      count: number;
      percentage: number;
    };
    zeroOrder: {
      count: number;
      percentage: number;
    };
    notVisited: {
      count: number;
      percentage: number;
    };
    total: {
      count: number;
      percentage: number;
    };
    productivity: {
      pc: number;
      tc: number;
      percentage: number;
    };
    ordered?: {
      count: number;
      percentage: number;
    };
  };
}

export interface ManagerTeamCoverageResponse {
  users: number;
  vans: number;
  warehouse: number;
  routes: number;
  outlets: number;
  outletsPlanned: number;
  upc: number;
  uic: number;
  userList?: Array<{
    employeeId?: string;
    name?: string;
    mobile?: string;
    designationId?: string;
  }>;
  vanList?: Array<{
    vanId?: string;
    name?: string;
    vanNumber?: string;
    driverName?: string;
    capacity?: number;
    warehouseId?: string;
    associatedUsers?: string[];
    routeCount?: number;
  }>;
  outletList?: Array<{
    customerId?: string;
    name?: string;
    ownerName?: string;
    phoneNumber?: string;
    marketId?: string;
    segmentation?: string;
  }>;
  plannedOutletList?: Array<{
    customerId?: string;
    name?: string;
    ownerName?: string;
    phoneNumber?: string;
    marketId?: string;
    segmentation?: string;
  }>;
}

export interface ManagerBeatOMeterResponse {
  employeeId?: string;
  employeeName?: string;
  designation?: string;
  totalOutlets?: number;
  summary?: {
    visitedOutlets?: number;
    orderedOutlets?: number;
    visitedPercentage?: number;
    orderedPercentage?: number;
  };
  outletTypes?: {
    type?: string;
    color?: string;
    total?: number;
    mtdVisited?: {
      count?: number;
      percentage?: number;
    };
    mtdOrder?: {
      count?: number;
      percentage?: number;
    };
  }[];
}

export interface ManagerFieldUserSummary {
  employeeId: string;
  employeeName: string;
  mobile?: string;
  activity?: {
    name?: string;
    color?: string;
  } | null;
  routeName?: string | null;
  location?: string | null;
  summary?: {
    firstCallTime?: string | null;
    firstPcTime?: string | null;
    tc?: number;
    pc?: number;
    lpc?: number;
  } | null;
}

export interface TimelineLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  capturedAt?: string | null;
}

export interface ManagerUserTimelineResponse {
  employeeId: string;
  employeeName: string;
  date: string;
  dayStartTime?: string | null;
  dayEndTime?: string | null;
  dayStartImageUrl?: string | null;
  dayStartImageMediaId?: string | null;
  dayStartLocation?: TimelineLocation | null;
  dayEndLocation?: TimelineLocation | null;
  currentLocation?: TimelineLocation | null;
  activities: {
    id: string;
    source?: string;
    type: string;
    time: string;
    duration: string;
    outlet: string;
    owner: string;
    location?: TimelineLocation | null;
    checkInLocation?: TimelineLocation | null;
    checkOutLocation?: TimelineLocation | null;
    metrics: {
      label: string;
      value: string;
    }[];
    order?: {
      orderNo: string;
      outlet: string;
      quantityCases: string;
      quantitySuperUnit: string;
      totalPieces: string;
      netValue: string;
      categories: {
        id: string;
        name: string;
        meta: string;
        value: string;
        lines: {
          id: string;
          name: string;
          ptr: string;
          qty: string;
          unit: string;
          value: string;
        }[];
      }[];
      schemeDiscount: string;
      cashDiscount: string;
      tax: string;
      payableAmount: string;
    };
  }[];
}

export interface ManagerUserMtdSummaryResponse {
  employeeId: string;
  employeeName: string;
  date: string;
  utc: number;
  upc: number;
  zeroOrder: number;
  notVisited: number;
  total: number;
}

export interface ManagerUserRoutePlanResponse {
  employeeId: string;
  employeeName: string;
  date: string;
  stops: {
    id: string;
    outletId: string;
    name: string;
    time: string;
    status: 'completed' | 'pending' | 'missed';
    type: string;
  }[];
}

export interface SalesmanDayWiseSummaryItem {
  date: string;
  label: string;
  dayStatus?: 'Retailing' | 'Official Work' | 'Leave' | 'Absent';
  retailing: number;
  officialWork: number;
  leave: number;
  absent: number;
  totalActivities: number;
  retailingDuration?: string | null;
  totalDuration?: string | null;
  tc: number;
  pc: number;
  upc: number;
  netValue: number;
  cases: number;
  firstCallTime?: string | null;
  firstPcTime?: string | null;
}

export type SalesmanProductSalesGroupBy = 'PRIMARYCATEGORY' | 'SECONDARYCATEGORY' | 'SKU';

export interface SalesmanProductSalesResponse {
  overview: {
    sc: number;
    tc: number;
    pc: number;
    netValue: number;
    cases: number;
    lpc: number;
  };
  categories: {
    id: string;
    name: string;
    value: number;
    pcs: number;
    cases: number;
    growth: number;
  }[];
}

export interface SalesmanPocketTargetResponse {
  startDate: string;
  endDate: string;
  retailingDays: number;
  avgRetailingTime?: string | null;
  avgTotalTime?: string | null;
  dayWiseSummary?: SalesmanDayWiseSummaryItem[];
  target: {
    metric?: TargetMetric;
    selected?: {
      target: number;
      achieved: number;
      remaining: number;
      achievementPercentage: number;
      mtd: number;
      lmtd: number;
      improvement: number;
      crr: number;
      rrr: number;
    };
    targetCases: number;
    achievedCases: number;
    remainingCases: number;
    targetTonnage: number;
    achievedTonnage: number;
    remainingTonnage: number;
    targetValue: number;
    achievedValue: number;
    remainingValue: number;
    achievementPercentage: number;
    crr: number;
    rrr: number;
  };
  pocket: {
    tc: number;
    avgTc: number;
    pc: number;
    avgPc: number;
    upc: number;
    utc: number;
    totalLinesSold: number;
    lpc: number;
    avgFirstCallTime?: string | null;
    avgFirstPcTime?: string | null;
  };
  vanUtilization?: {
    openingStockCases: number;
    topupStockCases: number;
    totalStockCases: number;
    salesCases: number;
    utilizationPercentage: number;
  };
}

export interface SalesmanReportShareResponse {
  message?: string;
  shareText?: string;
  text?: string;
  url?: string;
  reportUrl?: string;
  fileUrl?: string;
}

export type SalesmanReportType = 'MST' | 'MSR' | 'DSR';

export interface SalesmanDispatchStatusItem {
  orderId?: string;
  orderNo?: string;
  outletName?: string;
  outlet?: string;
  invoiceNo?: string;
  status?: string;
  orderDate?: string;
  dispatchDate?: string;
  vehicleNo?: string;
  cases?: number;
  pieces?: number;
  netValue?: number;
}

export type TargetMetric = 'cases' | 'tonnage' | 'value';

export interface HomeService {
  /** Authenticates user and returns token/user payload from backend */
  dayStart(payload: DayStartPayload, config?: ApiRequestConfig): Promise<ApiResponse<any>>;
  uploadDayStartImage: (
    params: {
      uri: string;
      ownerId: string;
      subOwnerId: string;
    },
    config?: ApiRequestConfig,
  ) => Promise<ApiResponse<{ mediaId: string; url: string }>>;
  getDayStatus(workSessionId: string, config?: ApiRequestConfig): Promise<ApiResponse<any>>;
  getTodayActivities(workSessionId: string): Promise<ApiResponse<any>>;
  createActivity(payload: CreateActivityPayload): Promise<ApiResponse<any>>;
  getRoutes: (vanId: string) => Promise<ApiResponse<any>>;
  getVanMappedRoutes: () => Promise<ApiResponse<any>>;
  getVan: (userId: string) => Promise<ApiResponse<any>>;
  getVans: (params?: { limit?: number; page?: number }) => Promise<ApiResponse<any>>;
  dayComplete(
    carryForwardStock:
      | any
      | {
          carryForwardStock?: any;
          dayEndLocation?: CapturedLocation;
        },
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<any>>;
  cancelVanChangeRequest(vanChangeRequestId: string): Promise<ApiResponse<any>>;
  requestVanChange(
    workSessionId: string,
    payload: {
      requestedVanId: string;
      requestedVanName?: string;
      vanChangeReason?: string;
    },
  ): Promise<ApiResponse<any>>;
  getEmployeeStats(employeeId: string): Promise<ApiResponse<any>>;
  getSalesmanPocketAndTarget: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    metric?: TargetMetric;
  }) => Promise<ApiResponse<SalesmanPocketTargetResponse>>;
  getSalesmanDayWiseSummary: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanDayWiseSummaryItem[]>>;
  getSalesmanProductSales: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: SalesmanProductSalesGroupBy;
  }) => Promise<ApiResponse<SalesmanProductSalesResponse>>;
  shareSalesmanMSR: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
  shareSalesmanMST: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
  shareSalesmanDSR: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanReportShareResponse>>;
  shareSalesmanReport: (
    type: SalesmanReportType,
    params?: {
      date?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => Promise<ApiResponse<SalesmanReportShareResponse>>;
  getSalesmanDispatchOrders: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanDispatchStatusItem[]>>;
  getSalesmanDispatchStatus: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<SalesmanDispatchStatusItem[]>>;
  getManagerStats(
    params?:
      | string
      | {
          date?: string;
          startDate?: string;
          endDate?: string;
        },
  ): Promise<ApiResponse<ManagerStatsResponse>>;
  getManagerTarget: (date?: string) => Promise<ApiResponse<ManagerTargetResponse>>;
  getUserWiseTargetSummary: (date?: string) => Promise<ApiResponse<UserWiseTargetSummary[]>>;
  getUboTargetSummary: (date?: string) => Promise<ApiResponse<UserWiseTargetSummary[]>>;
  getFocusedPackTargetSummary: (date?: string) => Promise<ApiResponse<UserWiseTargetSummary[]>>;
  getUserPrimaryCategoryTargets: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<UserPrimaryCategoryTargetSummary[]>>;
  getUserUboTargets: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<UserUboTargetBreakdown[]>>;
  getUserFocusedPackTargets: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<UserFocusedPackTargetBreakdown[]>>;
  getManagerOrderSummary: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<ApiResponse<ManagerOrderSummaryResponse>>;
  getManagerTeamCoverage: () => Promise<ApiResponse<ManagerTeamCoverageResponse>>;
  getManagerBeatOMeter: () => Promise<ApiResponse<ManagerBeatOMeterResponse>>;
  getManagerFieldUsers: (params?: {
    date?: string;
    searchKey?: string;
    searchText?: string;
  }) => Promise<ApiResponse<ManagerFieldUserSummary[]>>;
  getManagerUserTimeline: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<ManagerUserTimelineResponse>>;
  getManagerUserMtdSummary: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<ManagerUserMtdSummaryResponse>>;
  getManagerUserRoutePlan: (params: {
    employeeId: string;
    date?: string;
  }) => Promise<ApiResponse<ManagerUserRoutePlanResponse>>;
}


const isActiveStatusValue = (value: unknown) =>
  String(value ?? '').toUpperCase() === 'ACTIVE';

const completeActiveRouteSessions = async ({
  ownerId,
  workSessionId,
  endedAt,
}: {
  ownerId: string;
  workSessionId: string;
  endedAt: string;
}) => {
  const records = await repositories.routeSessions.findAll(ownerId, {
    limit: 1000,
  });

  await Promise.all(
    records
      .filter(
        (item: any) =>
          String(item.workSessionId || '') === String(workSessionId) &&
          isActiveStatusValue(item.status) &&
          item.isDeleted !== true &&
          !item.deletedAt,
      )
      .map((item: any) =>
        repositories.routeSessions.update(ownerId, item.uuid || item.routeSessionId, {
          status: 'COMPLETED',
          isActive: false,
          endTime: endedAt,
        }),
      ),
  );
};

const createOfflineRouteSession = async ({
  ownerId,
  user,
  payload,
  workSessionId,
  vanId,
  vanName,
  nowIso,
  completeExisting = true,
}: {
  ownerId: string;
  user: any;
  payload: any;
  workSessionId: string;
  vanId: string;
  vanName?: string;
  nowIso: string;
  completeExisting?: boolean;
}) => {
  if (!payload.routeId) return null;

  if (completeExisting) {
    await completeActiveRouteSessions({
      ownerId,
      workSessionId,
      endedAt: nowIso,
    });
  }

  const routeSessions = await repositories.routeSessions.findAll(ownerId, {
    limit: 1000,
  });

  /**
   * Same as backend:
   * Check route session by workSessionId + routeId before creating.
   * This prevents duplicate route sessions for the same route in same work session.
   */
  const existingRouteSession = routeSessions.find(
    (item: any) =>
      String(item.workSessionId || '') === String(workSessionId) &&
      String(item.routeId || '') === String(payload.routeId) &&
      item.isDeleted !== true &&
      !item.deletedAt,
  );

  const routeSessionPayload = {
    workSessionId,

    userId: user?.userId ?? ownerId,
    userName: user?.name,

    vanId,
    vanName,

    routeId: payload.routeId,
    routeName: payload.routeName || existingRouteSession?.routeName || '',
    customerCategoryId: payload.customerCategoryId || existingRouteSession?.customerCategoryId,

    totalShops: payload.totalShops ?? existingRouteSession?.totalShops ?? 0,

    status: 'ACTIVE',
    isActive: true,
    endTime: null,

    isDeleted: false,
    deletedAt: null,
  } as unknown as Record<string, unknown>;

  if (existingRouteSession) {
    return repositories.routeSessions.update(
      ownerId,
      String(existingRouteSession.uuid || existingRouteSession.routeSessionId),
      routeSessionPayload,
    );
  }

  const routeSessionId = createSchemaId('RouteSession');

  return repositories.routeSessions.create(ownerId, {
    uuid: routeSessionId,
    routeSessionId,

    ...routeSessionPayload,

    visitedShops: 0,

    startTime: nowIso,
    sessionDate: nowIso,
  } as unknown as Record<string, unknown>);
};

/**
 * Thin service layer on top of the shared HTTP client.
 * No UI logic here — only network calls + typing.
 */
export const homeService: HomeService = {
  dayStart: async (payload, config) => {
    const user = useAuthStore.getState().user;

    /**
     * ONLINE MODE
     */
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.post<any, DayStartPayload>('/work-session', payload, config);
    }

    /**
     * OFFLINE MODE
     *
     * Same flow as backend:
     * 1. Check active work session
     * 2. Create work session
     * 3. Create route session when routeId exists
     * 4. Create van daily stock
     *    - First from latest ERP closing stock
     *    - Else from local inventory stock
     * 5. Create activity
     */
    const ownerId = user?.userId ?? '';

    const now = new Date();
    const nowIso = now.toISOString();

    const vanId = payload.vanId || user?.vanId;
    const vanName = payload.vanName || user?.vanName;

    const safeFindAll = async (repoName: string, limit = 10000) => {
      const repo = (repositories as any)?.[repoName];

      if (!repo?.findAll) return [];

      try {
        return await repo.findAll(ownerId, { limit });
      } catch {
        return [];
      }
    };

    const safeCreate = async (repoName: string, record: Record<string, unknown>) => {
      const repo = (repositories as any)?.[repoName];

      if (!repo?.create) return null;

      return repo.create(ownerId, record);
    };

    const safeUpdate = async (repoName: string, uuid: string, changes: Record<string, unknown>) => {
      const repo = (repositories as any)?.[repoName];

      if (!repo?.update) return null;

      return repo.update(ownerId, uuid, changes);
    };

    const toNumber = (value: unknown, fallback = 0) => {
      const numberValue = Number(value);

      return Number.isFinite(numberValue) ? numberValue : fallback;
    };

    const toServerEndOfDay = (date: Date) => {
      const value = new Date(date);

      return new Date(
        Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 23, 59, 59, 999),
      );
    };

    const isSameServerDate = (a: unknown, b: unknown) => {
      if (!a || !b) return false;

      const dateA = new Date(String(a));
      const dateB = new Date(String(b));

      if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) {
        return false;
      }

      return (
        dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
        dateA.getUTCMonth() === dateB.getUTCMonth() &&
        dateA.getUTCDate() === dateB.getUTCDate()
      );
    };

    const isActiveStatus = (value: unknown) => String(value ?? '').toUpperCase() === 'ACTIVE';

    /**
     * ======================================================
     * CHECK EXISTING ACTIVE SESSION
     * Backend:
     * userId + vanId + status ACTIVE
     * ======================================================
     */
    const attendanceRecords = await safeFindAll('attendance', 5000);

    const existingActiveSession = attendanceRecords.find(
      (item: any) =>
        String(item.userId || item.ownerId || ownerId) === String(ownerId) &&
        String(item.vanId || '') === String(vanId || '') &&
        isActiveStatus(item.status) &&
        item.isDeleted !== true,
    );

    if (existingActiveSession) {
      return {
        success: false,
        statusCode: 409,
        message: 'Active work session already exists',
        data: existingActiveSession,
        offline: true,
      } as ApiResponse<any>;
    }

    /**
     * ======================================================
     * CREATE WORK SESSION
     * Backend WorkSessionService.create()
     * ======================================================
     */
    const workSessionId = createSchemaId('WorkSession');

    const dayStartLocation = payload.dayStartLocation || (payload as any).startLocation || null;

    const workSessionPayload: Record<string, unknown> = {
      ...payload,

      uuid: workSessionId,
      workSessionId,

      userId: ownerId,
      userName: user?.name,

      vanId,
      vanName,

      dayStartTime: nowIso,
      startTime: nowIso,

      dayStartImageMediaId: payload.dayStartImageMediaId,
      dayStartImageUrl: payload.dayStartImageUrl,
      dayStartLocation,

      status: 'ACTIVE',
    };

    const record = await repositories.attendance.create(ownerId, workSessionPayload);

    /**
     * ======================================================
     * ROUTE SESSION + VAN DAILY STOCK
     * Backend ActivityService.create()
     * Only when routeId exists.
     * ======================================================
     */
    if (payload.routeId) {
      await createOfflineRouteSession({
        ownerId,
        user,
        payload,
        workSessionId,
        vanId: String(vanId || ''),
        vanName,
        nowIso,
      });

      /**
       * ======================================================
       * CREATE VAN DAILY STOCK
       *
       * Same as backend:
       * const erpClosing = getLatestOpeningStock(vanId)
       * const inventories = erpClosing.length
       *   ? erpClosing converted to quantity
       *   : inventoryService.findByVanId(vanId)
       * ======================================================
       */
      const existingDailyStock = await safeFindAll('vanDailyStock', 20000);

      const hasDailyStockForSession = existingDailyStock.some(
        (item: any) => String(item.workSessionId || '') === String(workSessionId),
      );

      if (!hasDailyStockForSession) {

        /**
         * ======================================================
         * LATEST ERP CLOSING STOCK
         *
         * Offline equivalent of:
         * getLatestOpeningStock(vanId, asOf)
         * ======================================================
         */
        const erpClosingRecords = await safeFindAll('vanErpClosing', 20000);

        const endOfDay = toServerEndOfDay(now);

        const validErpClosingRows = erpClosingRecords
          .filter((item: any) => {
            if (String(item.vanId || '') !== String(vanId || '')) return false;
            if (item.isDeleted === true) return false;
            if (!item.date) return false;

            const itemDate = new Date(item.date);

            return !Number.isNaN(itemDate.getTime()) && itemDate.getTime() <= endOfDay.getTime();
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();

            if (dateA !== dateB) return dateB - dateA;

            const modifiedA = new Date(a.modifiedDate || a.updatedAt || 0).getTime();

            const modifiedB = new Date(b.modifiedDate || b.updatedAt || 0).getTime();

            return modifiedB - modifiedA;
          });

        const latestErpDate = validErpClosingRows[0]?.date;

        const latestErpClosingRows = latestErpDate
          ? validErpClosingRows.filter((item: any) => {
              return isSameServerDate(item.date, latestErpDate);
            })
          : [];

        /**
         * Product lookup same as backend $lookup product_master.
         */
        const productRecords = await safeFindAll('products', 20000);

        const productMap = new Map<string, any>(
          productRecords
            .map((item: any): [string, any] => [
              String(item.productId || item.uuid || item.id || ''),
              item,
            ])
            .filter(([id]) => Boolean(id)),
        );

        let openingStocks: Array<{
          productId: string;
          unitQtyInCase: number;
          quantity: number;
          piecePrice: number;
          pieceNetWeight: number;
        }> = [];

        if (latestErpClosingRows.length) {
          /**
           * ERP closing exists.
           *
           * Backend:
           * closingCases = qtyInCase || qty
           * quantity = closingCases * unitQtyInCase
           */
          openingStocks = latestErpClosingRows
            .map((item: any) => {
              const product = productMap.get(String(item.productId || '')) || {};

              const unitQtyInCase = toNumber(product.unitQtyInCase || item.unitQtyInCase, 1);

              const closingCases = toNumber(item.qtyInCase ?? item.qty ?? item.closingCases, 0);

              return {
                productId: String(item.productId || ''),
                unitQtyInCase,
                quantity: closingCases * unitQtyInCase,
                piecePrice: toNumber(product.piecePrice || item.piecePrice, 0),
                pieceNetWeight: toNumber(product.pieceNetWeight || item.pieceNetWeight, 0),
              };
            })
            .filter((item) => Boolean(item.productId) && toNumber(item.quantity) > 0);
        } else {
          /**
           * No ERP closing.
           *
           * Backend fallback:
           * inventoryService.findByVanId(vanId)
           *
           * Offline fallback:
           * local stock/inventory repository.
           */
          const stockRecords = await safeFindAll('stock', 20000);

          openingStocks = stockRecords
            .filter((item: any) => {
              if (String(item.vanId || '') !== String(vanId || '')) return false;
              if (item.isDeleted === true) return false;

              const status = String(item.status || 'ACTIVE').toUpperCase();

              if (status === 'INACTIVE') return false;

              return toNumber(item.quantity) > 0;
            })
            .map((item: any) => ({
              productId: String(item.productId || ''),
              unitQtyInCase: toNumber(item.unitQtyInCase, 1),
              quantity: toNumber(item.quantity),
              piecePrice: toNumber(item.piecePrice, 0),
              pieceNetWeight: toNumber(item.pieceNetWeight, 0),
            }))
            .filter((item) => Boolean(item.productId) && toNumber(item.quantity) > 0);
        }

        for (const stock of openingStocks) {
          const vanDailyStockId = createSchemaId('VanDailyStock');
          const openingQty = toNumber(stock.quantity, 0);

          await safeCreate('vanDailyStock', {
            uuid: vanDailyStockId,
            vanDailyStockId,

            date: nowIso,

            vanId,
            employeeId: ownerId,

            productId: stock.productId,
            unitQtyInCase: stock.unitQtyInCase || 1,

            openingQty,
            inQty: 0,
            outQty: 0,
            adjustmentQty: 0,
            closingQty: openingQty,

            pieceNetWeight: stock.pieceNetWeight,
            piecePrice: stock.piecePrice,

            workSessionId,
            status: 'DRAFT',
          });
        }
      }
    }

    /**
     * ======================================================
     * CREATE ACTIVITY
     * Backend ActivityService.create()
     * ======================================================
     */

    /**
     * Complete existing active activities for this work session.
     * Usually none during Day Start, but same behavior as online.
     */
    const activityRecords = await safeFindAll('activities', 5000);

    const activeActivities = activityRecords.filter(
      (item: any) =>
        String(item.workSessionId || '') === String(workSessionId) && isActiveStatus(item.status),
    );

    for (const activity of activeActivities) {
      await safeUpdate('activities', String(activity.uuid || activity.activityId), {
        status: 'COMPLETED',
        endTime: nowIso,
      });
    }

    const activityId = createSchemaId('Activity');

    await repositories.activities.create(ownerId, {
      uuid: activityId,
      activityId,

      workSessionId,

      userId: ownerId,
      userName: user?.name,

      vanId,
      vanName,

      name: payload.activityName || 'Work Session',
      description: payload.description || '',

      routeId: payload.routeId,
      routeName: payload.routeName,
      totalShops: payload.totalShops,
      customerCategoryId: payload.customerCategoryId,

      startTime: nowIso,
      startLocation: (payload as any).startLocation || payload.dayStartLocation,

      status: 'ACTIVE',
    });

    useAuthStore.getState().setWorkSessionId(workSessionId);

    return {
      success: true,
      statusCode: 202,
      message: 'Day start saved locally',
      data: {
        ...record,
        workSessionId,
      },
      offline: true,
    } as ApiResponse<any>;
  },

  uploadDayStartImage: async ({ uri, ownerId, subOwnerId }, config) => {
    const formData = new FormData();
    const cleanUri = uri.split('?')[0];
    const extension = cleanUri.includes('.') ? cleanUri.split('.').pop() || 'jpg' : 'jpg';
    const mimeType = extension.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `day-start-${Date.now()}.${extension}`;

    if (Platform.OS === 'web') {
      const blob = await fetch(uri).then((response) => response.blob());
      const WebFile = (globalThis as any).File;
      const file =
        typeof WebFile !== 'undefined'
          ? new WebFile([blob], fileName, { type: blob.type || mimeType })
          : blob;

      formData.append('file', file, fileName);
    } else {
      formData.append('file', {
        uri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    formData.append('ownerType', 'EMPLOYEE');
    formData.append('ownerId', ownerId);
    formData.append('mediaType', 'IMAGE');
    formData.append('purpose', 'PROOF');
    formData.append('title', 'Day Start Selfie');
    formData.append('isPrimary', 'false');
    formData.append('subOwnerId', subOwnerId || '');

    return uploadFormData<{ mediaId: string; url: string }>('/media/upload', formData, config);
  },
  getDayStatus: async (_workSessionId, config) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/work-session/today-activity`, config);
    }
    const isToday = (value: unknown) => {
      if (!value) return false;
      const date = new Date(String(value));
      const today = new Date();
      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    };
    const records = await repositories.attendance.findAll(user?.userId ?? '', { limit: 10 });
    const todayRecords = records.filter((item) =>
      isToday(item.dayStartTime ?? item.startTime ?? item.createdAt),
    );
    const record =
      todayRecords.find((item) => String(item.status ?? '').toUpperCase() === 'ACTIVE') ??
      todayRecords[0] ??
      null;
    const activityRecords = await repositories.activities.findAll(user?.userId ?? '', {
      limit: 200,
    });
    const activities = activityRecords
      .filter((item) => isToday(item.startTime ?? item.createdAt))
      .map((item) => ({
        ...item,
        _id: item._id ?? item.activityId ?? item.uuid,
        activityId: item.activityId ?? item.uuid,
        name: item.name ?? item.activityName ?? 'Activity',
        startTime: item.startTime ?? item.createdAt,
        status: String(item.status ?? '').toUpperCase() === 'ACTIVE' ? 'ongoing' : 'completed',
      }));
    const routeSessions = await repositories.routeSessions.findAll(user?.userId ?? '', {
      limit: 200,
    });
    const activeRouteSession = routeSessions.find(
      (item) =>
        String(item.status ?? '').toUpperCase() === 'ACTIVE' &&
        Boolean(record) &&
        [record?.uuid, record?.workSessionId]
          .filter(Boolean)
          .map(String)
          .includes(String(item.workSessionId ?? '')),
    );
    const legacyRetailingRouteId =
      routeSessions.length === 0 && record?.activityName === 'Retailing'
        ? record?.routeId
        : undefined;
    const routeId = String(activeRouteSession?.routeId ?? legacyRetailingRouteId ?? '');
    const routeRecord = routeId
      ? await repositories.routes.findById(user?.userId ?? '', routeId)
      : null;
    const selectedRoute = routeId
      ? {
          ...routeRecord,
          routeId,
          name: activeRouteSession?.routeName ?? routeRecord?.name,
          routeName: activeRouteSession?.routeName ?? routeRecord?.name,
          routeSessionId: activeRouteSession?.routeSessionId ?? activeRouteSession?.uuid ?? '',
          workSessionId: activeRouteSession?.workSessionId ?? record?.uuid,
          totalShops: activeRouteSession?.totalShops ?? routeRecord?.outletCount ?? 0,
          vanId: activeRouteSession?.vanId ?? record?.vanId ?? user?.vanId,
        }
      : null;
    const currentActivity = activities.find((item) => item.status === 'ongoing' && !item.endTime);
    const activeActivity = currentActivity
      ? {
          ...currentActivity,
          name: currentActivity.name,
          startTime: currentActivity.startTime ?? currentActivity.createdAt,
        }
      : record &&
          activities.length === 0 &&
          String(record.status ?? '').toUpperCase() === 'ACTIVE' &&
          record.activityName
        ? {
            _id: `work-session-${record.uuid}`,
            name: record.activityName,
            startTime: record.startTime,
            status: 'ongoing',
          }
        : null;
    return {
      success: true,
      statusCode: 200,
      data: record
        ? {
            ...record,
            workSessionId: record.uuid,
            activeActivity,
            selectedRoute,
            todayActivities: activities.length
              ? activities
              : activeActivity
                ? [activeActivity]
                : [],
          }
        : null,
      offline: true,
    } as ApiResponse<any>;
  },
  getTodayActivities: async (workSessionId) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/activity`, {
        params: { workSessionId },
      }) as Promise<ApiResponse<any>>;
    }
    const records = await repositories.activities.findAll(user?.userId ?? '', { limit: 200 });
    const data = records
      .filter((item) => !workSessionId || item.workSessionId === workSessionId)
      .map((item) => ({
        ...item,
        _id: item._id ?? item.activityId ?? item.uuid,
        activityId: item.activityId ?? item.uuid,
        name: item.name ?? item.activityName ?? 'Activity',
        startTime: item.startTime ?? item.createdAt,
        status: String(item.status ?? '').toUpperCase() === 'ACTIVE' ? 'ongoing' : 'completed',
      }));
    return { success: true, statusCode: 200, data, offline: true } as ApiResponse<any>;
  },
  createActivity: async (payload) => {
  const user = useAuthStore.getState().user;

  /**
   * ======================================================
   * NON-SALESMAN
   * ======================================================
   */
  if (!isSalesman(user)) {
    return api.post<any, CreateActivityPayload>('/activity', payload);
  }

  /**
   * ======================================================
   * ONLINE MODE
   * ======================================================
   */
  if (!isOfflineMode()) {
    const response = await api.post<any, CreateActivityPayload>(
      '/activity',
      payload,
    );

    if (response?.success) return response;

    /**
     * Network reachability can change before listener updates Zustand.
     * Fall through to SQLite so activity is not lost.
     */
    useOfflineStore.getState().setConnection(false, false);
  }

  /**
   * ======================================================
   * OFFLINE MODE
   * Same behavior as online ActivityService.create()
   * ======================================================
   */
  const ownerId = user?.userId ?? '';
  const now = new Date().toISOString();

  const workSessionId = String(payload.workSessionId || '');
  const vanId = String(payload.vanId || user?.vanId || '');
  const vanName = payload.vanName || user?.vanName;

  if (!ownerId) {
    throw new Error('User is required for offline activity');
  }

  if (!workSessionId) {
    throw new Error('Work session is required. Please start your day first.');
  }

  if (!vanId) {
    throw new Error('Van is required for offline activity');
  }

  const toNumber = (value: unknown, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const toTime = (value: unknown) => {
    const time = value ? new Date(String(value)).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
  };

  const loadAll = async (repository: any, maxRecords = 10000) => {
    const records: Record<string, any>[] = [];

    for (let page = 1; ; page += 1) {
      const batch = await repository.findAll(ownerId, {
        page,
        limit: 200,
      });

      records.push(...batch);

      if (batch.length < 200 || records.length >= maxRecords) {
        return records;
      }
    }
  };

  /**
   * ======================================================
   * 1. COMPLETE PREVIOUS ACTIVE ACTIVITIES
   * Same as backend updateMany({ workSessionId, ACTIVE })
   * ======================================================
   */
  const existingActivities = await loadAll(repositories.activities, 1000);

  await Promise.all(
    existingActivities
      .filter(
        (item) =>
          String(item.workSessionId || '') === workSessionId &&
          String(item.status ?? '').toUpperCase() === 'ACTIVE' &&
          item.isDeleted !== true &&
          !item.deletedAt,
      )
      .map((item) =>
        repositories.activities.update(ownerId, item.uuid, {
          status: 'COMPLETED',
          endTime: now,
        }),
      ),
  );

  /**
   * ======================================================
   * 2. COMPLETE PREVIOUS ACTIVE ROUTE SESSIONS
   * Same as routeSessionService.markCompleted()
   * ======================================================
   */
  const existingRouteSessions = await loadAll(
    repositories.routeSessions,
    1000,
  );

  await Promise.all(
    existingRouteSessions
      .filter(
        (item) =>
          String(item.workSessionId || '') === workSessionId &&
          String(item.status ?? '').toUpperCase() === 'ACTIVE' &&
          item.isDeleted !== true &&
          !item.deletedAt,
      )
      .map((item) =>
        repositories.routeSessions.update(ownerId, item.uuid, {
          status: 'COMPLETED',
          isActive: false,
          endTime: now,
        }),
      ),
  );

  /**
   * ======================================================
   * 3. CREATE NEW ACTIVITY
   * ======================================================
   */
  const activityId = createSchemaId('Activity');

  const record = await repositories.activities.create(ownerId, {
    ...payload,

    uuid: activityId,
    activityId,

    userId: user?.userId,
    userName: user?.name,

    vanId,
    vanName,

    name: payload.name,
    description: payload.description || '',

    startTime: now,
    status: 'ACTIVE',
  } as unknown as Record<string, unknown>);

  /**
   * ======================================================
   * 4. CREATE ROUTE SESSION + VAN DAILY STOCK
   * Only when activity has routeId
   * ======================================================
   */
  if (payload.routeId) {
    await createOfflineRouteSession({
      ownerId,
      user,
      payload,
      workSessionId,
      vanId,
      vanName,
      nowIso: now,
      completeExisting: false,
    });

    /**
     * ======================================================
     * 5. CREATE VAN DAILY STOCK
     *
     * Same as online:
     * - If daily stock already exists for workSessionId, do nothing.
     * - Else use vanErpClosing first.
     * - If vanErpClosing not found, fallback to stock/inventories.
     * ======================================================
     */
    const existingDailyStock = await loadAll(
      repositories.vanDailyStock,
      10000,
    );

    const hasDailyStockForSession = existingDailyStock.some(
      (item) =>
        String(item.workSessionId || '') === workSessionId &&
        String(item.vanId || '') === vanId &&
        item.isDeleted !== true &&
        !item.deletedAt,
    );

    /**
     * Important:
     * Route change inside same work session must not reset stock.
     */
    if (!hasDailyStockForSession) {
      const [erpClosingRecords, stockRecords, productRecords] =
        await Promise.all([
          loadAll(repositories.vanErpClosing, 10000),
          loadAll(repositories.stock, 10000),
          loadAll(repositories.products, 10000),
        ]);

      const productById = new Map(
        productRecords.map((product) => [
          String(product.productId),
          product,
        ]),
      );

      /**
       * ======================================================
       * PREFER LATEST ERP CLOSING STOCK FOR VAN
       * Same as backend getLatestOpeningStock(vanId)
       * ======================================================
       */
      const validErpClosing = erpClosingRecords
        .filter(
          (item) =>
            String(item.vanId || '') === vanId &&
            item.isDeleted !== true &&
            !item.deletedAt,
        )
        .sort((a, b) => {
          const aTime = toTime(
            a.date ||
              a.closeDate ||
              a.modifiedDate ||
              a.createdDate ||
              a.updatedAt ||
              a.createdAt,
          );

          const bTime = toTime(
            b.date ||
              b.closeDate ||
              b.modifiedDate ||
              b.createdDate ||
              b.updatedAt ||
              b.createdAt,
          );

          return bTime - aTime;
        });

      const latestErpDate = validErpClosing[0]
        ? String(
            validErpClosing[0].date ||
              validErpClosing[0].closeDate ||
              validErpClosing[0].modifiedDate ||
              validErpClosing[0].createdDate ||
              '',
          ).slice(0, 10)
        : '';

      const latestErpRows = latestErpDate
        ? validErpClosing.filter((item) =>
            String(
              item.date ||
                item.closeDate ||
                item.modifiedDate ||
                item.createdDate ||
                '',
            ).startsWith(latestErpDate),
          )
        : [];

      /**
       * ======================================================
       * BUILD OPENING STOCK
       * ERP first, fallback stock second
       * ======================================================
       */
      const openingStocks = latestErpRows.length
        ? latestErpRows
            .map((item) => {
              const productId = String(item.productId || item.itemCode || '');
              const product = productById.get(productId);

              const unitQtyInCase = Math.max(
                toNumber(
                  item.unitQtyInCase ??
                    item.piecePerCase ??
                    product?.unitQtyInCase,
                  1,
                ),
                1,
              );

              /**
               * ERP can have cases or direct quantity.
               */
              const quantity =
                toNumber(item.quantity) ||
                toNumber(item.qty) ||
                toNumber(item.closingQty) ||
                toNumber(item.closingCases) * unitQtyInCase;

              return {
                productId,
                productName:
                  item.productName ||
                  item.itemName ||
                  product?.productName ||
                  product?.name,

                unitQtyInCase,
                quantity,

                pieceNetWeight: toNumber(
                  item.pieceNetWeight ?? product?.pieceNetWeight,
                ),

                caseNetWeight: toNumber(
                  item.caseNetWeight ?? product?.caseNetWeight,
                ),

                piecePrice: toNumber(
                  item.piecePrice ?? product?.piecePrice,
                ),

                casePrice: toNumber(
                  item.casePrice ?? product?.casePrice,
                ),
              };
            })
            .filter((item) => item.productId && item.quantity > 0)
        : stockRecords
            .filter(
              (item) =>
                String(item.vanId || '') === vanId &&
                item.isDeleted !== true &&
                !item.deletedAt &&
                toNumber(item.quantity) > 0,
            )
            .map((item) => {
              const product = productById.get(String(item.productId));

              const unitQtyInCase = Math.max(
                toNumber(item.unitQtyInCase ?? product?.unitQtyInCase, 1),
                1,
              );

              const pieceNetWeight = toNumber(
                item.pieceNetWeight ?? product?.pieceNetWeight,
              );

              const piecePrice = toNumber(
                item.piecePrice ?? product?.piecePrice,
              );

              return {
                productId: String(item.productId),
                productName:
                  item.productName ||
                  product?.productName ||
                  product?.name,

                unitQtyInCase,
                quantity: toNumber(item.quantity),

                pieceNetWeight,
                caseNetWeight:
                  toNumber(item.caseNetWeight ?? product?.caseNetWeight) ||
                  pieceNetWeight * unitQtyInCase,

                piecePrice,
                casePrice:
                  toNumber(item.casePrice ?? product?.casePrice) ||
                  piecePrice * unitQtyInCase,
              };
            });

      /**
       * ======================================================
       * DEDUPLICATE OPENING STOCK PRODUCT-WISE
       * Protects local from duplicate vanDailyStock rows.
       * ======================================================
       */
      const stockByProduct = new Map<string, any>();

      for (const stock of openingStocks) {
        const productId = String(stock.productId || '');

        if (!productId) continue;

        const existing = stockByProduct.get(productId);

        if (existing) {
          existing.quantity += toNumber(stock.quantity);

          /**
           * Keep latest non-empty pricing/weight.
           */
          existing.unitQtyInCase =
            stock.unitQtyInCase || existing.unitQtyInCase;
          existing.pieceNetWeight =
            stock.pieceNetWeight || existing.pieceNetWeight;
          existing.caseNetWeight =
            stock.caseNetWeight || existing.caseNetWeight;
          existing.piecePrice = stock.piecePrice || existing.piecePrice;
          existing.casePrice = stock.casePrice || existing.casePrice;
        } else {
          stockByProduct.set(productId, { ...stock });
        }
      }

      const uniqueOpeningStocks = Array.from(stockByProduct.values());

      /**
       * ======================================================
       * CREATE VAN DAILY STOCK ROWS
       * One product per workSessionId
       * ======================================================
       */
      for (const stock of uniqueOpeningStocks) {
        const productId = String(stock.productId || '');

        if (!productId) continue;

        /**
         * Final safety:
         * Do not create duplicate product row for same workSessionId.
         */
        const alreadyExists = existingDailyStock.some(
          (item) =>
            String(item.workSessionId || '') === workSessionId &&
            String(item.vanId || '') === vanId &&
            String(item.productId || '') === productId &&
            item.isDeleted !== true &&
            !item.deletedAt,
        );

        if (alreadyExists) continue;

        const vanDailyStockId = createSchemaId('VanDailyStock');

        await repositories.vanDailyStock.create(ownerId, {
          uuid: vanDailyStockId,
          vanDailyStockId,

          date: now,

          vanId,
          employeeId: user?.userId,

          productId,
          productName: stock.productName,

          unitQtyInCase: stock.unitQtyInCase || 1,

          openingQty: stock.quantity || 0,
          inQty: 0,
          outQty: 0,
          adjustmentQty: 0,
          closingQty: stock.quantity || 0,

          pieceNetWeight: stock.pieceNetWeight || 0,
          caseNetWeight: stock.caseNetWeight || 0,

          piecePrice: stock.piecePrice || 0,
          casePrice: stock.casePrice || 0,

          workSessionId,

          status: 'DRAFT',
        } as unknown as Record<string, unknown>);
      }
    }
  }

  return {
    success: true,
    statusCode: 202,
    message: 'Activity saved locally',
    data: {
      ...record,
      activityId,
    },
    offline: true,
  } as ApiResponse<any>;
},
  getRoutes: async (vanId) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user)) {
      return api.get<any>('/route');
    }
    if (!isOfflineMode()) {
      // Route-to-van assignments live on the van document. The generic route
      // listing does not accept vanId and rejects it as a non-whitelisted query.
      return api.get<any>('/van/mapped-routes');
    }
    const data = await repositories.routes.findAll(user?.userId ?? '', { limit: 200 });
    return {
      success: true,
      statusCode: 200,
      data: {
        vanId,
        routes: data.map((record) => ({
          routeId: record.routeId ?? record.uuid,
          ...(record.assignment && typeof record.assignment === 'object'
            ? (record.assignment as Record<string, unknown>)
            : {}),
          route: record,
        })),
      },
    } as ApiResponse<any>;
  },
  getVanMappedRoutes: async () => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/van/mapped-routes`, {}) as Promise<ApiResponse<any>>;
    }

    const records = await repositories.routes.findAll(user?.userId ?? '', { limit: 200 });
    if (!records.length) {
      // The HTTP layer restores the login-prefetched snapshot while offline.
      return api.get<any>(`/van/mapped-routes`, {}) as Promise<ApiResponse<any>>;
    }
    const routes = records.map((record) => {
      const assignment =
        record.assignment && typeof record.assignment === 'object'
          ? (record.assignment as Record<string, unknown>)
          : {};
      return {
        routeId: record.routeId ?? record.uuid,
        ...assignment,
        route: record,
      };
    });

    return {
      success: true,
      statusCode: 200,
      data: { vanId: user?.vanId, routes },
      offline: true,
    } as ApiResponse<any>;
  },
  getVan: async (userId: string) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/van`, { params: { limit: 1, page: 1, userId } });
    }
    const data = await repositories.vans.findAll(user?.userId ?? '', { limit: 1 });
    return {
      success: true,
      statusCode: 200,
      data,
      offline: true,
    } as ApiResponse<any>;
  },
  getVans: async (params) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/van`, { params: { limit: 50, page: 1, ...(params || {}) } });
    }
    const data = await repositories.vans.findAll(user?.userId ?? '', { limit: 50 });
    return {
      success: true,
      statusCode: 200,
      data,
      meta: { total: data.length, page: 1, limit: 50 },
      offline: true,
    } as ApiResponse<any>;
  },
  dayComplete: async (carryForwardStock, config) => {
    const pendingEntries = await syncService.getPendingCount();
    if (pendingEntries > 0) {
      useLoaderStore.getState().show({
        message: `Uploading ${pendingEntries} pending entr${pendingEntries === 1 ? 'y' : 'ies'} before settlement...`,
      });
      await syncService.uploadPendingBeforeSettlement();
      useLoaderStore
        .getState()
        .show({ message: 'Pending entries uploaded. Completing settlement...' });
    }

    const payload =
      carryForwardStock &&
      typeof carryForwardStock === 'object' &&
      'dayEndLocation' in carryForwardStock
        ? carryForwardStock
        : {
            carryForwardStock,
            dayEndLocation: await captureCurrentLocation(),
          };

    const user = useAuthStore.getState().user;
    if (isSalesman(user) && isOfflineMode()) {
      const workSessionId = useAuthStore.getState().workSessionId;
      if (!workSessionId)
        return {
          success: false,
          statusCode: 404,
          message: 'No active work session',
          data: null,
        } as ApiResponse<any>;
      const ownerId = user?.userId ?? '';
      const endedAt = new Date().toISOString();
      const [activities, routeSessions] = await Promise.all([
        repositories.activities.findAll(ownerId, { limit: 200 }),
        repositories.routeSessions.findAll(ownerId, { limit: 200 }),
      ]);
      await Promise.all([
        ...activities
          .filter(
            (item) =>
              item.workSessionId === workSessionId &&
              String(item.status ?? '').toUpperCase() === 'ACTIVE',
          )
          .map((item) =>
            repositories.activities.update(ownerId, item.uuid, {
              status: 'COMPLETED',
              endTime: endedAt,
            }),
          ),
        ...routeSessions
          .filter(
            (item) =>
              item.workSessionId === workSessionId &&
              String(item.status ?? '').toUpperCase() === 'ACTIVE',
          )
          .map((item) =>
            repositories.routeSessions.update(ownerId, item.uuid, {
              status: 'COMPLETED',
              isActive: false,
              endTime: endedAt,
            }),
          ),
      ]);
      const record = await repositories.attendance.update(ownerId, workSessionId, {
        ...payload,
        status: 'COMPLETED',
        dayEndTime: endedAt,
        endTime: endedAt,
      });
      await stopSalesmanBackgroundLocation();
      return {
        success: true,
        statusCode: 202,
        message: 'Day completion saved locally',
        data: record,
      } as ApiResponse<any>;
    }
    const response = (await api.post(
      '/work-session/complete',
      payload,
      config,
    )) as ApiResponse<any>;

    if (response?.success) {
      await stopSalesmanBackgroundLocation();
      // Pull the completed work session/activity immediately. Otherwise the
      // local database still contains the pre-settlement ACTIVE records and
      // shows an ongoing activity after switching offline.
      // Settlement is already complete on the server, so do not keep the user
      // waiting for a full upload/download and snapshot refresh.
      void syncService.sync().catch(() => undefined);
    }

    return response;
  },
  cancelVanChangeRequest: (vanChangeRequestId: string) =>
    api.patch<any>(`/van-change-request/${vanChangeRequestId}/cancel`, {}) as Promise<
      ApiResponse<any>
    >,
  requestVanChange: (workSessionId, payload) =>
    api.post<any>('/van-change-request', {
      workSessionId,
      requestedVanId: payload.requestedVanId,
      requestedVanName: payload.requestedVanName,
      reason: payload.vanChangeReason,
    }) as Promise<ApiResponse<any>>,
  getEmployeeStats: async (employeeId: string) => {
    const user = useAuthStore.getState().user;
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<any>(`/employee/${employeeId}/stats`, {}) as Promise<ApiResponse<any>>;
    }

    const ownerId = user?.userId ?? employeeId;
    const [visits, orders] = await Promise.all([
      repositories.visits.findAll(ownerId, { limit: 200 }),
      repositories.orders.findAll(ownerId, { limit: 200 }),
    ]);
    const today = new Date();
    const isToday = (value: unknown) => {
      if (!value) return false;
      const date = new Date(String(value));
      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    };
    const todayVisits = visits.filter((item) => isToday(item.checkInTime ?? item.createdAt));
    const completedVisits = todayVisits.filter(
      (item) => String(item.status ?? '').toUpperCase() === 'COMPLETED',
    );
    const todayOrders = orders.filter((item) => isToday(item.date ?? item.createdAt));
    const sum = (key: string) =>
      todayOrders.reduce((total, order) => total + Number(order[key] ?? 0), 0);

    return {
      success: true,
      statusCode: 200,
      data: {
        visits: completedVisits.length,
        totalVisits: todayVisits.length,
        tc: completedVisits.length,
        pc: todayOrders.length,
        orders: {
          count: todayOrders.length,
          value: sum('totalValue'),
          cases: sum('totalCases'),
          weight: sum('totalWeight'),
          pending: todayOrders.filter(
            (item) => String(item.status ?? '').toUpperCase() === 'PENDING',
          ).length,
        },
        incentives: { earned: 0, target: 0, nextMilestone: 0 },
      },
      offline: true,
    } as ApiResponse<any>;
  },
  // getSalesmanPocketAndTarget: (params) =>
  //   api.get<SalesmanPocketTargetResponse>(`/employee/salesman/my-pocket-target`, {
  //     params,
  //   }) as Promise<ApiResponse<SalesmanPocketTargetResponse>>,
  getSalesmanPocketAndTarget: async (params) => {
    const user = useAuthStore.getState().user;

    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<SalesmanPocketTargetResponse>(`/employee/salesman/my-pocket-target`, {
        params,
      }) as Promise<ApiResponse<SalesmanPocketTargetResponse>>;
    }

    const ownerId = user?.userId ?? '';

    const parseDate = (value?: string) => {
      const date = value ? new Date(value) : new Date();
      return Number.isNaN(date.getTime()) ? new Date() : date;
    };

    const now = params?.endDate
      ? parseDate(params.endDate)
      : params?.date
        ? parseDate(params.date)
        : new Date();

    const hasDateRange = Boolean(params?.startDate || params?.endDate);

    const startDate = params?.startDate
      ? parseDate(params.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    startDate.setHours(0, 0, 0, 0);

    const endDate = hasDateRange ? parseDate(params?.endDate || params?.startDate) : now;

    endDate.setHours(23, 59, 59, 999);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (endDate > todayEnd) {
      endDate.setTime(todayEnd.getTime());
    }

    const monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const lmtdDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      Math.min(now.getDate(), new Date(now.getFullYear(), now.getMonth(), 0).getDate()),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    );

    const lmtdStartDate = new Date(lmtdDate.getFullYear(), lmtdDate.getMonth(), 1, 0, 0, 0, 0);

    const normalizedMetric: TargetMetric = ['cases', 'tonnage', 'value'].includes(
      params?.metric || 'cases',
    )
      ? (params?.metric as TargetMetric)
      : 'cases';

    const openActivityEnd = endDate.getTime() > Date.now() ? new Date() : endDate;

    const isBetween = (value: unknown, from: Date, to: Date) => {
      if (!value) return false;

      const date = new Date(String(value));

      return !Number.isNaN(date.getTime()) && date >= from && date <= to;
    };

    const formatCalendarDate = (value: Date) => {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    const formatTime = (value?: Date | string | null) => {
      if (!value) return null;

      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) return null;

      return parsedDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    const formatAverageTime = (values: Array<Date | string | null | undefined>) => {
      const minutes = values
        .map((value) => {
          if (!value) return null;

          const parsedDate = new Date(value);

          if (Number.isNaN(parsedDate.getTime())) return null;

          return parsedDate.getHours() * 60 + parsedDate.getMinutes();
        })
        .filter((value): value is number => value !== null);

      if (!minutes.length) return null;

      const averageMinutes = Math.round(
        minutes.reduce((sum, value) => sum + value, 0) / minutes.length,
      );

      const averageDate = new Date();

      averageDate.setHours(Math.floor(averageMinutes / 60), averageMinutes % 60, 0, 0);

      return formatTime(averageDate);
    };

    const formatDurationMinutes = (value: number) => {
      if (!Number.isFinite(value) || value < 1) return '< 1 min';

      const hours = Math.floor(value / 60);
      const minutes = value % 60;

      if (!hours) return `${minutes} min${minutes === 1 ? '' : 's'}`;
      if (!minutes) return `${hours} hr${hours === 1 ? '' : 's'}`;

      return `${hours} hr${hours === 1 ? '' : 's'} ${minutes} min${minutes === 1 ? '' : 's'}`;
    };

    const formatAverageDuration = (values: Array<number | null | undefined>) => {
      const minutes = values
        .map((value) => Math.max(Math.round(Number(value || 0) / 60000), 0))
        .filter((value) => value > 0);

      if (!minutes.length) return null;

      const averageMinutes = Math.round(
        minutes.reduce((sum, value) => sum + value, 0) / minutes.length,
      );

      return formatDurationMinutes(averageMinutes);
    };

    const formatDayLabel = (value: Date) =>
      value.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const [
      targetRecords,
      orderRecords,
      visitRecords,
      activityRecords,
      leaveRecords,
      workSessionRecords,
      vanStockRecords,
    ] = await Promise.all([
      repositories.targets.findAll(ownerId, { limit: 5000 }),
      repositories.orders.findAll(ownerId, { limit: 5000 }),
      repositories.visits.findAll(ownerId, { limit: 5000 }),
      repositories.activities.findAll(ownerId, { limit: 5000 }),
      repositories.leaves.findAll(ownerId, { limit: 5000 }),
      repositories.attendance.findAll(ownerId, { limit: 5000 }),
      repositories.vanDailyStock.findAll(ownerId, { limit: 5000 }),
    ]);

    const targets = targetRecords.filter(
      (item: any) => new Date(item.startDate) <= endDate && new Date(item.endDate) >= startDate,
    );

    const lmtdTargets = targetRecords.filter(
      (item: any) =>
        new Date(item.startDate) <= lmtdDate && new Date(item.endDate) >= lmtdStartDate,
    );

    const sales = orderRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(item.date || item.createdAt, startDate, endDate),
    );

    const lmtdSales = orderRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(item.date || item.createdAt, lmtdStartDate, lmtdDate),
    );

    const totalVisits = visitRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(item.checkInTime || item.createdAt, startDate, endDate),
    );

    const uniqueVisitedOutlets = new Set(
      totalVisits.map((item: any) => item.outletId).filter(Boolean),
    );

    const activities = activityRecords.filter(
      (item: any) =>
        ['ACTIVE', 'COMPLETED'].includes(String(item.status ?? '').toUpperCase()) &&
        isBetween(item.startTime || item.createdAt, startDate, endDate),
    );

    const retailingDays = new Set(
      activities
        .filter((item: any) => item.name === 'Retailing')
        .map((item: any) => formatCalendarDate(new Date(item.startTime || item.createdAt))),
    );

    const vanStock = vanStockRecords.filter((item: any) =>
      isBetween(item.date || item.createdAt, startDate, endDate),
    );

    const leaves = leaveRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(item.createdAt, startDate, endDate),
    );

    const workSessions = workSessionRecords.filter((item: any) =>
      isBetween(item.dayStartTime || item.createdAt, startDate, endDate),
    );

    const targetCases = targets.reduce(
      (sum: number, item: any) => sum + Number(item.targetCases || 0),
      0,
    );
    const targetTonnage = targets.reduce(
      (sum: number, item: any) => sum + Number(item.targetTonnage || 0),
      0,
    );
    const targetValue = targets.reduce(
      (sum: number, item: any) => sum + Number(item.targetValue || 0),
      0,
    );

    const achievedCases = sales.reduce(
      (sum: number, item: any) => sum + Number(item.netCases || item.totalCases || 0),
      0,
    );
    const achievedTonnage = sales.reduce(
      (sum: number, item: any) => sum + Number(item.totalWeight || 0) / 1000,
      0,
    );
    const achievedValue = sales.reduce(
      (sum: number, item: any) => sum + Number(item.totalValue || 0),
      0,
    );

    const remainingCases = Math.max(targetCases - achievedCases, 0);
    const remainingTonnage = Math.max(targetTonnage - achievedTonnage, 0);
    const remainingValue = Math.max(targetValue - achievedValue, 0);

    const lmtdTargetCases = lmtdTargets.reduce(
      (sum: number, item: any) => sum + Number(item.targetCases || 0),
      0,
    );
    const lmtdTargetTonnage = lmtdTargets.reduce(
      (sum: number, item: any) => sum + Number(item.targetTonnage || 0),
      0,
    );
    const lmtdTargetValue = lmtdTargets.reduce(
      (sum: number, item: any) => sum + Number(item.targetValue || 0),
      0,
    );

    const lmtdAchievedCases = lmtdSales.reduce(
      (sum: number, item: any) => sum + Number(item.netCases || item.totalCases || 0),
      0,
    );
    const lmtdAchievedTonnage = lmtdSales.reduce(
      (sum: number, item: any) => sum + Number(item.totalWeight || 0) / 1000,
      0,
    );
    const lmtdAchievedValue = lmtdSales.reduce(
      (sum: number, item: any) => sum + Number(item.totalValue || 0),
      0,
    );

    const pc = sales.length;
    const tc = totalVisits.length;
    const upc = new Set(sales.map((item: any) => item.customerId).filter(Boolean)).size;
    const utc = uniqueVisitedOutlets.size;
    const retailingDayCount = retailingDays.size;

    const totalLinesSold = sales.reduce(
      (sum: number, item: any) => sum + Number(item.lineCount || item.totalLines || 0),
      0,
    );

    const openingStockCases = vanStock.reduce((sum: number, item: any) => {
      const unitQty = Number(item.unitQtyInCase || 1);
      return sum + Number(item.openingQty || 0) / unitQty;
    }, 0);

    const topupStockCases = vanStock.reduce((sum: number, item: any) => {
      const unitQty = Number(item.unitQtyInCase || 1);
      return sum + Number(item.inQty || 0) / unitQty;
    }, 0);

    const stockSalesCases = vanStock.reduce((sum: number, item: any) => {
      const unitQty = Number(item.unitQtyInCase || 1);
      return sum + Number(item.outQty || 0) / unitQty;
    }, 0);

    const totalStockCases = openingStockCases + topupStockCases;

    const utilizationPercentage =
      totalStockCases > 0 ? Number(((stockSalesCases / totalStockCases) * 100).toFixed(2)) : 0;

    const selectedTarget =
      normalizedMetric === 'tonnage'
        ? targetTonnage
        : normalizedMetric === 'value'
          ? targetValue
          : targetCases;

    const selectedAchieved =
      normalizedMetric === 'tonnage'
        ? achievedTonnage
        : normalizedMetric === 'value'
          ? achievedValue
          : achievedCases;

    const selectedRemaining = Math.max(selectedTarget - selectedAchieved, 0);

    const lmtdTarget =
      normalizedMetric === 'tonnage'
        ? lmtdTargetTonnage
        : normalizedMetric === 'value'
          ? lmtdTargetValue
          : lmtdTargetCases;

    const lmtdAchieved =
      normalizedMetric === 'tonnage'
        ? lmtdAchievedTonnage
        : normalizedMetric === 'value'
          ? lmtdAchievedValue
          : lmtdAchievedCases;

    const elapsedDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const remainingDays = Math.max(monthEndDate.getDate() - elapsedDays, 1);

    const achievementPercentage =
      targetCases > 0 ? Number(((achievedCases / targetCases) * 100).toFixed(2)) : 0;

    const selectedAchievementPercentage =
      selectedTarget > 0 ? Number(((selectedAchieved / selectedTarget) * 100).toFixed(2)) : 0;

    const lmtdAchievementPercentage =
      lmtdTarget > 0 ? Number(((lmtdAchieved / lmtdTarget) * 100).toFixed(2)) : 0;

    const improvement = Number(
      (selectedAchievementPercentage - lmtdAchievementPercentage).toFixed(2),
    );

    const selectedDecimalPlaces = normalizedMetric === 'tonnage' ? 3 : 2;

    const activityDayMap = new Map<string, any>();
    const visitDayMap = new Map<string, any>();
    const salesDayMap = new Map<string, any>();
    const leaveDayMap = new Map<string, any>();
    const workSessionDayMap = new Map<string, any>();

    for (const item of activities) {
      const start = new Date(item.startTime || item.createdAt);
      const dayKey = formatCalendarDate(start);

      const existing = activityDayMap.get(dayKey) || {
        retailing: 0,
        officialWork: 0,
        totalActivities: 0,
        retailingDurationMs: 0,
        totalDurationMs: 0,
      };

      const isRetailing = item.name === 'Retailing';
      const end = item.endTime ? new Date(item.endTime) : openActivityEnd;
      const durationMs = Math.max(end.getTime() - start.getTime(), 0);

      existing.totalActivities += 1;
      existing.totalDurationMs += durationMs;

      if (isRetailing) {
        existing.retailing += 1;
        existing.retailingDurationMs += durationMs;
      } else {
        existing.officialWork += 1;
      }

      activityDayMap.set(dayKey, existing);
    }

    for (const item of totalVisits) {
      const checkInTime = new Date(item.checkInTime || item.createdAt);
      const dayKey = formatCalendarDate(checkInTime);

      const existing = visitDayMap.get(dayKey) || {
        tc: 0,
        firstCallTime: null,
      };

      existing.tc += 1;

      if (!existing.firstCallTime || checkInTime < new Date(existing.firstCallTime)) {
        existing.firstCallTime = checkInTime;
      }

      visitDayMap.set(dayKey, existing);
    }

    for (const item of sales) {
      const saleDate = new Date(item.date || item.createdAt);
      const dayKey = formatCalendarDate(saleDate);

      const existing = salesDayMap.get(dayKey) || {
        pc: 0,
        upc: new Set<string>(),
        cases: 0,
        tonnage: 0,
        netValue: 0,
        firstPcTime: null,
      };

      existing.pc += 1;

      if (item.customerId) {
        existing.upc.add(item.customerId);
      }

      existing.cases += Number(item.netCases || item.totalCases || 0);
      existing.tonnage += Number(item.totalWeight || 0) / 1000;
      existing.netValue += Number(item.totalValue || 0);

      if (!existing.firstPcTime || saleDate < new Date(existing.firstPcTime)) {
        existing.firstPcTime = saleDate;
      }

      salesDayMap.set(dayKey, existing);
    }

    for (const item of leaves) {
      const leaveDate = new Date(item.createdAt);
      const dayKey = formatCalendarDate(leaveDate);

      const existing = leaveDayMap.get(dayKey) || {
        leave: 0,
      };

      existing.leave += 1;

      leaveDayMap.set(dayKey, existing);
    }

    for (const item of workSessions) {
      const dayStartTime = new Date(item.dayStartTime || item.createdAt);
      const dayKey = formatCalendarDate(dayStartTime);

      const existing = workSessionDayMap.get(dayKey) || {
        dayStarted: 0,
        dayCompleted: 0,
        latestStatus: null,
      };

      existing.dayStarted += 1;

      if (String(item.status ?? '').toUpperCase() === 'COMPLETED') {
        existing.dayCompleted += 1;
      }

      existing.latestStatus = item.status ?? null;

      workSessionDayMap.set(dayKey, existing);
    }

    const avgFirstCallTime = formatAverageTime(
      Array.from(visitDayMap.values()).map((item) => item.firstCallTime),
    );

    const avgFirstPcTime = formatAverageTime(
      Array.from(salesDayMap.values()).map((item) => item.firstPcTime),
    );

    const avgRetailingTime = formatAverageDuration(
      Array.from(activityDayMap.values()).map((item) => item.retailingDurationMs),
    );

    const avgTotalTime = formatAverageDuration(
      Array.from(activityDayMap.values()).map((item) => item.totalDurationMs),
    );

    const dayWiseSummary: SalesmanDayWiseSummaryItem[] = [];
    const dayCursor = new Date(startDate);

    while (dayCursor <= endDate) {
      const dayKey = formatCalendarDate(dayCursor);

      const activity = activityDayMap.get(dayKey) || {};
      const visits = visitDayMap.get(dayKey) || {};
      const daySales = salesDayMap.get(dayKey) || {};
      const leave = leaveDayMap.get(dayKey) || {};
      const workSession = workSessionDayMap.get(dayKey) || {};

      const retailing = Number(activity.retailing || 0);
      const officialWork = Number(activity.officialWork || 0);
      const leaveCount = Number(leave.leave || 0);
      const totalActivities = Number(activity.totalActivities || 0);
      const tcCount = Number(visits.tc || 0);
      const pcCount = Number(daySales.pc || 0);
      const dayStarted = Number(workSession.dayStarted || 0) > 0;

      const hasWorkRecord = dayStarted || totalActivities > 0 || tcCount > 0 || pcCount > 0;

      const absent = leaveCount > 0 || hasWorkRecord ? 0 : 1;

      const dayStatus =
        leaveCount > 0
          ? 'Leave'
          : retailing > 0 || tcCount > 0 || pcCount > 0
            ? 'Retailing'
            : officialWork > 0
              ? 'Official Work'
              : dayStarted
                ? 'Official Work'
                : 'Absent';

      dayWiseSummary.push({
        date: dayKey,
        label: formatDayLabel(dayCursor),
        dayStatus,
        retailing,
        officialWork,
        leave: leaveCount,
        absent,
        totalActivities,
        retailingDuration: formatDurationMinutes(
          Math.max(Math.round(Number(activity.retailingDurationMs || 0) / 60000), 0),
        ),
        totalDuration: formatDurationMinutes(
          Math.max(Math.round(Number(activity.totalDurationMs || 0) / 60000), 0),
        ),
        tc: tcCount,
        pc: pcCount,
        upc: daySales.upc?.size || 0,
        netValue: Number((daySales.netValue || 0).toFixed(2)),
        cases: Number((daySales.cases || 0).toFixed(2)),
        firstCallTime: formatTime(visits.firstCallTime),
        firstPcTime: formatTime(daySales.firstPcTime),
      });

      dayCursor.setDate(dayCursor.getDate() + 1);
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Salesman pocket and target fetched successfully',
      data: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        retailingDays: retailingDayCount,
        avgRetailingTime,
        avgTotalTime,

        target: {
          metric: normalizedMetric,

          selected: {
            target: Number(selectedTarget.toFixed(selectedDecimalPlaces)),
            achieved: Number(selectedAchieved.toFixed(selectedDecimalPlaces)),
            remaining: Number(selectedRemaining.toFixed(selectedDecimalPlaces)),
            achievementPercentage: selectedAchievementPercentage,
            mtd: selectedAchievementPercentage,
            lmtd: lmtdAchievementPercentage,
            improvement,

            crr:
              elapsedDays > 0
                ? Number((selectedAchieved / elapsedDays).toFixed(selectedDecimalPlaces))
                : 0,

            rrr:
              remainingDays > 0
                ? Number((selectedRemaining / remainingDays).toFixed(selectedDecimalPlaces))
                : 0,
          },

          targetCases: Number(targetCases.toFixed(2)),
          achievedCases: Number(achievedCases.toFixed(2)),
          remainingCases: Number(remainingCases.toFixed(2)),

          targetTonnage: Number(targetTonnage.toFixed(3)),
          achievedTonnage: Number(achievedTonnage.toFixed(3)),
          remainingTonnage: Number(remainingTonnage.toFixed(3)),

          targetValue: Number(targetValue.toFixed(2)),
          achievedValue: Number(achievedValue.toFixed(2)),
          remainingValue: Number(remainingValue.toFixed(2)),

          achievementPercentage,

          crr: elapsedDays > 0 ? Number((achievedCases / elapsedDays).toFixed(2)) : 0,

          rrr: remainingDays > 0 ? Number((remainingCases / remainingDays).toFixed(2)) : 0,
        },

        pocket: {
          tc,
          avgTc: retailingDayCount > 0 ? Number((tc / retailingDayCount).toFixed(2)) : 0,
          pc,
          avgPc: retailingDayCount > 0 ? Number((pc / retailingDayCount).toFixed(2)) : 0,
          upc,
          utc,
          totalLinesSold,
          lpc: pc > 0 ? Number((totalLinesSold / pc).toFixed(2)) : 0,
          avgFirstCallTime,
          avgFirstPcTime,
        },

        vanUtilization: {
          openingStockCases: Number(openingStockCases.toFixed(2)),
          topupStockCases: Number(topupStockCases.toFixed(2)),
          totalStockCases: Number(totalStockCases.toFixed(2)),
          salesCases: Number(stockSalesCases.toFixed(2)),
          utilizationPercentage,
        },

        dayWiseSummary,
      },
      offline: true,
    } as ApiResponse<SalesmanPocketTargetResponse>;
  },
  getSalesmanDayWiseSummary: async (params) => {
    const user = useAuthStore.getState().user;

    /**
     * ONLINE MODE
     */
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<SalesmanDayWiseSummaryItem[]>(`/employee/salesman/day-wise-summary`, {
        params,
      }) as Promise<ApiResponse<SalesmanDayWiseSummaryItem[]>>;
    }

    /**
     * OFFLINE MODE
     * Separate calculation, not dependent on getSalesmanPocketAndTarget.
     */
    const ownerId = user?.userId ?? '';

    const parseDate = (value?: string) => {
      const parsed = value ? new Date(value) : new Date();

      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const now = params?.endDate
      ? parseDate(params.endDate)
      : params?.date
        ? parseDate(params.date)
        : new Date();

    const hasDateRange = Boolean(params?.startDate || params?.endDate);

    const startDate = params?.startDate
      ? parseDate(params.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    startDate.setHours(0, 0, 0, 0);

    const endDate = hasDateRange ? parseDate(params?.endDate || params?.startDate) : now;

    endDate.setHours(23, 59, 59, 999);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (endDate > todayEnd) {
      endDate.setTime(todayEnd.getTime());
    }

    const openActivityEnd = endDate.getTime() > Date.now() ? new Date() : endDate;

    const isBetween = (value: unknown, from: Date, to: Date) => {
      if (!value) return false;

      const parsed = new Date(String(value));

      return !Number.isNaN(parsed.getTime()) && parsed >= from && parsed <= to;
    };

    const formatCalendarDate = (value: Date) => {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    const formatDayLabel = (value: Date) =>
      value.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const formatTime = (value?: Date | string | null) => {
      if (!value) return null;

      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) return null;

      return parsedDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    const formatDurationMinutes = (value: number) => {
      if (!Number.isFinite(value) || value < 1) return '< 1 min';

      const hours = Math.floor(value / 60);
      const minutes = value % 60;

      if (!hours) return `${minutes} min${minutes === 1 ? '' : 's'}`;
      if (!minutes) return `${hours} hr${hours === 1 ? '' : 's'}`;

      return `${hours} hr${hours === 1 ? '' : 's'} ${minutes} min${minutes === 1 ? '' : 's'}`;
    };

    const [orderRecords, visitRecords, activityRecords, leaveRecords, workSessionRecords] =
      await Promise.all([
        repositories.orders.findAll(ownerId, { limit: 5000 }),
        repositories.visits.findAll(ownerId, { limit: 5000 }),
        repositories.activities.findAll(ownerId, { limit: 5000 }),
        repositories.leaves.findAll(ownerId, { limit: 5000 }),
        repositories.attendance.findAll(ownerId, { limit: 5000 }),
      ]);

    const sales = orderRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(item.date || item.createdAt, startDate, endDate),
    );

    const visits = visitRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(item.checkInTime || item.createdAt, startDate, endDate),
    );

    const activities = activityRecords.filter(
      (item: any) =>
        ['ACTIVE', 'COMPLETED'].includes(String(item.status ?? '').toUpperCase()) &&
        isBetween(item.startTime || item.createdAt, startDate, endDate),
    );

    const leaves = leaveRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(item.createdAt, startDate, endDate),
    );

    const workSessions = workSessionRecords.filter((item: any) =>
      isBetween(item.dayStartTime || item.createdAt, startDate, endDate),
    );

    const activityDayMap = new Map<string, any>();
    const visitDayMap = new Map<string, any>();
    const salesDayMap = new Map<string, any>();
    const leaveDayMap = new Map<string, any>();
    const workSessionDayMap = new Map<string, any>();

    for (const item of activities) {
      const start = new Date(item.startTime || item.createdAt);
      const dayKey = formatCalendarDate(start);

      const existing = activityDayMap.get(dayKey) || {
        retailing: 0,
        officialWork: 0,
        totalActivities: 0,
        retailingDurationMs: 0,
        totalDurationMs: 0,
      };

      const isRetailing = item.name === 'Retailing';
      const end = item.endTime ? new Date(item.endTime) : openActivityEnd;
      const durationMs = Math.max(end.getTime() - start.getTime(), 0);

      existing.totalActivities += 1;
      existing.totalDurationMs += durationMs;

      if (isRetailing) {
        existing.retailing += 1;
        existing.retailingDurationMs += durationMs;
      } else {
        existing.officialWork += 1;
      }

      activityDayMap.set(dayKey, existing);
    }

    for (const item of visits) {
      const checkInTime = new Date(item.checkInTime || item.createdAt);
      const dayKey = formatCalendarDate(checkInTime);

      const existing = visitDayMap.get(dayKey) || {
        tc: 0,
        firstCallTime: null,
      };

      existing.tc += 1;

      if (!existing.firstCallTime || checkInTime < new Date(existing.firstCallTime)) {
        existing.firstCallTime = checkInTime;
      }

      visitDayMap.set(dayKey, existing);
    }

    for (const item of sales) {
      const saleDate = new Date(item.date || item.createdAt);
      const dayKey = formatCalendarDate(saleDate);

      const existing = salesDayMap.get(dayKey) || {
        pc: 0,
        upc: new Set<string>(),
        cases: 0,
        netValue: 0,
        firstPcTime: null,
      };

      existing.pc += 1;

      if (item.customerId) {
        existing.upc.add(item.customerId);
      }

      existing.cases += Number(item.netCases || item.totalCases || 0);
      existing.netValue += Number(item.totalValue || 0);

      if (!existing.firstPcTime || saleDate < new Date(existing.firstPcTime)) {
        existing.firstPcTime = saleDate;
      }

      salesDayMap.set(dayKey, existing);
    }

    for (const item of leaves) {
      const leaveDate = new Date(item.createdAt);
      const dayKey = formatCalendarDate(leaveDate);

      const existing = leaveDayMap.get(dayKey) || {
        leave: 0,
      };

      existing.leave += 1;

      leaveDayMap.set(dayKey, existing);
    }

    for (const item of workSessions) {
      const dayStartTime = new Date(item.dayStartTime || item.createdAt);
      const dayKey = formatCalendarDate(dayStartTime);

      const existing = workSessionDayMap.get(dayKey) || {
        dayStarted: 0,
        dayCompleted: 0,
        latestStatus: null,
      };

      existing.dayStarted += 1;

      if (String(item.status ?? '').toUpperCase() === 'COMPLETED') {
        existing.dayCompleted += 1;
      }

      existing.latestStatus = item.status ?? null;

      workSessionDayMap.set(dayKey, existing);
    }

    const data: SalesmanDayWiseSummaryItem[] = [];
    const dayCursor = new Date(startDate);

    while (dayCursor <= endDate) {
      const dayKey = formatCalendarDate(dayCursor);

      const activity = activityDayMap.get(dayKey) || {};
      const visitsForDay = visitDayMap.get(dayKey) || {};
      const daySales = salesDayMap.get(dayKey) || {};
      const leave = leaveDayMap.get(dayKey) || {};
      const workSession = workSessionDayMap.get(dayKey) || {};

      const retailing = Number(activity.retailing || 0);
      const officialWork = Number(activity.officialWork || 0);
      const leaveCount = Number(leave.leave || 0);
      const totalActivities = Number(activity.totalActivities || 0);
      const tcCount = Number(visitsForDay.tc || 0);
      const pcCount = Number(daySales.pc || 0);
      const dayStarted = Number(workSession.dayStarted || 0) > 0;

      const hasWorkRecord = dayStarted || totalActivities > 0 || tcCount > 0 || pcCount > 0;

      const absent = leaveCount > 0 || hasWorkRecord ? 0 : 1;

      const dayStatus =
        leaveCount > 0
          ? 'Leave'
          : retailing > 0 || tcCount > 0 || pcCount > 0
            ? 'Retailing'
            : officialWork > 0
              ? 'Official Work'
              : dayStarted
                ? 'Official Work'
                : 'Absent';

      data.push({
        date: dayKey,
        label: formatDayLabel(dayCursor),
        dayStatus,
        retailing,
        officialWork,
        leave: leaveCount,
        absent,
        totalActivities,
        retailingDuration: formatDurationMinutes(
          Math.max(Math.round(Number(activity.retailingDurationMs || 0) / 60000), 0),
        ),
        totalDuration: formatDurationMinutes(
          Math.max(Math.round(Number(activity.totalDurationMs || 0) / 60000), 0),
        ),
        tc: tcCount,
        pc: pcCount,
        upc: daySales.upc?.size || 0,
        netValue: Number((daySales.netValue || 0).toFixed(2)),
        cases: Number((daySales.cases || 0).toFixed(2)),
        firstCallTime: formatTime(visitsForDay.firstCallTime),
        firstPcTime: formatTime(daySales.firstPcTime),
      });

      dayCursor.setDate(dayCursor.getDate() + 1);
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Salesman day wise summary fetched successfully',
      data,
      offline: true,
    } as ApiResponse<SalesmanDayWiseSummaryItem[]>;
  },
  getSalesmanProductSales: async (params) => {
    const user = useAuthStore.getState().user;

    /**
     * ONLINE MODE
     */
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<SalesmanProductSalesResponse>(`/employee/salesman/product-sales`, {
        params,
      }) as Promise<ApiResponse<SalesmanProductSalesResponse>>;
    }

    /**
     * OFFLINE MODE
     */
    const ownerId = user?.userId ?? '';

    const parseDate = (value?: string) => {
      const parsed = value ? new Date(value) : new Date();
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const now = params?.endDate
      ? parseDate(params.endDate)
      : params?.date
        ? parseDate(params.date)
        : new Date();

    const hasDateRange = Boolean(params?.startDate || params?.endDate);

    const startDate = params?.startDate
      ? parseDate(params.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    startDate.setHours(0, 0, 0, 0);

    const endDate = hasDateRange ? parseDate(params?.endDate || params?.startDate) : now;

    endDate.setHours(23, 59, 59, 999);

    const normalizedGroupBy: SalesmanProductSalesGroupBy = [
      'PRIMARYCATEGORY',
      'SECONDARYCATEGORY',
      'SKU',
    ].includes(params?.groupBy || 'PRIMARYCATEGORY')
      ? (params?.groupBy as SalesmanProductSalesGroupBy)
      : 'PRIMARYCATEGORY';

    const isBetween = (value: unknown, from: Date, to: Date) => {
      if (!value) return false;

      const parsed = new Date(String(value));

      return !Number.isNaN(parsed.getTime()) && parsed >= from && parsed <= to;
    };

    const getSaleDate = (item: any) => item.date || item.orderDate || item.createdAt;

    const getCases = (item: any) => {
      if (item.netCases !== undefined && item.netCases !== null) {
        return Number(item.netCases || 0);
      }

      const caseQty = Number(item.caseQty || 0);
      const pieceQty = Number(item.pieceQty || 0);
      const unitQtyInCase = Number(item.unitQtyInCase || 0);

      return caseQty + (unitQtyInCase > 0 ? pieceQty / unitQtyInCase : 0);
    };

    const [orderRecords, saleItemRecords, visitRecords, productRecords, categoryRecords] =
      await Promise.all([
        repositories.orders.findAll(ownerId, { limit: 5000 }),
        repositories.orderItems?.findAll
          ? repositories.orderItems.findAll(ownerId, { limit: 10000 })
          : Promise.resolve([]),
        repositories.visits.findAll(ownerId, { limit: 5000 }),
        repositories.products?.findAll
          ? repositories.products.findAll(ownerId, { limit: 5000 })
          : Promise.resolve([]),
        repositories.categories?.findAll
          ? repositories.categories.findAll(ownerId, { limit: 5000 })
          : Promise.resolve([]),
      ]);

    console.log(categoryRecords);

    const sales = orderRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(getSaleDate(item), startDate, endDate),
    );

    const saleIds = new Set(
      sales
        .map((item: any) => item.saleId || item.orderId || item.uuid)
        .filter(Boolean)
        .map(String),
    );

    const tc = visitRecords.filter(
      (item: any) =>
        String(item.status ?? '').toUpperCase() === 'COMPLETED' &&
        isBetween(item.checkInTime || item.createdAt, startDate, endDate),
    ).length;

    const items = saleItemRecords.filter((item: any) =>
      saleIds.has(String(item.saleId || item.orderId || '')),
    );

    const productMap = new Map<string, any>(
      productRecords
        .map((item: any): [string, any] => [
          String(item.productId || item.uuid || item.id || ''),
          item,
        ])
        .filter(([id]) => Boolean(id)),
    );

    const categoryMap = new Map<string, any>(
      categoryRecords
        .map((item: any): [string, any] => [
          String(item.categoryId || item.uuid || item.id || ''),
          item,
        ])
        .filter(([id]) => Boolean(id)),
    );

    const itemTotals = items.reduce(
      (acc: any, item: any) => {
        acc.totalValue += Number(item.totalValue || 0);
        acc.totalPieces += Number(item.quantity || 0);
        acc.totalCases += getCases(item);

        if (item.productId) {
          acc.skuIds.add(String(item.productId));
        }

        acc.lineCount += 1;

        return acc;
      },
      {
        totalValue: 0,
        totalPieces: 0,
        totalCases: 0,
        skuIds: new Set<string>(),
        lineCount: 0,
      },
    );

    const salesTotalValue = sales.reduce(
      (sum: number, item: any) => sum + Number(item.totalValue || 0),
      0,
    );

    const salesTotalCases = sales.reduce(
      (sum: number, item: any) => sum + Number(item.netCases || item.totalCases || 0),
      0,
    );

    const totalValue = Number(itemTotals.totalValue || salesTotalValue || 0);
    const totalCases = Number(itemTotals.totalCases || salesTotalCases || 0);
    const pc = sales.length;

    const groupMap = new Map<
      string,
      {
        id: string;
        name: string;
        value: number;
        pcs: number;
        cases: number;
      }
    >();

    for (const item of items) {
      const product = productMap.get(String(item.productId || '')) || {};

      const productId = item.productId || product.productId || 'UNKNOWN';
      const productName = item.productName || product.name || 'Unknown';

      const categoryId = item.categoryId || product.categoryId || 'UNKNOWN';
      const parentCategoryId = item.parentCategoryId || product.parentCategoryId || 'UNKNOWN';

      const secondaryCategory = categoryMap.get(String(categoryId)) || {};
      const primaryCategory = categoryMap.get(String(parentCategoryId)) || {};

      let groupId = 'UNKNOWN';
      let groupName = 'Unknown';

      if (normalizedGroupBy === 'SKU') {
        groupId = String(productId || 'UNKNOWN');
        groupName = String(productName || 'Unknown');
      } else if (normalizedGroupBy === 'SECONDARYCATEGORY') {
        groupId = String(categoryId || 'UNKNOWN');
        groupName = String(
          secondaryCategory.name || item.categoryName || product.categoryName || 'Unknown',
        );
      } else {
        console.log(primaryCategory, item, product);
        groupId = String(parentCategoryId || 'UNKNOWN');
        groupName = String(
          primaryCategory.name ||
            item.parentCategoryName ||
            product.parentCategoryName ||
            'Unknown',
        );
      }

      const existing = groupMap.get(groupId) || {
        id: groupId,
        name: groupName,
        value: 0,
        pcs: 0,
        cases: 0,
      };

      existing.value += Number(item.totalValue || 0);
      existing.pcs += Number(item.quantity || 0);
      existing.cases += getCases(item);

      groupMap.set(groupId, existing);
    }

    const categories = Array.from(groupMap.values())
      .sort((a, b) => b.value - a.value)
      .map((item) => ({
        id: item.id || 'UNKNOWN',
        name: item.name || 'Unknown',
        value: Number((item.value || 0).toFixed(2)),
        pcs: Number((item.pcs || 0).toFixed(2)),
        cases: Number((item.cases || 0).toFixed(2)),
        growth:
          totalValue > 0 ? Number(((Number(item.value || 0) / totalValue) * 100).toFixed(2)) : 0,
      }));

    return {
      success: true,
      statusCode: 200,
      message: 'Salesman product sales fetched successfully',
      data: {
        overview: {
          sc: itemTotals.skuIds.size,
          tc: Number(tc || 0),
          pc,
          netValue: Number(totalValue.toFixed(2)),
          cases: Number(totalCases.toFixed(2)),
          lpc: pc > 0 ? Number((Number(itemTotals.lineCount || 0) / pc).toFixed(2)) : 0,
        },
        categories,
      },
      offline: true,
    } as ApiResponse<SalesmanProductSalesResponse>;
  },
  shareSalesmanReport: (type, params) =>
    api.post<SalesmanReportShareResponse, typeof params>(
      `/employee/salesman/share-${type.toLowerCase()}`,
      params,
    ) as Promise<ApiResponse<SalesmanReportShareResponse>>,
  shareSalesmanMSR: (params) => homeService.shareSalesmanReport('MSR', params),
  shareSalesmanMST: (params) => homeService.shareSalesmanReport('MST', params),
  shareSalesmanDSR: (params) => homeService.shareSalesmanReport('DSR', params),
  getSalesmanDispatchOrders: async (params) => {
    const user = useAuthStore.getState().user;

    /**
     * ONLINE MODE
     */
    if (!isSalesman(user) || !isOfflineMode()) {
      return api.get<SalesmanDispatchStatusItem[]>(`/employee/salesman/dispatch-order`, {
        params,
      }) as Promise<ApiResponse<SalesmanDispatchStatusItem[]>>;
    }

    /**
     * OFFLINE MODE
     *
     * Same logic as backend:
     * - default current month
     * - filter completed sales/orders
     * - sort by date desc
     * - map as dispatch order with Pending Dispatch
     */
    const ownerId = user?.userId ?? '';

    const parseDate = (value?: string) => {
      const parsed = value ? new Date(value) : new Date();

      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const now = params?.endDate
      ? parseDate(params.endDate)
      : params?.date
        ? parseDate(params.date)
        : new Date();

    const hasDateRange = Boolean(params?.startDate || params?.endDate);

    const startDate = params?.startDate
      ? parseDate(params.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    startDate.setHours(0, 0, 0, 0);

    const endDate = hasDateRange ? parseDate(params?.endDate || params?.startDate) : now;

    endDate.setHours(23, 59, 59, 999);

    const isBetween = (value: unknown) => {
      if (!value) return false;

      const parsed = new Date(String(value));

      return !Number.isNaN(parsed.getTime()) && parsed >= startDate && parsed <= endDate;
    };

    const orders = await repositories.orders.findAll(ownerId, {
      limit: 5000,
    });

    const data: SalesmanDispatchStatusItem[] = orders
      .filter(
        (order: any) =>
          String(order.status ?? '').toUpperCase() === 'COMPLETED' &&
          isBetween(order.date || order.createdAt),
      )
      .sort((a: any, b: any) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();

        return dateB - dateA;
      })
      .map((order: any): SalesmanDispatchStatusItem => {
        const saleId = String(order.saleId || order.orderId || order.uuid || '');

        return {
          orderId: saleId,
          orderNo: saleId,
          outletName: String(order.customerName || order.outletName || ''),
          outlet: String(order.customerName || order.outletName || ''),
          invoiceNo: saleId,
          status: 'Pending Dispatch',
          orderDate: order.date ? String(order.date) : String(order.createdAt || ''),
          dispatchDate: undefined,
          vehicleNo: order.vanName ? String(order.vanName) : undefined,
          cases: Number(order.netCases || order.totalCases || 0),
          pieces: Number(order.totalPieces || order.totalQty || 0),
          netValue: Number(order.totalValue || 0),
        };
      });

    return {
      success: true,
      statusCode: 200,
      message: 'Salesman dispatch orders fetched successfully',
      data,
      offline: true,
    } satisfies ApiResponse<SalesmanDispatchStatusItem[]>;
  },
  getSalesmanDispatchStatus: (params) => homeService.getSalesmanDispatchOrders(params),
  getManagerStats: (params) => {
    const queryParams = typeof params === 'string' ? { date: params } : params;

    return api.get<ManagerStatsResponse>(`/employee/manager/stats`, {
      params: queryParams,
    }) as Promise<ApiResponse<ManagerStatsResponse>>;
  },
  getManagerTarget: (date?: string) =>
    api.get<ManagerTargetResponse>(`/employee/manager/target`, {
      params: date ? { date } : undefined,
    }) as Promise<ApiResponse<ManagerTargetResponse>>,
  getUserWiseTargetSummary: (date?: string) =>
    api.get<UserWiseTargetSummary[]>(`/employee/manager/user-wise-target`, {
      params: date ? { date } : undefined,
    }) as Promise<ApiResponse<UserWiseTargetSummary[]>>,
  getUboTargetSummary: (date?: string) =>
    api.get<UserWiseTargetSummary[]>(`/employee/manager/ubo-target`, {
      params: date ? { date } : undefined,
    }) as Promise<ApiResponse<UserWiseTargetSummary[]>>,
  getFocusedPackTargetSummary: (date?: string) =>
    api.get<UserWiseTargetSummary[]>(`/employee/manager/focused-pack-target`, {
      params: date ? { date } : undefined,
    }) as Promise<ApiResponse<UserWiseTargetSummary[]>>,
  getUserPrimaryCategoryTargets: (params) =>
    api.get<UserPrimaryCategoryTargetSummary[]>(`/employee/manager/user-primary-category-target`, {
      params,
    }) as Promise<ApiResponse<UserPrimaryCategoryTargetSummary[]>>,
  getUserUboTargets: (params) =>
    api.get<UserUboTargetBreakdown[]>(`/employee/manager/user-ubo-target`, {
      params,
    }) as Promise<ApiResponse<UserUboTargetBreakdown[]>>,
  getUserFocusedPackTargets: (params) =>
    api.get<UserFocusedPackTargetBreakdown[]>(`/employee/manager/user-focused-pack-target`, {
      params,
    }) as Promise<ApiResponse<UserFocusedPackTargetBreakdown[]>>,
  getManagerOrderSummary: (params) =>
    api.get<ManagerOrderSummaryResponse>(`/employee/manager/order-summary`, { params }) as Promise<
      ApiResponse<ManagerOrderSummaryResponse>
    >,
  getManagerTeamCoverage: () =>
    api.get<ManagerTeamCoverageResponse>(`/employee/manager/team-coverage`, {}) as Promise<
      ApiResponse<ManagerTeamCoverageResponse>
    >,
  getManagerBeatOMeter: () =>
    api.get<ManagerBeatOMeterResponse>(`/employee/manager/get-beat-o-meter`, {}) as Promise<
      ApiResponse<ManagerBeatOMeterResponse>
    >,
  getManagerFieldUsers: (params) =>
    api.get<ManagerFieldUserSummary[]>(`/employee/manager/field-user`, {
      params: {
        ...(params?.date ? { date: params.date } : {}),
        ...(params?.searchKey ? { searchKey: params.searchKey } : {}),
        ...(params?.searchKey ? { searchText: params.searchKey } : {}),
        ...(params?.searchText ? { searchText: params.searchText } : {}),
      },
    }) as Promise<ApiResponse<ManagerFieldUserSummary[]>>,
  getManagerUserTimeline: (params) =>
    api.get<ManagerUserTimelineResponse>(`/employee/manager/user-timeline`, {
      params,
    }) as Promise<ApiResponse<ManagerUserTimelineResponse>>,
  getManagerUserMtdSummary: (params) =>
    api.get<ManagerUserMtdSummaryResponse>(`/employee/manager/user-mtd-summary`, {
      params,
    }) as Promise<ApiResponse<ManagerUserMtdSummaryResponse>>,
  getManagerUserRoutePlan: (params) =>
    api.get<ManagerUserRoutePlanResponse>(`/employee/manager/user-route-plan`, {
      params,
    }) as Promise<ApiResponse<ManagerUserRoutePlanResponse>>,
};