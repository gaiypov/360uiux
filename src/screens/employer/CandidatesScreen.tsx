/**
 * 360° РАБОТА - ULTRA EDITION
 * Candidates Screen (Employer)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from "@/constants";

export function CandidatesScreen() {
  const candidates = [
    {
      id: '1',
      name: 'Иван Иванов',
      profession: 'Frontend Developer',
      experience: '5 лет',
      city: 'Москва',
      status: 'new',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Кандидаты</Text>
          <Text style={styles.subtitle}>{candidates.length} откликов</Text>
        </View>

        {candidates.map((candidate) => (
          <GlassCard key={candidate.id} style={styles.card}>
            <View style={styles.candidateHeader}>
              <View style={styles.avatar}>
                <Icon name="account" size={32} color={colors.platinumSilver} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{candidate.name}</Text>
                <Text style={styles.profession}>{candidate.profession}</Text>
              </View>
            </View>

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Icon name="briefcase" size={16} color={colors.liquidSilver} />
                <Text style={styles.detailText}>{candidate.experience}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="map-marker" size={16} color={colors.liquidSilver} />
                <Text style={styles.detailText}>{candidate.city}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButtonReject}>
                <Text style={styles.actionTextReject}>Отклонить</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonAccept}>
                <LinearGradient
                  colors={metalGradients.platinum}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionTextAccept}>Пригласить</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: sizes.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: sizes.lg,
    marginTop: sizes.lg,
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  card: {
    marginBottom: sizes.md,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(232, 232, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  profession: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  details: {
    flexDirection: 'row',
    gap: sizes.lg,
    marginBottom: sizes.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  detailText: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  actions: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  actionButtonReject: {
    flex: 1,
    padding: sizes.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    alignItems: 'center',
  },
  actionTextReject: {
    ...typography.caption,
    color: colors.liquidSilver,
    fontWeight: '600',
  },
  actionButtonAccept: {
    flex: 1,
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: sizes.sm,
    alignItems: 'center',
  },
  actionTextAccept: {
    ...typography.caption,
    color: colors.softWhite,
    fontWeight: '600',
  },
});
