// InvoiceSharingScreen.tsx - Clean UI, Details only in PDF
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  BackHandler,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInvoiceSharingStyles } from '../styles/InvoiceSharing.styles';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ConfirmationModal } from '@/core/components';
import { useInvoiceStore } from '@/core/store/invoice.store';

export default function InvoiceSharingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useInvoiceSharingStyles();
  const params = useLocalSearchParams();
  const latestInvoice = useInvoiceStore((s) => s.latestInvoice);
  const [selectedOption, setSelectedOption] = useState<'print' | 'share' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bottomBarHeight, setBottomBarHeight] = useState(0);

  const invoice = useMemo(() => {
    if (latestInvoice) return latestInvoice;

    try {
      return params.invoice ? JSON.parse(params.invoice as string) : null;
    } catch (error) {
      console.error('Failed to parse invoice data:', error);
      return null;
    }
  }, [latestInvoice, params.invoice]);

  // Get customerId from params or invoice data
  const customerId = (params.customerId as string) || invoice?.customerId || 'CUST0001';

  const handleBackNavigation = () => {
    // Step 1: go to outlets root
    router.replace('/route');
  };

  // Handle hardware back button (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackNavigation();
      return true;
    });

    return () => backHandler.remove();
  }, [customerId]);

  if (!invoice) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 16, textAlign: 'center' }}>
          Preparing invoice...
        </Text>
        <TouchableOpacity onPress={handleBackNavigation} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Company Details (ONLY in PDF, not in UI)
  const companyDetails = {
    name: 'TRADEKINGS ZAMBIA',
    address: 'Plot 1234, Great East Road, Lusaka, Zambia',
    phone: '+260 211 123456',
    email: 'info@abcdistributors.com',
    website: 'www.abcdistributors.com',
    taxId: '1001234567',
    vatNumber: 'VG123456789',
  };

  // Generate PDF HTML with detailed item breakdown
  const generateInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${companyDetails.name} - Invoice ${invoice.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding: 40px;
            margin: 0;
            color: #333;
            background: #f5f5f5;
          }
          .invoice-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .company-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .company-name {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 10px;
          }
          .company-tagline {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 15px;
          }
          .company-details {
            font-size: 11px;
            opacity: 0.85;
            line-height: 1.6;
          }
          .invoice-title {
            background: #f8f9fa;
            padding: 15px;
            text-align: center;
            border-bottom: 1px solid #dee2e6;
          }
          .invoice-title h2 {
            color: #1e3c72;
            font-size: 24px;
            margin: 0;
          }
          .content {
            padding: 30px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
          }
          .info-box {
            flex: 1;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 11px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            font-size: 14px;
            margin-bottom: 10px;
            color: #333;
            font-weight: 500;
          }
          .payment-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
          }
          .status-paid {
            background: #28a745;
            color: white;
          }
          .status-credit {
            background: #ffc107;
            color: #333;
          }
          .status-partial {
            background: #17a2b8;
            color: white;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          th {
            background-color: #f8f9fa;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            color: #555;
            border-bottom: 2px solid #dee2e6;
          }
          td {
            padding: 10px 8px;
            border-bottom: 1px solid #dee2e6;
            vertical-align: top;
          }
          .product-name {
            font-weight: 600;
            color: #333;
          }
          .product-details {
            font-size: 10px;
            color: #666;
            margin-top: 4px;
          }
          .totals-section {
            text-align: right;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
          }
          .total-row {
            margin-bottom: 8px;
            font-size: 13px;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #1e3c72;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #1e3c72;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #dee2e6;
          }
          @media print {
            body {
              padding: 0;
              background: white;
            }
            .invoice-container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Company Header -->
          <div class="company-header">
            <div class="company-name">${companyDetails.name}</div>
            <div class="company-tagline">Your Trusted Distribution Partner</div>
            <div class="company-details">
              ${companyDetails.address}<br>
              📞 ${companyDetails.phone} | ✉️ ${companyDetails.email}<br>
              🌐 ${companyDetails.website} | VAT: ${companyDetails.vatNumber} | TIN: ${companyDetails.taxId}
            </div>
          </div>
          
          <div class="invoice-title">
            <h2>TAX INVOICE</h2>
          </div>
          
          <div class="content">
            <div class="info-section">
              <div class="info-box">
                <div class="info-label">Invoice Number</div>
                <div class="info-value">${invoice.invoiceNumber || invoice.id}</div>
                <div class="info-label">Invoice Date</div>
                <div class="info-value">${invoice.date}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Bill To</div>
                <div class="info-value">${invoice.customer}</div>
                <div class="info-label">Customer ID</div>
                <div class="info-value">${invoice.customerId || 'N/A'}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Payment Status</div>
                <div class="info-value">
                  <span class="payment-status ${invoice.status === 'PAID' ? 'status-paid' : invoice.status === 'CREDIT' ? 'status-credit' : 'status-partial'}">
                    ${invoice.status}
                  </span>
                </div>
                <div class="info-label">Payment Mode</div>
                <div class="info-value">${invoice.paymentMode}</div>
              </div>
            </div>
            
            <!-- Detailed Items Table -->
            <table>
              <thead>
                <tr>
                  <th width="35%">Product</th>
                  <th width="15%">Pieces</th>
                  <th width="15%">Piece Price</th>
                  <th width="20%">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item: any) => `
                  <tr>
                    <td>
                      <div class="product-name">${item.name}</div>
                      <div class="product-details">
                        ${item.caseQty > 0 ? `${item.caseQty} cases × ${item.unitQtyInCase || 1} pcs/case` : ''}
                        ${item.caseQty > 0 && item.pieceQty > 0 ? ' + ' : ''}
                        ${item.pieceQty > 0 ? `${item.pieceQty} pcs` : ''}
                      </div>
                    </td>
                    <td>${item.quantity || 0}</td>
                    <td>${invoice.currency} ${(item.price / (item.unitQtyInCase || 1)).toFixed(2)}</td>
                    <td>${invoice.currency} ${item.total.toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>

            <!-- Summary Table -->
            <table style="width: auto; margin-left: auto; margin-top: 20px;">
              <tbody>
                <tr>
                  <td style="border: none; text-align: right; font-weight: bold;">Total Cases:</td>
                  <td style="border: none; text-align: right;">${invoice.summary.totalCases || 0}</td>
                </tr>
                <tr>
                  <td style="border: none; text-align: right; font-weight: bold;">Total Pieces:</td>
                  <td style="border: none; text-align: right;">${invoice.summary.totalPieces || 0}</td>
                </tr>
                <tr>
                  <td style="border: none; text-align: right; font-weight: bold;">Total Quantity:</td>
                  <td style="border: none; text-align: right;">${invoice.summary.totalQty || 0}</td>
                </tr>
                <tr>
                  <td style="border: none; text-align: right; font-weight: bold;">Total Net Weight:</td>
                  <td style="border: none; text-align: right;">${invoice.summary.totalNetWeight || 0} kg</td>
                </tr>
              </tbody>
            </table>
            
            <div class="totals-section">
              <div class="total-row">
                <strong>Subtotal:</strong> ${invoice.currency} ${invoice.summary.subtotal.toFixed(2)}
              </div>
              <div class="total-row">
                <strong>VAT (0%):</strong> ${invoice.currency} ${invoice.summary.tax.toFixed(2)}
              </div>
              <div class="grand-total">
                Total Amount: ${invoice.currency} ${invoice.summary.total.toFixed(2)}
              </div>
              ${
                invoice.paidAmount < invoice.summary.total
                  ? `
                <div class="total-row">
                  <strong>Paid Amount:</strong> ${invoice.currency} ${invoice.paidAmount.toFixed(2)}
                </div>
                <div class="total-row">
                  <strong>Balance Due:</strong> ${invoice.currency} ${invoice.pendingAmount.toFixed(2)}
                </div>
              `
                  : ''
              }
            </div>

            ${
              invoice.paymentDetails
                ? `
              <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <strong>Remarks:</strong><br>
                ${invoice.paymentDetails}
              </div>
            `
                : ''
            }
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Van: ${invoice.van?.name || 'N/A'} | Processed by: ${invoice.employee?.name || 'N/A'}</p>
            <p>This is a computer generated invoice. No signature required.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    const html = generateInvoiceHTML();

    if (Platform.OS === 'web') {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
      }
      return;
    }

    const { uri } = await Print.printToFileAsync({ html });
    await Print.printAsync({ uri });
  };

  const sharePDF = async () => {
    setIsProcessing(true);

    try {
      const html = generateInvoiceHTML();

      if (Platform.OS === 'web') {
        const newWindow = window.open('', '_blank');
        if (!newWindow) {
          Alert.alert('Error', 'Popup blocked. Please allow popups.');
          return;
        }
        newWindow.document.write(html);
        newWindow.document.close();
        setTimeout(() => {
          newWindow.focus();
          newWindow.print();
        }, 500);
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Invoice ${invoice.invoiceNumber || invoice.id}`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share invoice. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnToCheckIn = () => {
    handleBackNavigation();
  };

  const handleBottomBarLayout = (event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 6,
          },
        ]}
      >
        <TouchableOpacity onPress={handleBackNavigation} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Share Invoice</Text>
        <View style={{ width: 40, height: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(bottomBarHeight + 16, 104) },
        ]}
      >
        {/* Simple Instruction */}
        <Text style={styles.instruction}>
          Share your invoice with the customer or print a copy for your records.
        </Text>

        {/* Options Card */}
        <AppCard variant="elevated" padding="lg" style={styles.optionsCard}>
          <TouchableOpacity
            style={[styles.optionItem, selectedOption === 'print' && styles.optionSelected]}
            onPress={() => {
              setSelectedOption('print');
              handlePrint();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="print" size={28} color={colors.primary} />
              </View>
              <View style={styles.optionTextBlock}>
                <Text style={styles.optionTitle}>Print Invoice</Text>
                <Text style={styles.optionDescription} numberOfLines={2}>Print a copy for your records</Text>
              </View>
            </View>
            {selectedOption === 'print' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border + '30' }]} />

          <TouchableOpacity
            style={[styles.optionItem, selectedOption === 'share' && styles.optionSelected]}
            onPress={() => setSelectedOption('share')}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="share-social" size={28} color={colors.success} />
              </View>
              <View style={styles.optionTextBlock}>
                <Text style={styles.optionTitle}>Share Invoice</Text>
                <Text style={styles.optionDescription} numberOfLines={2}>Share PDF via WhatsApp, Email, etc.</Text>
              </View>
            </View>
            {selectedOption === 'share' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            )}
          </TouchableOpacity>
        </AppCard>

        {/* Share Options Submenu */}
        {selectedOption === 'share' && (
          <AppCard variant="elevated" padding="md" style={styles.submenuCard}>
            <Text style={styles.submenuTitle}>Share PDF via</Text>

            {/* <TouchableOpacity style={styles.submenuItem} onPress={sharePDF}>
              <Ionicons name="share-social" size={24} color={colors.primary} />
              <Text style={styles.submenuText}>Any App</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.submenuItem} onPress={sharePDF}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.submenuText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submenuItem} onPress={sharePDF}>
              <Ionicons name="mail-outline" size={24} color="#EA4335" />
              <Text style={styles.submenuText}>Email</Text>
            </TouchableOpacity>
          </AppCard>
        )}

        {/* Invoice Summary Preview */}
        <AppCard variant="elevated" padding="md" style={styles.previewCard}>
          <Text style={styles.previewTitle}>Invoice Summary</Text>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Invoice No:</Text>
            <Text style={styles.previewValue}>{invoice.invoiceNumber || invoice.id}</Text>
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
            <Text style={styles.previewLabel}>Total Cases:</Text>
            <Text style={styles.previewValue}>{invoice.summary?.totalCases || 0}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Pieces:</Text>
            <Text style={styles.previewValue}>{invoice.summary?.totalPieces || 0}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Quantity:</Text>
            <Text style={styles.previewValue}>{invoice.summary?.totalQty || 0}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Net Weight:</Text>
            <Text style={styles.previewValue}>{invoice.summary?.totalNetWeight || 0} kg</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Amount:</Text>
            <Text style={[styles.previewValue, styles.previewAmount]}>
              {invoice.currency} {Number(invoice.amount || 0).toFixed(2)}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Status:</Text>
            <Text
              style={[
                styles.previewValue,
                { color: invoice.status === 'PAID' ? colors.success : colors.warning },
              ]}
            >
              {invoice.status}
            </Text>
          </View>
        </AppCard>
      </ScrollView>

      {/* Bottom Button - Return to Check In */}
      <View
        onLayout={handleBottomBarLayout}
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.proceedButton,
            { backgroundColor: colors.primary },
            isProcessing && styles.disabledButton,
          ]}
          onPress={handleReturnToCheckIn}
          activeOpacity={0.9}
        >
          <Text style={styles.proceedButtonText}>Return to My Route</Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={showConfirmation}
        title="Confirm Share"
        message="Have you shared the invoice with the customer?"
        confirmText="Yes, Proceed"
        cancelText="Not Yet"
        onConfirm={() => {
          setShowConfirmation(false);
          Alert.alert('Success', 'Invoice processed successfully', [
            { text: 'OK', onPress: () => handleBackNavigation() },
          ]);
        }}
        onCancel={() => setShowConfirmation(false)}
      />
    </View>
  );
}
