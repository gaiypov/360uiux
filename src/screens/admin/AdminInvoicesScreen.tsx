/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Invoices Screen - Invoice Management
 * Revolut Ultra Style
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

interface Invoice {
  id: string;
  invoice_number: string;
  employerId: string;
  employerName: string;
  amount: number;
  vat: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  description?: string;
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  pdf_url?: string;
}

type FilterType = 'ALL' | 'draft' | 'sent' | 'paid' | 'cancelled';

export function AdminInvoicesScreen({ navigation }: any) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { showToast } = useToastStore();

  useEffect(() => {
    loadInvoices();
  }, [filter, searchQuery]);

  const loadInvoices = useCallback(async () => {
    try {
      // TODO: Replace with real API call
      // const data = await adminApi.getInvoices({ status: filter, search: searchQuery });

      // Mock data
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoice_number: 'INV-2025-001',
          employerId: 'emp1',
          employerName: 'ООО "Рога и Копыта"',
          amount: 50000,
          vat: 10000,
          total_amount: 60000,
          status: 'paid',
          description: 'Пополнение баланса',
          issue_date: '2025-11-01',
          due_date: '2025-11-15',
          paid_date: '2025-11-10',
          pdf_url: 'https://example.com/invoice-001.pdf',
        },
        {
          id: '2',
          invoice_number: 'INV-2025-002',
          employerId: 'emp2',
          employerName: 'ИП Иванов И.И.',
          amount: 25000,
          vat: 5000,
          total_amount: 30000,
          status: 'sent',
          description: 'Размещение вакансий',
          issue_date: '2025-11-10',
          due_date: '2025-11-20',
          pdf_url: 'https://example.com/invoice-002.pdf',
        },
      ];

      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Load invoices error:', error);
      showToast('error', 'Ошибка загрузки счетов');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const handleInvoicePress = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalVisible(true);
    haptics.light();
  };

  const handleMarkAsPaid = async () => {
    if (!selectedInvoice) return;

    try {
      // TODO: API call to mark as paid
      // await adminApi.updateInvoice(selectedInvoice.id, { status: 'paid', paid_date: new Date() });

      setInvoices(
        invoices.map((inv) =>
          inv.id === selectedInvoice.id
            ? { ...inv, status: 'paid', paid_date: new Date().toISOString() }
            : inv
        )
      );
      setSelectedInvoice({ ...selectedInvoice, status: 'paid', paid_date: new Date().toISOString() });
      showToast('success', 'Счёт отмечен как оплаченный');
      haptics.success();
    } catch (error) {
      showToast('error', 'Ошибка обновления счёта');
      haptics.error();
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedInvoice?.pdf_url) return;

    try {
      const supported = await Linking.canOpenURL(selectedInvoice.pdf_url);
      if (supported) {
        await Linking.openURL(selectedInvoice.pdf_url);
        showToast('success', 'Открытие PDF счёта');
      } else {
        showToast('error', 'Не удалось открыть PDF');
      }
    } catch (error) {
      showToast('error', 'Ошибка открытия PDF');
    }
  };

  const handleCreateInvoice = () => {
    haptics.medium();
    // TODO: Navigate to create invoice screen
    showToast('info', 'Создание счёта - в разработке');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.accentGreen;
      case 'sent':
        return colors.accentBlue;
      case 'draft':
        return colors.accentGray;
      case 'cancelled':
        return colors.accentRed;
      default:
        return colors.chromeSilver;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Оплачен';
      case 'sent':
        return 'Отправлен';
      case 'draft':
        return 'Черновик';
      case 'cancelled':
        return 'Отменён';
      default:
        return status;
    }
  };

  const getFilterLabel = (filterType: FilterType) => {
    switch (filterType) {
      case 'ALL':
        return 'Все';
      case 'draft':
        return 'Черновики';
      case 'sent':
        return 'Отправленные';
      case 'paid':
        return 'Оплаченные';
      case 'cancelled':
        return 'Отменённые';
      default:
        return filterType;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter !== 'ALL' && invoice.status !== filter) return false;
    if (searchQuery) {
      return (
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.employerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const renderInvoice = ({ item, index }: { item: Invoice; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50)}>
      <TouchableOpacity onPress={() => handleInvoicePress(item)} activeOpacity={0.8}>
        <GlassCard style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <View style={styles.invoiceInfo}>
              <View style={styles.invoiceNumberRow}>
                <Icon name="file-document" size={20} color={colors.accentBlue} />
                <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
              </View>
              <Text style={styles.employerName}>{item.employerName}</Text>
              {item.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
            </View>

            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.invoiceDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Сумма:</Text>
              <Text style={styles.detailValue}>{item.amount.toLocaleString()} ₽</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>НДС (20%):</Text>
              <Text style={styles.detailValue}>{item.vat.toLocaleString()} ₽</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabelBold}>Итого:</Text>
              <Text style={styles.detailValueBold}>{item.total_amount.toLocaleString()} ₽</Text>
            </View>
          </View>

          <View style={styles.invoiceDates}>
            <View style={styles.dateItem}>
              <Icon name="calendar" size={14} color={colors.chromeSilver} />
              <Text style={styles.dateText}>
                Выставлен: {new Date(item.issue_date).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            {item.paid_date && (
              <View style={styles.dateItem}>
                <Icon name="check-circle" size={14} color={colors.accentGreen} />
                <Text style={styles.dateText}>
                  Оплачен: {new Date(item.paid_date).toLocaleDateString('ru-RU')}
                </Text>
              </View>
            )}
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Счета</Text>
        <TouchableOpacity onPress={handleCreateInvoice} style={styles.createButton}>
          <MetalIcon name="plus" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.chromeSilver} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по номеру или компании..."
          placeholderTextColor={colors.chromeSilver}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {(['ALL', 'draft', 'sent', 'paid', 'cancelled'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              setFilter(f);
              haptics.light();
            }}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {getFilterLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="file-document-outline" size={64} color={colors.chromeSilver} />
            <Text style={styles.emptyText}>Счета не найдены</Text>
          </View>
        }
      />

      {/* Invoice Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedInvoice && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedInvoice.invoice_number}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color={colors.platinumSilver} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Компания:</Text>
                    <Text style={styles.modalValue}>{selectedInvoice.employerName}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Сумма:</Text>
                    <Text style={styles.modalValue}>{selectedInvoice.amount.toLocaleString()} ₽</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>НДС:</Text>
                    <Text style={styles.modalValue}>{selectedInvoice.vat.toLocaleString()} ₽</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Итого:</Text>
                    <Text style={styles.modalValueBold}>
                      {selectedInvoice.total_amount.toLocaleString()} ₽
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Статус:</Text>
                    <View
                      style={[
                        styles.statusBadgeSmall,
                        { backgroundColor: getStatusColor(selectedInvoice.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.statusTextSmall, { color: getStatusColor(selectedInvoice.status) }]}
                      >
                        {getStatusLabel(selectedInvoice.status)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  {selectedInvoice.pdf_url && (
                    <GlassButton
                      title="Скачать PDF"
                      onPress={handleDownloadPDF}
                      icon="download"
                      variant="secondary"
                    />
                  )}
                  {selectedInvoice.status === 'sent' && (
                    <GlassButton
                      title="Отметить оплаченным"
                      onPress={handleMarkAsPaid}
                      icon="check-circle"
                      variant="primary"
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.xl,
    paddingBottom: sizes.md,
  },
  title: {
    ...typography.h1,
    color: colors.platinumSilver,
  },
  createButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    marginHorizontal: sizes.lg,
    marginBottom: sizes.md,
    paddingHorizontal: sizes.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.steelGray,
  },
  searchIcon: {
    marginRight: sizes.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.platinumSilver,
    height: '100%',
  },
  filtersContainer: {
    maxHeight: 44,
    marginBottom: sizes.md,
  },
  filtersContent: {
    paddingHorizontal: sizes.lg,
    gap: sizes.sm,
  },
  filterChip: {
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.sm,
    borderRadius: sizes.radiusLarge,
    backgroundColor: colors.slateGray,
    borderWidth: 1,
    borderColor: colors.steelGray,
  },
  filterChipActive: {
    backgroundColor: colors.accentBlue + '20',
    borderColor: colors.accentBlue,
  },
  filterText: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  filterTextActive: {
    color: colors.accentBlue,
    fontWeight: '600',
  },
  listContent: {
    padding: sizes.lg,
    gap: sizes.md,
  },
  invoiceCard: {
    padding: sizes.md,
    gap: sizes.md,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceInfo: {
    flex: 1,
    gap: sizes.xs,
  },
  invoiceNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  invoiceNumber: {
    ...typography.bodyBold,
    color: colors.platinumSilver,
  },
  employerName: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  description: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  statusBadge: {
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  invoiceDetails: {
    gap: sizes.xs,
    paddingTop: sizes.sm,
    borderTopWidth: 1,
    borderTopColor: colors.steelGray,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  detailValue: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  detailLabelBold: {
    ...typography.bodyBold,
    color: colors.platinumSilver,
  },
  detailValueBold: {
    ...typography.h3,
    color: colors.platinumSilver,
  },
  invoiceDates: {
    gap: sizes.xs,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: sizes.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.chromeSilver,
    marginTop: sizes.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.graphiteBlack,
    borderTopLeftRadius: sizes.radiusXLarge,
    borderTopRightRadius: sizes.radiusXLarge,
    padding: sizes.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.platinumSilver,
  },
  modalBody: {
    marginBottom: sizes.lg,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.steelGray,
  },
  modalLabel: {
    ...typography.body,
    color: colors.chromeSilver,
  },
  modalValue: {
    ...typography.body,
    color: colors.platinumSilver,
  },
  modalValueBold: {
    ...typography.bodyBold,
    color: colors.platinumSilver,
  },
  statusBadgeSmall: {
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: sizes.radiusSmall,
  },
  statusTextSmall: {
    ...typography.caption,
    fontWeight: '600',
  },
  modalActions: {
    gap: sizes.md,
  },
});
