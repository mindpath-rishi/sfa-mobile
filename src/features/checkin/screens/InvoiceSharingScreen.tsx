import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInvoiceSharingStyles } from '../styles/InvoiceSharing.styles';

// Mock invoice data
const MOCK_INVOICE = {
  id: '996/25-26/100030',
  customer: 'John Shop',
  date: '21 Oct 2025',
  amount: 39.17,
  currency: 'ZMW',
  items: [
    { name: 'Product 1', quantity: 2, price: 19.585 },
    { name: 'Product 2', quantity: 1, price: 19.585 },
  ],
};

export default function InvoiceSharingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useInvoiceSharingStyles();
  const params = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState<'print' | 'share' | null>(null);

  // Get invoice data from params or use mock
  const invoice = params.invoice ? JSON.parse(params.invoice as string) : MOCK_INVOICE;

  const handlePrint = () => {
    setSelectedOption('print');
    // Handle print logic here
    Alert.alert('Print', 'Printing functionality will be implemented here');
  };

  const handleShare = async () => {
    setSelectedOption('share');
    try {
      const result = await Share.share({
        message: `Invoice ${invoice.id}\nCustomer: ${invoice.customer}\nDate: ${invoice.date}\nAmount: ${invoice.currency} ${invoice.amount.toFixed(2)}`,
        title: 'Invoice Details',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Invoice shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share invoice');
    }
  };

  const handleProceed = () => {
    if (!selectedOption) {
      Alert.alert('Select Option', 'Please select Print or Share to continue');
      return;
    }

    // Navigate based on selected option
    if (selectedOption === 'print') {
      // Navigate to print preview or handle print
      Alert.alert('Print', 'Proceeding with print...');
    } else {
      // Share is already handled, maybe navigate to success screen
      Alert.alert('Share', 'Invoice shared successfully');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Instruction Text */}
        <Text style={styles.instruction}>
          Share your order/invoice confirmation with your depot distributor/manager or print (if
          mobile printer is available)
        </Text>

        {/* Options Card */}
        <AppCard variant="elevated" padding="lg" style={styles.optionsCard}>
          {/* Print Option */}
          <TouchableOpacity
            style={[styles.optionItem, selectedOption === 'print' && styles.optionSelected]}
            onPress={handlePrint}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="print" size={28} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.optionTitle}>Print</Text>
                <Text style={styles.optionDescription}>Print invoice if printer is available</Text>
              </View>
            </View>
            {selectedOption === 'print' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border + '30' }]} />

          {/* Share Option */}
          <TouchableOpacity
            style={[styles.optionItem, selectedOption === 'share' && styles.optionSelected]}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="share-social" size={28} color={colors.success} />
              </View>
              <View>
                <Text style={styles.optionTitle}>Share</Text>
                <Text style={styles.optionDescription}>
                  Share invoice via WhatsApp, Email, etc.
                </Text>
              </View>
            </View>
            {selectedOption === 'share' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            )}
          </TouchableOpacity>
        </AppCard>

        {/* Invoice Preview (Optional) */}
        <AppCard variant="elevated" padding="md" style={styles.previewCard}>
          <Text style={styles.previewTitle}>Invoice Preview</Text>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Invoice No:</Text>
            <Text style={styles.previewValue}>{invoice.id}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Customer:</Text>
            <Text style={styles.previewValue}>{invoice.customer}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Date:</Text>
            <Text style={styles.previewValue}>{invoice.date}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Amount:</Text>
            <Text style={[styles.previewValue, styles.previewAmount]}>
              {invoice.currency} {invoice.amount.toFixed(2)}
            </Text>
          </View>
        </AppCard>
      </ScrollView>

      {/* Proceed Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[styles.proceedButton, { backgroundColor: colors.primary }]}
          onPress={handleProceed}
          activeOpacity={0.9}
        >
          <Text style={styles.proceedButtonText}>Proceed →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
