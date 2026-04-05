// app/customers/[id].tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppButton, AppText } from '@/core/components';
import { CUSTOMERS_DATA } from '../constants/mockData';
import { useOutletDetailStyles } from '../styles/OutletDetail.styles';
import { OutletAvatar, OutletStatusBadge } from '../components/outlet';
import { outletService } from '../services/outlet.service';
import { useAuthStore } from '@/core/store/auth.store';
import { Outlet } from '../types/outlet.types';
import { useOutletStore } from '@/core/store/outlet.store';

// Types based on schema
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'cancelled';
  items: number;
}

interface Transaction {
  id: string;
  date: string;
  type: 'payment' | 'credit' | 'debit';
  amount: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

interface Activity {
  id: string;
  type: 'order' | 'visit' | 'payment' | 'note';
  title: string;
  description: string;
  date: string;
  amount?: string;
}

interface Customer {
  customerId: string;
  name: string;
  ownerName: string;
  phoneNumber: string;
  address: {
    line1: string;
    line2?: string;
  };
  creditLimit: number;
  outstanding: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  customerCategoryId: string;
  channelId: string;
  customerTypeId: string;
  marketId: string;
  provinceId: string;
  segmentation: string;
  geoTag?: {
    lat: number;
    lng: number;
  };
  createdAt?: string;
  updatedAt?: string;
  orders?: Order[];
  transactions?: Transaction[];
  contacts?: Contact[];
  recentActivity?: Activity[];
  tags?: string[];
  totalOrders?: number;
  totalValue?: string;
  creditDays?: number;
  nextVisit?: string;
  lastVisit?: string;
}

type TabType = 'overview' | 'orders' | 'transactions' | 'contacts' | 'activity';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'information-circle-outline' },
  { key: 'orders', label: 'Orders', icon: 'cart-outline' },
  { key: 'transactions', label: 'Transactions', icon: 'swap-horizontal-outline' },
  { key: 'contacts', label: 'Contacts', icon: 'people-outline' },
  { key: 'activity', label: 'Activity', icon: 'time-outline' },
];

