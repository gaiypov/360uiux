/**
 * 360° РАБОТА - ULTRA EDITION
 * Chat Screen - Messenger with Employer
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInLeft, FadeInRight, FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useChatStore, type Message } from '@/stores/chatStore';
import { haptics } from '@/utils/haptics';

interface ChatScreenProps {
  route: {
    params: {
      conversationId?: string;
      employerName: string;
      employerId?: string;
      employerLogo?: string;
      vacancyTitle?: string;
      vacancyId?: string;
    };
  };
  navigation: any;
}

export function ChatScreen({ route, navigation }: ChatScreenProps) {
  const {
    conversationId: routeConversationId,
    employerName,
    employerId = 'employer-1',
    vacancyTitle = 'Вакансия',
    vacancyId = 'vacancy-1',
  } = route.params;

  const {
    conversations,
    createConversation,
    getConversation,
    sendMessage: sendMessageToStore,
    setActiveConversation,
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Get or create conversation
  const conversationId = routeConversationId || `${employerId}-${vacancyId}`;
  const conversation = getConversation(conversationId);

  useEffect(() => {
    // Create conversation if it doesn't exist
    if (!conversation) {
      createConversation({
        id: conversationId,
        employerName,
        employerId,
        vacancyTitle,
        vacancyId,
      });

      // Add mock messages for development
      setTimeout(() => {
        const conv = getConversation(conversationId);
        if (conv && conv.messages.length === 0) {
          sendMessageToStore(
            conversationId,
            'Добрый день! Мы рассмотрели ваше резюме и хотели бы пригласить вас на собеседование.'
          );
        }
      }, 500);
    }

    // Set as active and mark as read
    setActiveConversation(conversationId);

    // Scroll to bottom on mount
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 200);

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId]);

  const messages = conversation?.messages || [];

  const sendMessage = () => {
    if (!inputText.trim()) return;

    haptics.light();
    sendMessageToStore(conversationId, inputText.trim());
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const showDate = index === 0 ||
      formatDate(item.timestamp) !== formatDate(messages[index - 1].timestamp);

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}
        <Animated.View
          entering={item.isOwn ? FadeInRight.duration(300) : FadeInLeft.duration(300)}
          style={[
            styles.messageContainer,
            item.isOwn ? styles.ownMessageContainer : styles.theirMessageContainer,
          ]}
        >
          {item.isOwn ? (
            <LinearGradient
              colors={metalGradients.platinum}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ownMessage}
            >
              <Text style={styles.ownMessageText}>{item.text}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.ownMessageTime}>{formatTime(item.timestamp)}</Text>
                {item.read && (
                  <Icon name="check-all" size={14} color={colors.graphiteBlack} />
                )}
              </View>
            </LinearGradient>
          ) : (
            <GlassCard variant="medium" style={styles.theirMessage} noPadding>
              <View style={styles.theirMessageContent}>
                <Text style={styles.theirMessageText}>{item.text}</Text>
                <Text style={styles.theirMessageTime}>{formatTime(item.timestamp)}</Text>
              </View>
            </GlassCard>
          )}
        </Animated.View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlack} />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <GlassCard variant="dark" style={styles.header} noPadding>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={colors.softWhite} />
            </TouchableOpacity>

            <View style={styles.employerInfo}>
              <View style={styles.employerAvatar}>
                <Icon name="office-building" size={24} color={colors.platinumSilver} />
              </View>
              <View style={styles.employerText}>
                <Text style={styles.employerName}>{employerName}</Text>
                {vacancyTitle && (
                  <Text style={styles.vacancyTitle} numberOfLines={1}>
                    {vacancyTitle}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.moreButton}>
              <Icon name="dots-vertical" size={24} color={colors.softWhite} />
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <GlassCard variant="dark" style={styles.inputContainer} noPadding>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="paperclip" size={24} color={colors.chromeSilver} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Написать сообщение..."
              placeholderTextColor={colors.graphiteSilver}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() ? metalGradients.platinum : [colors.steelGray, colors.steelGray]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Icon
                  name="send"
                  size={20}
                  color={inputText.trim() ? colors.graphiteBlack : colors.darkChrome}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  header: {
    marginHorizontal: sizes.md,
    marginTop: sizes.md,
    marginBottom: sizes.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.md,
  },
  backButton: {
    marginRight: sizes.sm,
  },
  employerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  employerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.carbonGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.sm,
  },
  employerText: {
    flex: 1,
  },
  employerName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
  },
  vacancyTitle: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  moreButton: {
    marginLeft: sizes.sm,
  },
  messagesList: {
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: sizes.lg,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.steelGray,
  },
  dateText: {
    ...typography.caption,
    color: colors.graphiteSilver,
    marginHorizontal: sizes.md,
  },
  messageContainer: {
    marginBottom: sizes.sm,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  ownMessage: {
    borderRadius: sizes.radiusLarge,
    padding: sizes.md,
  },
  ownMessageText: {
    ...typography.body,
    color: colors.graphiteBlack,
    marginBottom: sizes.xs,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  ownMessageTime: {
    ...typography.micro,
    color: colors.carbonGray,
  },
  theirMessage: {
    borderRadius: sizes.radiusLarge,
  },
  theirMessageContent: {
    padding: sizes.md,
  },
  theirMessageText: {
    ...typography.body,
    color: colors.softWhite,
    marginBottom: sizes.xs,
  },
  theirMessageTime: {
    ...typography.micro,
    color: colors.graphiteSilver,
  },
  inputContainer: {
    marginHorizontal: sizes.md,
    marginBottom: sizes.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: sizes.sm,
  },
  attachButton: {
    padding: sizes.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.softWhite,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusMedium,
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    maxHeight: 100,
    marginHorizontal: sizes.sm,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
