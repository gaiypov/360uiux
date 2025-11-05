/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Vacancy Detail Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { Vacancy } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VacancyDetailScreenProps {
  route: {
    params: {
      vacancy: Vacancy;
    };
  };
  navigation: any;
}

export function VacancyDetailScreen({
  route,
  navigation,
}: VacancyDetailScreenProps) {
  const { vacancy } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Video Background */}
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: vacancy.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={!isPlaying}
          muted={false}
        />
        <LinearGradient
          colors={['transparent', 'rgba(5,5,5,0.9)']}
          style={styles.videoGradient}
        />
      </View>

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.softWhite} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteHeaderButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.error : colors.softWhite}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Main Info */}
        <GlassCard style={styles.mainCard}>
          {/* Company */}
          <TouchableOpacity
            style={styles.companyRow}
            onPress={() =>
              navigation.navigate('CompanyDetail', {
                company: vacancy.employer,
              })
            }
          >
            <View style={styles.companyIcon}>
              <Icon name="office-building" size={20} color={colors.ultraViolet} />
            </View>
            <Text style={styles.companyName}>{vacancy.employer.companyName}</Text>
            {vacancy.employer.verified && (
              <Icon name="check-decagram" size={16} color={colors.cyberBlue} />
            )}
            <Icon
              name="chevron-right"
              size={20}
              color={colors.liquidSilver}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{vacancy.title}</Text>

          {/* Salary */}
          <View style={styles.salaryContainer}>
            <LinearGradient
              colors={[colors.ultraViolet, colors.cyberBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.salaryGradient}
            >
              <Text style={styles.salary}>
                {vacancy.salaryMin.toLocaleString('ru-RU')}
                {vacancy.salaryMax
                  ? ` - ${vacancy.salaryMax.toLocaleString('ru-RU')}`
                  : '+'}{' '}
                ₽
              </Text>
            </LinearGradient>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={20} color={colors.liquidSilver} />
            <Text style={styles.infoText}>
              {vacancy.city}
              {vacancy.metro && ` • м. ${vacancy.metro}`}
            </Text>
          </View>

          {/* Experience */}
          {vacancy.experience && (
            <View style={styles.infoRow}>
              <Icon name="briefcase" size={20} color={colors.liquidSilver} />
              <Text style={styles.infoText}>{vacancy.experience}</Text>
            </View>
          )}

          {/* Schedule */}
          {vacancy.schedule && (
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={20} color={colors.liquidSilver} />
              <Text style={styles.infoText}>{vacancy.schedule}</Text>
            </View>
          )}
        </GlassCard>

        {/* Benefits */}
        {vacancy.benefits.length > 0 && (
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Что мы предлагаем</Text>
            <View style={styles.benefits}>
              {vacancy.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Icon
                    name="check-circle"
                    size={20}
                    color={colors.cyberBlue}
                  />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Description */}
        {vacancy.description && (
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.descriptionText}>{vacancy.description}</Text>
          </GlassCard>
        )}

        {/* Requirements */}
        {vacancy.requirements && vacancy.requirements.length > 0 && (
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Требования</Text>
            {vacancy.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <View style={styles.bullet} />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Stats */}
        <GlassCard style={styles.statsCard}>
          <View style={styles.statItem}>
            <Icon name="eye-outline" size={24} color={colors.cyberBlue} />
            <Text style={styles.statValue}>{vacancy.applications}</Text>
            <Text style={styles.statLabel}>откликов</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="star" size={24} color={colors.ultraViolet} />
            <Text style={styles.statValue}>
              {vacancy.employer.rating.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>рейтинг</Text>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.applyContainer}>
        <GlassButton
          title="ОТКЛИКНУТЬСЯ"
          variant="primary"
          onPress={() => console.log('Apply to vacancy')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: 300,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sizes.md,
    paddingTop: 50,
    paddingBottom: sizes.md,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: 220,
  },
  contentContainer: {
    padding: sizes.lg,
    paddingBottom: 120,
  },
  mainCard: {},
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  companyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(142, 127, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
  },
  title: {
    ...typography.h2,
    color: colors.softWhite,
    marginBottom: sizes.md,
  },
  salaryContainer: {
    alignSelf: 'flex-start',
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
    marginBottom: sizes.md,
  },
  salaryGradient: {
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.sm,
  },
  salary: {
    ...typography.numbers,
    fontSize: 22,
    color: colors.softWhite,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.liquidSilver,
  },
  section: {
    marginTop: sizes.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.md,
  },
  benefits: {
    gap: sizes.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  benefitText: {
    ...typography.body,
    color: colors.liquidSilver,
    flex: 1,
  },
  descriptionText: {
    ...typography.body,
    color: colors.liquidSilver,
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sizes.sm,
    marginBottom: sizes.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ultraViolet,
    marginTop: 8,
  },
  requirementText: {
    ...typography.body,
    color: colors.liquidSilver,
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: sizes.md,
  },
  statItem: {
    alignItems: 'center',
    gap: sizes.xs,
  },
  statValue: {
    ...typography.h2,
    color: colors.softWhite,
  },
  statLabel: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.glassBorder,
  },
  applyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: sizes.lg,
    backgroundColor: colors.graphiteGray,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
});
