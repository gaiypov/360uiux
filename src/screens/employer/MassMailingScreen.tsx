/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Mass Mailing Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard, GlassButton } from '@/components/ui';
import { colors, typography, sizes } from '@/constants';
import { useToastStore } from '@/stores';

export function MassMailingScreen({ navigation }: any) {
  const { showToast } = useToastStore();
  const [recipients, setRecipients] = useState<'all' | 'selected' | 'vacancy'>('all');
  const [vacancyId, setVacancyId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);

  const templates = [
    {
      id: '1',
      name: 'Приглашение на собеседование',
      subject: 'Приглашаем вас на собеседование',
      message: 'Здравствуйте! Нам понравилось ваше резюме, и мы хотели бы пригласить вас на собеседование...',
    },
    {
      id: '2',
      name: 'Благодарность за отклик',
      subject: 'Спасибо за ваш интерес',
      message: 'Благодарим вас за отклик на нашу вакансию. Мы рассмотрим ваше резюме в ближайшее время...',
    },
    {
      id: '3',
      name: 'Запрос дополнительной информации',
      subject: 'Дополнительная информация',
      message: 'Здравствуйте! Не могли бы вы предоставить дополнительную информацию о вашем опыте...',
    },
  ];

  const handleSend = () => {
    if (!subject || !message) {
      showToast('error', 'Заполните тему и сообщение');
      return;
    }

    if (recipients === 'vacancy' && !vacancyId) {
      showToast('error', 'Выберите вакансию');
      return;
    }

    // TODO: API call
    const count = recipients === 'all' ? 89 : recipients === 'selected' ? selectedCount : 24;
    showToast('success', `Сообщение отправлено ${count} кандидатам`);
    navigation.goBack();
  };

  const useTemplate = (template: any) => {
    setSubject(template.subject);
    setMessage(template.message);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.softWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Массовая рассылка</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Recipients Selection */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Получатели</Text>

          <TouchableOpacity
            style={[styles.recipientOption, recipients === 'all' && styles.recipientOptionActive]}
            onPress={() => setRecipients('all')}
          >
            <View style={styles.recipientOptionContent}>
              <Icon
                name="account-multiple"
                size={24}
                color={recipients === 'all' ? colors.ultraViolet : colors.liquidSilver}
              />
              <View style={styles.recipientOptionText}>
                <Text style={[styles.recipientOptionTitle, recipients === 'all' && styles.activeText]}>
                  Все кандидаты
                </Text>
                <Text style={styles.recipientOptionSubtitle}>89 человек</Text>
              </View>
            </View>
            {recipients === 'all' && (
              <Icon name="check-circle" size={24} color={colors.ultraViolet} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recipientOption, recipients === 'vacancy' && styles.recipientOptionActive]}
            onPress={() => setRecipients('vacancy')}
          >
            <View style={styles.recipientOptionContent}>
              <Icon
                name="briefcase"
                size={24}
                color={recipients === 'vacancy' ? colors.ultraViolet : colors.liquidSilver}
              />
              <View style={styles.recipientOptionText}>
                <Text style={[styles.recipientOptionTitle, recipients === 'vacancy' && styles.activeText]}>
                  По вакансии
                </Text>
                <Text style={styles.recipientOptionSubtitle}>Выберите вакансию</Text>
              </View>
            </View>
            {recipients === 'vacancy' && (
              <Icon name="check-circle" size={24} color={colors.ultraViolet} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recipientOption, recipients === 'selected' && styles.recipientOptionActive]}
            onPress={() => setRecipients('selected')}
          >
            <View style={styles.recipientOptionContent}>
              <Icon
                name="account-check"
                size={24}
                color={recipients === 'selected' ? colors.ultraViolet : colors.liquidSilver}
              />
              <View style={styles.recipientOptionText}>
                <Text style={[styles.recipientOptionTitle, recipients === 'selected' && styles.activeText]}>
                  Выбранные
                </Text>
                <Text style={styles.recipientOptionSubtitle}>{selectedCount} выбрано</Text>
              </View>
            </View>
            {recipients === 'selected' && (
              <Icon name="check-circle" size={24} color={colors.ultraViolet} />
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Шаблоны</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templates}
          >
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => useTemplate(template)}
              >
                <Icon name="file-document-outline" size={32} color={colors.ultraViolet} />
                <Text style={styles.templateName} numberOfLines={2}>
                  {template.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Form */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Сообщение</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Тема письма</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите тему..."
              placeholderTextColor={colors.liquidSilver}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Текст сообщения</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Введите текст сообщения..."
              placeholderTextColor={colors.liquidSilver}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
            />
          </View>

          {/* Variables */}
          <View style={styles.variables}>
            <Text style={styles.variablesTitle}>Переменные:</Text>
            <View style={styles.variableChips}>
              {['{name}', '{vacancy}', '{company}'].map((variable) => (
                <TouchableOpacity
                  key={variable}
                  style={styles.variableChip}
                  onPress={() => setMessage(message + ' ' + variable)}
                >
                  <Text style={styles.variableText}>{variable}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Preview */}
        <GlassCard style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Icon name="eye-outline" size={20} color={colors.cyberBlue} />
            <Text style={styles.previewTitle}>Предпросмотр</Text>
          </View>
          <Text style={styles.previewSubject}>{subject || 'Тема письма'}</Text>
          <Text style={styles.previewMessage}>
            {message || 'Текст сообщения появится здесь...'}
          </Text>
        </GlassCard>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.sendContainer}>
        <View style={styles.recipientCount}>
          <Icon name="send" size={20} color={colors.cyberBlue} />
          <Text style={styles.recipientCountText}>
            Отправить {recipients === 'all' ? 89 : recipients === 'selected' ? selectedCount : 24} кандидатам
          </Text>
        </View>
        <GlassButton
          title="ОТПРАВИТЬ"
          variant="primary"
          onPress={handleSend}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.md,
    paddingTop: 50,
    paddingBottom: sizes.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.softWhite,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: sizes.lg,
    paddingBottom: 140,
  },
  section: {
    marginBottom: sizes.lg,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.softWhite,
    marginBottom: sizes.md,
  },
  recipientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: sizes.md,
    borderRadius: sizes.radiusMedium,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: sizes.sm,
  },
  recipientOptionActive: {
    backgroundColor: 'rgba(142, 127, 255, 0.15)',
    borderColor: colors.ultraViolet,
  },
  recipientOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.md,
    flex: 1,
  },
  recipientOptionText: {
    flex: 1,
  },
  recipientOptionTitle: {
    ...typography.bodyMedium,
    color: colors.liquidSilver,
    marginBottom: 2,
  },
  activeText: {
    color: colors.ultraViolet,
    fontWeight: '600',
  },
  recipientOptionSubtitle: {
    ...typography.caption,
    color: colors.liquidSilver,
  },
  templates: {
    gap: sizes.md,
    paddingRight: sizes.lg,
  },
  templateCard: {
    width: 120,
    height: 120,
    borderRadius: sizes.radiusLarge,
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizes.sm,
    gap: sizes.sm,
  },
  templateName: {
    ...typography.caption,
    color: colors.liquidSilver,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: sizes.md,
  },
  label: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.sm,
    textTransform: 'uppercase',
  },
  input: {
    ...typography.body,
    color: colors.softWhite,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  textArea: {
    paddingTop: sizes.md,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  variables: {
    marginTop: sizes.sm,
  },
  variablesTitle: {
    ...typography.caption,
    color: colors.liquidSilver,
    marginBottom: sizes.sm,
  },
  variableChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.sm,
  },
  variableChip: {
    backgroundColor: 'rgba(57, 224, 248, 0.15)',
    borderRadius: sizes.radiusSmall,
    paddingHorizontal: sizes.sm,
    paddingVertical: 4,
  },
  variableText: {
    ...typography.caption,
    color: colors.cyberBlue,
    fontWeight: '600',
  },
  previewCard: {
    marginBottom: sizes.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  previewTitle: {
    ...typography.bodyMedium,
    color: colors.cyberBlue,
  },
  previewSubject: {
    ...typography.h3,
    fontSize: 16,
    color: colors.softWhite,
    marginBottom: sizes.sm,
  },
  previewMessage: {
    ...typography.body,
    color: colors.liquidSilver,
    lineHeight: 20,
  },
  sendContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: sizes.lg,
    backgroundColor: colors.graphiteGray,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    gap: sizes.sm,
  },
  recipientCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.sm,
  },
  recipientCountText: {
    ...typography.caption,
    color: colors.cyberBlue,
  },
});
