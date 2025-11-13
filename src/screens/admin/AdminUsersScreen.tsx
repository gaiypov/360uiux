/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Users Screen - User Management
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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, GlassButton, MetalIcon } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { AdminUser } from '@/types';
import { adminApi } from '@/services/adminApi';
import { useToastStore } from '@/stores/toastStore';
import { haptics } from '@/utils/haptics';

type FilterType = 'ALL' | 'JOBSEEKER' | 'EMPLOYER' | 'MODERATOR';

export function AdminUsersScreen({ navigation }: any) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { showToast } = useToastStore();

  const loadUsers = useCallback(async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (filter !== 'ALL') {
        params.role = filter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const data = await adminApi.getUsers(params);
      setUsers(data.users);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      showToast('error', 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, searchQuery, showToast]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const params: any = { page: 1, limit: 50 };
        if (filter !== 'ALL') {
          params.role = filter;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }

        const data = await adminApi.getUsers(params);
        if (mounted) {
          setUsers(data.users);
        }
      } catch (error: any) {
        console.error('Failed to load users:', error);
        if (mounted) {
          showToast('error', 'Ошибка загрузки пользователей');
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
  }, [filter, searchQuery, showToast]);

  const onRefresh = () => {
    haptics.light();
    setRefreshing(true);
    loadUsers();
  };

  const handleUserPress = (user: AdminUser) => {
    haptics.medium();
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleToggleVerified = async () => {
    if (!selectedUser) return;

    try {
      const newVerified = !selectedUser.verified;
      await adminApi.updateUser(selectedUser.id, { verified: newVerified });

      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, verified: newVerified } : u
      ));
      setSelectedUser({ ...selectedUser, verified: newVerified });

      showToast('success', newVerified ? 'Пользователь верифицирован' : 'Верификация отменена');
    } catch (error) {
      showToast('error', 'Ошибка обновления');
    }
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    Alert.alert(
      'Удалить пользователя?',
      `Вы уверены, что хотите удалить ${selectedUser.name}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteUser(selectedUser.id);
              setUsers(users.filter(u => u.id !== selectedUser.id));
              setModalVisible(false);
              showToast('success', 'Пользователь удален');
            } catch (error) {
              showToast('error', 'Ошибка удаления');
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = (newRole: 'JOBSEEKER' | 'EMPLOYER' | 'MODERATOR') => {
    if (!selectedUser) return;

    const roleLabel = getRoleLabel(newRole);
    Alert.alert(
      'Изменить роль?',
      `Назначить роль "${roleLabel}" пользователю ${selectedUser.name}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Изменить',
          onPress: async () => {
            try {
              await adminApi.updateUser(selectedUser.id, { role: newRole });

              setUsers(users.map(u =>
                u.id === selectedUser.id ? { ...u, role: newRole } : u
              ));
              setSelectedUser({ ...selectedUser, role: newRole });

              showToast('success', `Роль изменена на "${roleLabel}"`);
            } catch (error) {
              showToast('error', 'Ошибка изменения роли');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'JOBSEEKER':
        return colors.accentBlue;
      case 'EMPLOYER':
        return colors.accentPurple;
      case 'MODERATOR':
        return colors.accentOrange;
      default:
        return colors.textSecondary;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'JOBSEEKER':
        return 'Соискатель';
      case 'EMPLOYER':
        return 'Работодатель';
      case 'MODERATOR':
        return 'Модератор';
      default:
        return role;
    }
  };

  const renderUser = ({ item, index }: { item: AdminUser; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        onPress={() => handleUserPress(item)}
        activeOpacity={0.8}
      >
        <GlassCard style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <View style={styles.userTitleRow}>
                <Text style={styles.userName}>{item.name}</Text>
                {item.verified && (
                  <Icon name="check-decagram" size={16} color={colors.accentBlue} />
                )}
              </View>
              <Text style={styles.userPhone}>{item.phone}</Text>
              {item.companyName && (
                <Text style={styles.userCompany}>{item.companyName}</Text>
              )}
            </View>
            <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}20` }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                {getRoleLabel(item.role)}
              </Text>
            </View>
          </View>

          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Icon name="briefcase" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.stats.vacancies}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="file-document" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.stats.applications}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="video" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.stats.videos}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="wallet" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{item.balance} ₽</Text>
            </View>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Пользователи</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по имени, телефону..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {(['ALL', 'JOBSEEKER', 'EMPLOYER', 'MODERATOR'] as FilterType[]).map((f) => (
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
              {f === 'ALL' ? 'Все' : getRoleLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-off" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Пользователи не найдены</Text>
          </View>
        }
      />

      {/* User Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedUser.name}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Телефон:</Text>
                    <Text style={styles.modalValue}>{selectedUser.phone}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Email:</Text>
                    <Text style={styles.modalValue}>{selectedUser.email || 'Не указан'}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Роль:</Text>
                    <Text style={[styles.modalValue, { color: getRoleColor(selectedUser.role) }]}>
                      {getRoleLabel(selectedUser.role)}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Баланс:</Text>
                    <Text style={styles.modalValue}>{selectedUser.balance} ₽</Text>
                  </View>

                  {/* Role Change Section */}
                  <View style={styles.roleChangeSection}>
                    <Text style={styles.sectionTitle}>Изменить роль:</Text>
                    <View style={styles.roleButtons}>
                      {(['JOBSEEKER', 'EMPLOYER', 'MODERATOR'] as const).map((role) => (
                        <TouchableOpacity
                          key={role}
                          onPress={() => {
                            haptics.light();
                            handleChangeRole(role);
                          }}
                          style={[
                            styles.roleButton,
                            selectedUser.role === role && styles.roleButtonActive,
                          ]}
                          disabled={selectedUser.role === role}
                        >
                          <Icon
                            name={
                              role === 'JOBSEEKER' ? 'account' :
                              role === 'EMPLOYER' ? 'office-building' :
                              'shield-account'
                            }
                            size={16}
                            color={selectedUser.role === role ? colors.platinumSilver : colors.chromeSilver}
                          />
                          <Text style={[
                            styles.roleButtonText,
                            selectedUser.role === role && styles.roleButtonTextActive,
                          ]}>
                            {getRoleLabel(role)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <GlassButton
                    title={selectedUser.verified ? 'Отменить верификацию' : 'Верифицировать'}
                    onPress={handleToggleVerified}
                    icon={selectedUser.verified ? 'close-circle' : 'check-circle'}
                    variant={selectedUser.verified ? 'secondary' : 'primary'}
                  />
                  <GlassButton
                    title="Удалить пользователя"
                    onPress={handleDeleteUser}
                    icon="delete"
                    variant="danger"
                  />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    marginHorizontal: sizes.lg,
    paddingHorizontal: sizes.md,
    marginBottom: sizes.md,
  },
  searchIcon: {
    marginRight: sizes.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: sizes.md,
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
  userCard: {
    marginBottom: sizes.md,
    padding: sizes.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.sm,
  },
  userInfo: {
    flex: 1,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  userName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  userPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userCompany: {
    ...typography.caption,
    color: colors.accentPurple,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  userStats: {
    flexDirection: 'row',
    gap: sizes.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
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
  },
  roleChangeSection: {
    marginTop: sizes.lg,
    paddingTop: sizes.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.liquidSilver,
    marginBottom: sizes.md,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.xs,
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.sm,
    borderRadius: sizes.radiusMedium,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  roleButtonActive: {
    backgroundColor: colors.accentBlue + '20',
    borderColor: colors.accentBlue,
  },
  roleButtonText: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  roleButtonTextActive: {
    color: colors.platinumSilver,
    fontWeight: '600',
  },
  modalActions: {
    gap: sizes.sm,
  },
});
