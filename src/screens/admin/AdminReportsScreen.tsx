/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Reports Screen - Complaints Management
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { AdminComplaint } from '@/types';
import { adminApi } from '@/services/adminApi';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

type FilterType = 'ALL' | 'pending' | 'approved' | 'rejected';

export function AdminReportsScreen({ navigation }: any) {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [moderatorComment, setModeratorComment] = useState('');
  const [blockVideo, setBlockVideo] = useState(false);
  const { showToast } = useToastStore();

  const loadComplaints = useCallback(async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (filter !== 'ALL') {
        params.status = filter;
      }

      const data = await adminApi.getComplaints(params);
      setComplaints(data.complaints);
    } catch (error: any) {
      console.error('Failed to load complaints:', error);
      showToast('error', 'Ошибка загрузки жалоб');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const params: any = { page: 1, limit: 50 };
        if (filter !== 'ALL') {
          params.status = filter;
        }

        const data = await adminApi.getComplaints(params);
        if (mounted) {
          setComplaints(data.complaints);
        }
      } catch (error: any) {
        console.error('Failed to load complaints:', error);
        if (mounted) {
          showToast('error', 'Ошибка загрузки жалоб');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [filter, showToast]);

  const onRefresh = () => {
    haptics.light();
    setRefreshing(true);
    loadComplaints();
  };

  const handleComplaintPress = (complaint: AdminComplaint) => {
    haptics.medium();
    setSelectedComplaint(complaint);
    setModeratorComment('');
    setBlockVideo(false);
    setModalVisible(true);
  };

  const handleProcessComplaint = async (status: 'approved' | 'rejected') => {
    if (!selectedComplaint) return;

    try {
      await adminApi.processComplaint(selectedComplaint.id, {
        status,
        moderatorComment,
        blockVideo: status === 'approved' && blockVideo,
      });

      setComplaints(complaints.map(c =>
        c.id === selectedComplaint.id
          ? { ...c, status, moderatorComment, reviewedAt: new Date().toISOString() }
          : c
      ));

      setModalVisible(false);
      showToast('success', status === 'approved' ? 'Жалоба одобрена' : 'Жалоба отклонена');
    } catch (error) {
      showToast('error', 'Ошибка обработки жалобы');
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: 'Неприемлемый контент',
      misleading_info: 'Вводящая в заблуждение информация',
      spam: 'Спам',
      harassment: 'Преследование',
      copyright: 'Нарушение авторских прав',
      other: 'Другое',
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.accentOrange;
      case 'approved':
        return colors.accentGreen;
      case 'rejected':
        return colors.accentRed;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'На рассмотрении';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const renderComplaint = ({ item, index }: { item: AdminComplaint; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        onPress={() => handleComplaintPress(item)}
        activeOpacity={0.8}
      >
        <GlassCard style={styles.complaintCard}>
          <View style={styles.complaintHeader}>
            <View style={styles.complaintInfo}>
              <Text style={styles.complaintReason}>
                {getReasonLabel(item.reason)}
              </Text>
              <Text style={styles.videoTitle}>{item.video.title}</Text>
              <Text style={styles.videoUser}>
                {item.video.type} • {item.video.user.name}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString('ru-RU')}
          </Text>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Жалобы</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {(['pending', 'ALL', 'approved', 'rejected'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              haptics.light();
              setFilter(f);
            }}
            style={[
              styles.filterChip,
              filter === f && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'ALL' ? 'Все' : getStatusLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Complaints List */}
      <FlatList
        data={complaints}
        renderItem={renderComplaint}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="flag-off" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Жалоб не найдено</Text>
          </View>
        }
      />

      {/* Complaint Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedComplaint && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Жалоба</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Причина:</Text>
                    <Text style={styles.modalValue}>{getReasonLabel(selectedComplaint.reason)}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Видео:</Text>
                    <Text style={styles.modalValue}>{selectedComplaint.video.title}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Автор:</Text>
                    <Text style={styles.modalValue}>{selectedComplaint.video.user.name}</Text>
                  </View>
                  {selectedComplaint.description && (
                    <View style={styles.descriptionBox}>
                      <Text style={styles.modalLabel}>Описание:</Text>
                      <Text style={styles.descriptionText}>{selectedComplaint.description}</Text>
                    </View>
                  )}

                  {selectedComplaint.status === 'pending' && (
                    <>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Комментарий модератора (опционально)"
                        placeholderTextColor={colors.textSecondary}
                        value={moderatorComment}
                        onChangeText={setModeratorComment}
                        multiline
                        numberOfLines={3}
                      />

                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setBlockVideo(!blockVideo)}
                      >
                        <Icon
                          name={blockVideo ? 'checkbox-marked' : 'checkbox-blank-outline'}
                          size={24}
                          color={blockVideo ? colors.accentRed : colors.textSecondary}
                        />
                        <Text style={styles.checkboxLabel}>Заблокировать видео</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {selectedComplaint.status === 'pending' ? (
                  <View style={styles.modalActions}>
                    <GlassButton
                      title="Одобрить жалобу"
                      onPress={() => handleProcessComplaint('approved')}
                      icon="check-circle"
                      variant="primary"
                    />
                    <GlassButton
                      title="Отклонить жалобу"
                      onPress={() => handleProcessComplaint('rejected')}
                      icon="close-circle"
                      variant="secondary"
                    />
                  </View>
                ) : (
                  <View style={styles.resolvedInfo}>
                    <Icon
                      name={selectedComplaint.status === 'approved' ? 'check-circle' : 'close-circle'}
                      size={24}
                      color={getStatusColor(selectedComplaint.status)}
                    />
                    <Text style={styles.resolvedText}>
                      {getStatusLabel(selectedComplaint.status)}
                    </Text>
                  </View>
                )}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: sizes.lg,
    marginBottom: sizes.md,
    gap: sizes.sm,
  },
  filterChip: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    borderRadius: 20,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  filterChipActive: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    padding: sizes.lg,
  },
  complaintCard: {
    marginBottom: sizes.md,
    padding: sizes.md,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.sm,
  },
  complaintInfo: {
    flex: 1,
  },
  complaintReason: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  videoTitle: {
    ...typography.caption,
    color: colors.accentPurple,
    marginTop: 2,
  },
  videoUser: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: sizes.xs,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: sizes.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: sizes.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.secondaryBlack,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    color: colors.textPrimary,
  },
  modalBody: {
    marginBottom: sizes.lg,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  modalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  descriptionBox: {
    marginTop: sizes.md,
    padding: sizes.md,
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: sizes.xs,
  },
  commentInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    padding: sizes.md,
    marginTop: sizes.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sizes.md,
    padding: sizes.sm,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: sizes.sm,
  },
  modalActions: {
    gap: sizes.sm,
  },
  resolvedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizes.md,
    gap: sizes.sm,
  },
  resolvedText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