export default function CustomerDetailScreen() {
  const { colors } = useTheme();
  const styles = useOutletDetailStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<Outlet | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const route = useAuthStore((s) => s.selectedRoute);
  const activeVisit = useOutletStore((s) => s.activeVisit);

  const setSelectedOutlet = useOutletStore((s) => s.setSelectedOutlet);
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const loadCustomerData = async () => {
    const response: any = await outletService.getOutletDetail(id);
    setCustomer(response?.data);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomerData();
    setRefreshing(false);
  }, [id]);

  const handleLink = useCallback(async (url: string, errorMsg: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      supported ? await Linking.openURL(url) : Alert.alert('Error', errorMsg);
    } catch {
      Alert.alert('Error', errorMsg);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!customer) return;
    const {
      name,
      ownerName,
      address,
      phoneNumber,
      creditLimit,
      outstanding,
      segmentation,
      status,
    } = customer;

    await Share.share({
      message: `📋 *Customer Details*\n━━━━━━━━━━━━━━━━━━━━━\n🏢 *Name:* ${name}\n👤 *Owner:* ${ownerName}\n📍 *Address:* ${address.line1}${address.line2 ? ', ' + address.line2 : ''}\n📞 *Phone:* ${phoneNumber}\n🏷️ *Type:* ${segmentation}\n💰 *Credit Limit:* ${creditLimit ? `₹${creditLimit.toLocaleString()}` : 'N/A'}\n💵 *Outstanding:* ${outstanding ? `₹${outstanding.toLocaleString()}` : 'N/A'}\n📊 *Status:* ${status}`,
      title: name,
    });
  }, [customer]);

  const handleEdit = useCallback(
    () => customer?.customerId && router.push(`/customers/edit/${customer.customerId}`),
    [customer],
  );

  const handleDelete = useCallback(() => {
    if (!customer) return;
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Add your delete logic here
            Alert.alert('Success', 'Customer deleted successfully');
            router.back();
          },
        },
      ],
    );
  }, [customer]);

  const handleVisit = useCallback(async () => {
    setSelectedOutlet(customer);
    if (!activeVisit?.visitId) {
      const payload: any = {
        routeSessionId: route?.routeSessionId,
        workSessionId: route?.workSessionId,
        vanId: route?.vanId,
        outletId: customer?.customerId,
        // sequence: 1,
      };
      const response = await outletService.startVisit(payload);
      if (response.success) {
        const visit = response?.data;
        // ✅ map backend → store
        setActiveVisit({
          visitId: visit.visitId,
          outlet: customer as any,
          checkInTime: new Date(visit.checkInTime),
          checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
          status: visit.status,
          routeSessionId: visit?.routeSessionId,
        });
        router.push(`/outlets/${customer?.customerId}/visit`);
      }
    } else {
      router.push(`/outlets/${customer?.customerId}/visit`);
    }
  }, [customer, setSelectedOutlet]);

  const visitStatus = async () => {
    const query: any = {
      workSessionId: route?.workSessionId,
      vanId: route?.vanId,
      routeSessionId: route?.routeSessionId,
      outletId: route?.routeId,
    };
    const response = await outletService.visitStatus(query);
  };

  // useEffect(() => {
  //   if (customer) {
  //     navigation.setOptions({
  //       title: customer.name,
  //       headerRight: () => (
  //         <View style={styles.headerActions}>
  //           <TouchableOpacity onPress={handleShare} style={styles.headerButton} activeOpacity={0.7}>
  //             <Ionicons name="share-outline" size={22} color={colors.primary} />
  //           </TouchableOpacity>
  //           <TouchableOpacity onPress={handleEdit} style={styles.headerButton} activeOpacity={0.7}>
  //             <Ionicons name="create-outline" size={22} color={colors.primary} />
  //           </TouchableOpacity>
  //         </View>
  //       ),
  //     });
  //   }
  // }, [navigation, customer, handleShare, handleEdit]);

  if (isLoading) return <LoadingState styles={styles} colors={colors} />;
  if (!customer) return <EmptyState styles={styles} />;

  // Calculate distance if needed (mock value - you'll need actual distance calculation)
  const distanceValue = 2.5; // This should come from your actual distance calculation logic

  const startVisit = async () => {};

  return (
    <View style={styles.container}>
      <CustomerHeader
        customer={customer}
        styles={styles}
        colors={colors}
        distanceValue={distanceValue}
        onVisit={handleVisit}
      />
      <StatsRow customer={customer} styles={styles} colors={colors} />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} styles={styles} colors={colors} />
      <TabContent
        activeTab={activeTab}
        customer={customer}
        styles={styles}
        colors={colors}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEdit={handleEdit}
        onShare={handleShare}
        onDelete={handleDelete}
        onVisit={handleVisit}
      />

      {/* Floating Action Button for Quick Visit */}
      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={handleVisit}
        activeOpacity={0.9}
      >
        <Ionicons name="navigate" size={24} color="#FFFFFF" />
        {activeVisit ? (
          <AppText style={styles.floatingButtonText}>Complete Visit</AppText>
        ) : (
          <AppText style={styles.floatingButtonText}>Start Visit</AppText>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Sub-components
const LoadingState = ({ styles, colors }: any) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
    <AppText style={styles.loadingText}>Loading...</AppText>
  </View>
);

const EmptyState = ({ styles }: any) => (
  <View style={styles.emptyState}>
    <Ionicons name="alert-circle-outline" size={64} color={styles.emptyState.color} />
    <AppText style={styles.emptyStateTitle}>Customer Not Found</AppText>
    <AppText style={styles.emptyStateText}>The customer doesn't exist or was removed.</AppText>
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.emptyStateButton}
      activeOpacity={0.8}
    >
      <AppText style={styles.emptyStateButtonText}>Go Back</AppText>
    </TouchableOpacity>
  </View>
);

