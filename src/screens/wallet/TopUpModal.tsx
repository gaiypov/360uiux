/**
 * 360° РАБОТА - ULTRA EDITION
 * Top Up Modal - Выбор суммы и способа оплаты
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { haptics } from '@/utils/haptics';
import { getTextSelectionProps } from '@/utils/platform';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  route: {
    params: {
      onConfirm: (amount: number, paymentSystem: 'alfabank' | 'invoice') => void;
    };
  };
  navigation: any;
}

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

export function TopUpModal({ route, navigation }: Props) {
  const { onConfirm } = route.params;

  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [paymentSystem, setPaymentSystem] = useState<'alfabank' | 'invoice' | null>(null);

  /**
   * Закрыть модал
   */
  const handleClose = () => {
    haptics.light();
    navigation.goBack();
  };

  /**
   * Выбрать готовую сумму
   */
  const handleSelectPreset = (preset: number) => {
    setSelectedAmount(preset);
    setAmount(preset.toString());
    haptics.light();
  };

  /**
   * Изменение суммы вручную
   */
  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setAmount(cleaned);
    setSelectedAmount(null);
  };

  /**
   * Подтвердить пополнение
   */
  const handleConfirm = () => {
    const numAmount = parseInt(amount, 10);

    if (!numAmount || numAmount < 100) {
      return;
    }

    if (!paymentSystem) {
      return;
    }

    haptics.success();
    onConfirm(numAmount, paymentSystem);
    navigation.goBack();
  };

  /**
   * Форматирование суммы
   */
  const formatAmount = (value: number) => {
    return value.toLocaleString('ru-RU');
  };

  const isAmountValid = amount && parseInt(amount, 10) >= 100;
  const canConfirm = isAmountValid && paymentSystem;

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Background blur */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Modal content */}
        <Animated.View entering={SlideInDown.duration(400)} style={styles.container}>
          <GlassCard variant="dark" style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Пополнить кошелёк</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.softWhite} />
              </TouchableOpacity>
            </View>

            {/* Preset amounts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Выберите сумму</Text>
              <View style={styles.presetsGrid}>
                {PRESET_AMOUNTS.map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetButton,
                      selectedAmount === preset && styles.presetButtonActive,
                    ]}
                    onPress={() => handleSelectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        selectedAmount === preset && styles.presetTextActive,
                      ]}
                    >
                      {formatAmount(preset)} ₽
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Или введите другую сумму</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="Сумма"
                  placeholderTextColor={colors.stoneGray}
                  keyboardType="number-pad"
                  {...getTextSelectionProps(colors.platinumSilver)}
                />
                <Text style={styles.inputCurrency}>₽</Text>
              </View>
              <Text style={styles.hint}>Минимальная сумма: 100 ₽</Text>
            </View>

            {/* Payment system selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Способ оплаты</Text>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentSystem === 'alfabank' && styles.paymentCardActive,
                ]}
                onPress={() => {
                  setPaymentSystem('alfabank');
                  haptics.light();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.paymentIcon}>
                  <Icon name="credit-card" size={24} color={colors.platinumSilver} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Альфа-Банк</Text>
                  <Text style={styles.paymentDescription}>
                    Интернет-эквайринг (Visa, Mastercard, МИР)
                  </Text>
                </View>
                {paymentSystem === 'alfabank' && (
                  <Icon name="check-circle" size={24} color={colors.accentGreen} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentSystem === 'invoice' && styles.paymentCardActive,
                ]}
                onPress={() => {
                  setPaymentSystem('invoice');
                  haptics.light();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.paymentIcon}>
                  <Icon name="file-document-outline" size={24} color={colors.platinumSilver} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Оплата по счёту</Text>
                  <Text style={styles.paymentDescription}>
                    Безналичный платёж по реквизитам
                  </Text>
                </View>
                {paymentSystem === 'invoice' && (
                  <Icon name="check-circle" size={24} color={colors.accentGreen} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={!canConfirm}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={canConfirm ? metalGradients.platinum : [colors.slateGray, colors.slateGray]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Icon
                  name="check"
                  size={20}
                  color={canConfirm ? colors.graphiteBlack : colors.stoneGray}
                />
                <Text
                  style={[
                    styles.confirmText,
                    !canConfirm && styles.confirmTextDisabled,
                  ]}
                >
                  ПОПОЛНИТЬ
                  {isAmountValid && ` ${formatAmount(parseInt(amount, 10))} ₽`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modal: {
    borderTopLeftRadius: sizes.radiusXLarge,
    borderTopRightRadius: sizes.radiusXLarge,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: sizes.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sizes.xl,
  },
  title: {
    ...typography.h1,
    color: colors.softWhite,
  },
  closeButton: {
    padding: sizes.xs,
  },
  section: {
    marginBottom: sizes.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.chromeSilver,
    marginBottom: sizes.md,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.sm,
  },
  presetButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  presetButtonActive: {
    borderColor: colors.platinumSilver,
    backgroundColor: 'rgba(192, 192, 192, 0.1)',
  },
  presetText: {
    ...typography.bodyMedium,
    color: colors.chromeSilver,
  },
  presetTextActive: {
    color: colors.platinumSilver,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  input: {
    ...typography.h2,
    color: colors.softWhite,
    flex: 1,
    paddingVertical: sizes.md,
  },
  inputCurrency: {
    ...typography.h2,
    color: colors.chromeSilver,
    marginLeft: sizes.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.chromeSilver,
    marginTop: sizes.xs,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    padding: sizes.md,
    marginBottom: sizes.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentCardActive: {
    borderColor: colors.platinumSilver,
    backgroundColor: 'rgba(192, 192, 192, 0.1)',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: sizes.radiusMedium,
    backgroundColor: colors.graphiteBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    marginBottom: 2,
  },
  paymentDescription: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  confirmButton: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    marginTop: sizes.md,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.md + 2,
    gap: sizes.sm,
  },
  confirmText: {
    ...typography.h3,
    color: colors.graphiteBlack,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  confirmTextDisabled: {
    color: colors.stoneGray,
  },
});