const CustomerHeader = ({ customer, styles, colors, distanceValue, onVisit }: any) => (
  <View style={styles.detailHeader}>
    <OutletAvatar outlet={customer} />
    <View style={styles.detailHeaderInfo}>
      <View style={styles.detailTitleRow}>
        <AppText style={styles.detailName} numberOfLines={1}>
          {customer.name}
        </AppText>
        <OutletStatusBadge status={customer.status} />
      </View>
      <AppText style={styles.detailOwner}>{customer.ownerName}</AppText>
      <View style={styles.detailLocationRow}>
        <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
        <AppText style={styles.detailLocation} numberOfLines={1}>
          {customer.address?.line1}
        </AppText>
      </View>
      <View style={styles.detailDistanceRow}>
        <Ionicons name="navigate-outline" size={14} color={colors.textTertiary} />
        <AppText style={styles.detailDistance}>{distanceValue.toFixed(1)} km away</AppText>
      </View>
    </View>
    {/* Visit Button added in header */}
    {/* <TouchableOpacity style={styles.visitButton} onPress={onVisit} activeOpacity={0.8}>
      <Ionicons name="navigate" size={20} color={colors.primary} />
      <AppText style={[styles.visitButtonText, { color: colors.primary }]}>Visit</AppText>
    </TouchableOpacity> */}
  </View>
);

const StatsRow = ({ customer, styles, colors }: any) => (
  <View style={styles.detailStatsRow}>
    {[
      {
        icon: 'cash-outline',
        value: customer.creditLimit ? `₹${customer.creditLimit.toLocaleString()}` : 'N/A',
        label: 'Credit Limit',
        color: colors.primary,
      },
      {
        icon: 'cart-outline',
        value: customer.totalOrders?.toString() || '0',
        label: 'Orders',
        color: colors.primary,
      },
      {
        icon: 'wallet-outline',
        value: customer.outstanding ? `₹${customer.outstanding.toLocaleString()}` : 'N/A',
        label: 'Outstanding',
        color: colors.warning,
      },
    ].map((stat, i) => (
      <View key={i} style={styles.detailStatCard}>
        <Ionicons name={stat.icon as any} size={22} color={stat.color} />
        <AppText style={styles.detailStatValue}>{stat.value}</AppText>
        <AppText style={styles.detailStatLabel}>{stat.label}</AppText>
      </View>
    ))}
  </View>
);

const TabBar = ({ activeTab, setActiveTab, styles, colors }: any) => (
  <View style={styles.tabBar}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => setActiveTab(tab.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={tab.icon as any}
            size={18}
            color={activeTab === tab.key ? colors.primary : colors.textSecondary}
          />
          <AppText style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const TabContent = ({
  activeTab,
  customer,
  styles,
  colors,
  refreshing,
  onRefresh,
  onEdit,
  onShare,
  onDelete,
  onVisit,
}: any) => (
  <ScrollView
    style={styles.tabContent}
    showsVerticalScrollIndicator={false}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  >
    {activeTab === 'overview' && (
      <OverviewTab
        customer={customer}
        styles={styles}
        colors={colors}
        onEdit={onEdit}
        onShare={onShare}
        onDelete={onDelete}
        onVisit={onVisit}
      />
    )}
    {activeTab === 'orders' && (
      <OrdersTab orders={customer.orders || []} styles={styles} colors={colors} />
    )}
    {activeTab === 'transactions' && (
      <TransactionsTab transactions={customer.transactions || []} styles={styles} colors={colors} />
    )}
    {activeTab === 'contacts' && (
      <ContactsTab contacts={customer.contacts || []} styles={styles} colors={colors} />
    )}
    {activeTab === 'activity' && (
      <ActivityTab activities={customer.recentActivity || []} styles={styles} colors={colors} />
    )}
  </ScrollView>
);

// Tab Components
const OverviewTab = ({ customer, styles, colors, onEdit, onShare, onDelete, onVisit }: any) => (
  <View>
    <View style={styles.detailStatsRow}>
      {[
        {
          icon: 'trending-up-outline',
          value: customer.totalValue || 'N/A',
          label: 'Total Value',
          color: colors.success,
        },
        {
          icon: 'time-outline',
          value: customer.creditDays ? `${customer.creditDays}d` : 'N/A',
          label: 'Credit Days',
          color: colors.primary,
        },
        {
          icon: 'calendar-outline',
          value: customer.nextVisit || 'N/A',
          label: 'Next Visit',
          color: colors.primary,
        },
      ].map((stat, i) => (
        <View key={i} style={styles.detailStatCard}>
          <Ionicons name={stat.icon as any} size={22} color={stat.color} />
          <AppText style={styles.detailStatValue}>{stat.value}</AppText>
          <AppText style={styles.detailStatLabel}>{stat.label}</AppText>
        </View>
      ))}
    </View>

    {customer.tags?.length > 0 && (
      <Section title="Tags" styles={styles}>
        <View style={styles.detailTagsContainer}>
          {customer.tags.map((tag: string, i: number) => (
            <View key={i} style={styles.detailTag}>
              <AppText style={styles.detailTagText}>{tag}</AppText>
            </View>
          ))}
        </View>
      </Section>
    )}

    <Section title="Business Details" styles={styles}>
      {[
        { label: 'Business Type', value: customer.customerTypeId || 'N/A' },
        { label: 'Category', value: customer.customerCategoryId || 'N/A' },
        { label: 'Channel', value: customer.channelId || 'N/A' },
        { label: 'Market', value: customer.marketId || 'N/A' },
        { label: 'Province', value: customer.provinceId || 'N/A' },
        { label: 'Segmentation', value: customer.segmentation || 'N/A' },
        {
          label: 'Credit Limit',
          value: customer.creditLimit ? `₹${customer.creditLimit.toLocaleString()}` : 'N/A',
        },
        {
          label: 'Outstanding',
          value: customer.outstanding ? `₹${customer.outstanding.toLocaleString()}` : 'N/A',
        },
        { label: 'Last Visit', value: customer.lastVisit || 'N/A' },
        { label: 'Total Orders', value: customer.totalOrders?.toString() || '0' },
      ].map((item, i) => (
        <InfoRow key={i} {...item} styles={styles} />
      ))}
    </Section>

    <Section title="Contact Information" styles={styles}>
      {[
        {
          icon: 'call-outline',
          color: colors.primary,
          label: customer.phoneNumber,
          url: `tel:${customer.phoneNumber}`,
        },
        {
          icon: 'logo-whatsapp',
          color: colors.success,
          label: customer.phoneNumber,
          url: `https://wa.me/${customer.phoneNumber.replace(/[^0-9]/g, '')}`,
        },
        {
          icon: 'location-outline',
          color: colors.primary,
          label: `${customer.address?.line1}${customer.address?.line2 ? ', ' + customer.address.line2 : ''}`,
          url: getMapUrl(customer.address),
        },
      ].map((contact, i) => (
        <ContactRow key={i} {...contact} styles={styles} colors={colors} />
      ))}
    </Section>

    <ActionButtons
      styles={styles}
      colors={colors}
      onEdit={onEdit}
      onShare={onShare}
      onDelete={onDelete}
      onVisit={onVisit}
    />
    <View style={{ height: 40 }} />
  </View>
);

const OrdersTab = ({ orders, styles, colors }: any) => {
  if (!orders || orders.length === 0)
    return (
      <EmptyTab
        icon="cart-outline"
        title="No Orders"
        message="No orders found for this customer"
        styles={styles}
        colors={colors}
      />
    );

  return (
    <View style={styles.tabContentContainer}>
      {orders.map((order: any) => (
        <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.7}>
          <View style={styles.orderHeader}>
            <View>
              <AppText style={styles.orderNumber}>#{order.orderNumber}</AppText>
              <AppText style={styles.orderDate}>{order.date}</AppText>
            </View>
            <View
              style={[
                styles.orderStatusBadge,
                styles[
                  `orderStatus${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`
                ],
              ]}
            >
              <AppText style={styles.orderStatusText}>{order.status.toUpperCase()}</AppText>
            </View>
          </View>
          <View style={styles.orderDetails}>
            <View style={styles.orderDetailItem}>
              <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
              <AppText style={styles.orderDetailText}>{order.items} items</AppText>
            </View>
            <AppText style={styles.orderAmount}>{order.amount}</AppText>
          </View>
          <View style={styles.viewOrderButton}>
            <AppText style={styles.viewOrderText}>View Details</AppText>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const TransactionsTab = ({ transactions, styles, colors }: any) => {
  if (!transactions || transactions.length === 0)
    return (
      <EmptyTab
        icon="swap-horizontal-outline"
        title="No Transactions"
        message="No transactions found for this customer"
        styles={styles}
        colors={colors}
      />
    );

  return (
    <View style={styles.tabContentContainer}>
      {transactions.map((tx: any) => (
        <View key={tx.id} style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionIconContainer}>
              <Ionicons
                name={tx.type === 'payment' ? 'arrow-down-outline' : 'arrow-up-outline'}
                size={18}
                color={tx.type === 'payment' ? colors.success : colors.error}
              />
            </View>
            <View style={styles.transactionInfo}>
              <AppText style={styles.transactionDescription}>{tx.description}</AppText>
              <AppText style={styles.transactionDate}>{tx.date}</AppText>
            </View>
            <View style={styles.transactionAmountContainer}>
              <AppText
                style={[
                  styles.transactionAmount,
                  tx.type === 'payment'
                    ? styles.transactionAmountPositive
                    : styles.transactionAmountNegative,
                ]}
              >
                {tx.type === 'payment' ? '+' : '-'}
                {tx.amount}
              </AppText>
              <View
                style={[
                  styles.transactionStatusBadge,
                  styles[
                    `transactionStatus${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}`
                  ],
                ]}
              >
                <AppText style={styles.transactionStatusText}>{tx.status}</AppText>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const ContactsTab = ({ contacts, styles, colors }: any) => {
  if (!contacts || contacts.length === 0)
    return (
      <EmptyTab
        icon="people-outline"
        title="No Contacts"
        message="No contacts found for this customer"
        styles={styles}
        colors={colors}
      />
    );

  return (
    <View style={styles.tabContentContainer}>
      {contacts.map((contact: any) => (
        <View key={contact.id} style={styles.contactCard}>
          <View style={styles.contactAvatar}>
            <AppText style={styles.contactInitials}>
              {contact.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AppText>
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactNameRow}>
              <AppText style={styles.contactName}>{contact.name}</AppText>
              {contact.isPrimary && (
                <View style={styles.primaryBadge}>
                  <AppText style={styles.primaryBadgeText}>Primary</AppText>
                </View>
              )}
            </View>
            <AppText style={styles.contactRole}>{contact.role}</AppText>
            <View style={styles.contactActions}>
              {[
                {
                  icon: 'call-outline',
                  action: () => Linking.openURL(`tel:${contact.phone}`),
                  label: 'Call',
                },
                {
                  icon: 'mail-outline',
                  action: () => Linking.openURL(`mailto:${contact.email}`),
                  label: 'Email',
                },
              ].map((action, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.contactActionButton}
                  onPress={action.action}
                  activeOpacity={0.7}
                >
                  <Ionicons name={action.icon as any} size={14} color={colors.primary} />
                  <AppText style={styles.contactActionText}>{action.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const ActivityTab = ({ activities, styles, colors }: any) => {
  if (!activities || activities.length === 0)
    return (
      <EmptyTab
        icon="time-outline"
        title="No Activity"
        message="No recent activity found"
        styles={styles}
        colors={colors}
      />
    );

  const getActivityIcon = (type: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      order: { icon: 'cart-outline', color: colors.primary },
      visit: { icon: 'calendar-outline', color: colors.success },
      payment: { icon: 'cash-outline', color: colors.warning },
      note: { icon: 'document-text-outline', color: colors.info },
    };
    return icons[type] || { icon: 'information-circle-outline', color: colors.textTertiary };
  };

  return (
    <View style={styles.tabContentContainer}>
      {activities.map((activity: any) => {
        const { icon, color } = getActivityIcon(activity.type);
        return (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={18} color={color} />
            </View>
            <View style={styles.activityContent}>
              <AppText style={styles.activityTitle}>{activity.title}</AppText>
              <AppText style={styles.activityDescription}>{activity.description}</AppText>
              <AppText style={styles.activityDate}>{activity.date}</AppText>
              {activity.amount && (
                <AppText style={styles.activityAmount}>Amount: {activity.amount}</AppText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// Reusable Components
const Section = ({ title, children, styles }: any) => (
  <View style={styles.detailSection}>
    <AppText style={styles.detailSectionTitle}>{title}</AppText>
    {children}
  </View>
);

const InfoRow = ({ label, value, optional, styles }: any) => (
  <View style={styles.detailInfoRow}>
    <AppText style={styles.detailInfoLabel}>{label}</AppText>
    <AppText
      style={[
        styles.detailInfoValue,
        optional && value === 'Not Available' && styles.optionalValue,
      ]}
    >
      {value}
    </AppText>
  </View>
);

const ContactRow = ({ icon, color, label, url, styles, colors }: any) => (
  <TouchableOpacity
    style={styles.detailContactRow}
    onPress={() => Linking.openURL(url)}
    activeOpacity={0.7}
  >
    <View style={styles.detailContactIcon}>
      <Ionicons name={icon as any} size={18} color={color} />
    </View>
    <AppText style={styles.detailContactText} numberOfLines={1}>
      {label}
    </AppText>
    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
  </TouchableOpacity>
);

// Updated Action Buttons Component with Visit button
const ActionButtons = ({ styles, colors, onEdit, onShare, onDelete, onVisit }: any) => {
  return (
    <View style={styles.actionButtonsContainer}>
      {/* Secondary Actions Row */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.actionButtonSecondary, styles.actionButtonEdit]}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <AppText style={[styles.actionButtonText, { color: colors.primary }]}>Edit</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButtonSecondary, styles.actionButtonShare]}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.primary} />
          <AppText style={[styles.actionButtonText, { color: colors.primary }]}>Share</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButtonSecondary, styles.actionButtonDelete]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <AppText style={[styles.actionButtonText, { color: colors.error }]}>Delete</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EmptyTab = ({ icon, title, message, styles, colors }: any) => (
  <View style={styles.emptyTabContainer}>
    <Ionicons name={icon} size={56} color={colors.textTertiary} />
    <AppText style={styles.emptyTabTitle}>{title}</AppText>
    <AppText style={styles.emptyTabText}>{message}</AppText>
  </View>
);

// Updated Helper function
const getMapUrl = (address: { line1: string; line2?: string } | undefined) => {
  if (!address) return 'https://maps.google.com';
  const addressString = `${address.line1}${address.line2 ? ', ' + address.line2 : ''}`;
  const encoded = encodeURIComponent(addressString);
  return Platform.select({
    ios: `maps:0,0?q=${encoded}`,
    android: `geo:0,0?q=${encoded}`,
    default: `https://maps.google.com/?q=${encoded}`,
  });
};
