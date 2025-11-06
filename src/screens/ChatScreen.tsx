/**
 * 360° РАБОТА - ULTRA EDITION
 * Chat Screen - Enhanced with Real-time Features
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeInDown,
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { GlassCard } from '@/components/ui';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { useChatStore, type Message, type MessageStatus } from '@/stores/chatStore';
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
    sendTypingIndicator,
    isConnected,
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            'Добрый день! Мы рассмотрели ваше резюме и хотели бы пригласить вас на собеседование.',
            'text'
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
      // Stop typing indicator on unmount
      if (isTyping) {
        sendTypingIndicator(conversationId, false);
      }
    };
  }, [conversationId]);

  const messages = conversation?.messages || [];
  const otherUserTyping = conversation?.isTyping || false;
  const typingUserName = conversation?.typingUserName;

  // Handle typing indicator
  const handleTextChange = (text: string) => {
    setInputText(text);

    // Send typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(conversationId, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(conversationId, false);
      }
    }, 3000);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    haptics.light();

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(conversationId, false);
    }

    sendMessageToStore(conversationId, inputText.trim(), 'text');
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const retryMessage = (messageId: string, text: string) => {
    haptics.medium();
    sendMessageToStore(conversationId, text, 'text');
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

  // Message status icon component
  const MessageStatusIcon = ({ status }: { status?: MessageStatus }) => {
    if (!status || status === 'sending') {
      return <ActivityIndicator size="small" color={colors.carbonGray} />;
    }

    if (status === 'failed') {
      return (
        <Icon name="alert-circle" size={14} color={colors.error} />
      );
    }

    if (status === 'sent') {
      return <Icon name="check" size={14} color={colors.carbonGray} />;
    }

    if (status === 'delivered') {
      return <Icon name="check-all" size={14} color={colors.carbonGray} />;
    }

    if (status === 'read') {
      return <Icon name="check-all" size={14} color={colors.primary} />;
    }

    return null;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const showDate =
      index === 0 ||
      formatDate(item.timestamp) !== formatDate(messages[index - 1].timestamp);

    // Architecture v3: System messages
    if (item.type === 'system') {
      return (
        <View key={item.id}>
          {showDate && (
            <View style={styles.dateSeparator}>
              <View style={styles.dateLine} />
              <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
              <View style={styles.dateLine} />
            </View>
          )}
          <View style={styles.systemMessageContainer}>
            <Text style={styles.systemMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    // Architecture v3: Video messages (resume videos)
    if (item.type === 'video') {
      return (
        <View key={item.id}>
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
            <GlassCard variant="medium" style={styles.videoMessage} noPadding>
              <View style={styles.videoMessageContent}>
                <View style={styles.videoMessageHeader}>
                  <Icon name="video" size={20} color={colors.platinumSilver} />
                  <Text style={styles.videoMessageTitle}>Видео-резюме</Text>
                </View>

                {/* TODO: Replace with ResumeVideoPlayer component */}
                <View style={styles.videoPlaceholder}>
                  <Icon name="play-circle" size={64} color={colors.platinumSilver} />
                  <Text style={styles.videoPlaceholderText}>📹 Видео-резюме</Text>
                  {item.viewsRemaining !== undefined && (
                    <Text style={styles.viewLimitText}>
                      👁️ Осталось {item.viewsRemaining} просмотра
                    </Text>
                  )}
                </View>

                <View style={styles.videoMessageFooter}>
                  <Icon name="shield-lock" size={14} color={colors.chromeSilver} />
                  <Text style={styles.videoFooterText}>
                    Приватное • Макс. 2 просмотра
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </View>
      );
    }

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
            <>
              <LinearGradient
                colors={metalGradients.platinum}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ownMessage}
              >
                <Text style={styles.ownMessageText}>{item.text}</Text>
                <View style={styles.messageFooter}>
                  <Text style={styles.ownMessageTime}>{formatTime(item.timestamp)}</Text>
                  <MessageStatusIcon status={item.status} />
                </View>
              </LinearGradient>
              {/* Failed message retry button */}
              {item.status === 'failed' && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.retryContainer}
                >
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => retryMessage(item.id, item.text)}
                  >
                    <Icon name="refresh" size={16} color={colors.error} />
                    <Text style={styles.retryText}>Повторить</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </>
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

      {/* Connection Status Bar */}
      {!isConnected && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.connectionBar}
        >
          <Icon name="wifi-off" size={16} color={colors.softWhite} />
          <Text style={styles.connectionText}>Подключение...</Text>
        </Animated.View>
      )}

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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          otherUserTyping ? (
            <TypingIndicator userName={typingUserName || employerName} />
          ) : null
        }
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
              onChangeText={handleTextChange}
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
                colors={
                  inputText.trim()
                    ? metalGradients.platinum
                    : [colors.steelGray, colors.steelGray]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Icon
                  name="send"
                  size={20}
                  color={
                    inputText.trim() ? colors.graphiteBlack : colors.darkChrome
                  }
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// Typing Indicator Component
function TypingIndicator({ userName }: { userName: string }) {
  // Animated dots
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);

  useEffect(() => {
    // Animate dots
    dot1Scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    dot2Scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1.5, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    dot3Scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1.5, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInLeft.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.typingContainer}
    >
      <GlassCard variant="medium" style={styles.typingBubble} noPadding>
        <View style={styles.typingContent}>
          <Text style={styles.typingText}>{userName} печатает</Text>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, dot1Style]} />
            <Animated.View style={[styles.typingDot, dot2Style]} />
            <Animated.View style={[styles.typingDot, dot3Style]} />
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
  connectionBar: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.xs,
    gap: sizes.xs,
  },
  connectionText: {
    ...typography.caption,
    color: colors.softWhite,
    fontWeight: '600',
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
  retryContainer: {
    marginTop: sizes.xs,
    alignItems: 'flex-end',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    paddingHorizontal: sizes.sm,
    paddingVertical: sizes.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: sizes.radiusSmall,
  },
  retryText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
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
  // Typing indicator styles
  typingContainer: {
    marginBottom: sizes.sm,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  typingBubble: {
    borderRadius: sizes.radiusLarge,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sizes.md,
    gap: sizes.sm,
  },
  typingText: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
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
  // Architecture v3: System message styles
  systemMessageContainer: {
    alignItems: 'center',
    paddingVertical: sizes.md,
  },
  systemMessageText: {
    ...typography.caption,
    color: colors.graphiteSilver,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    borderRadius: sizes.radiusMedium,
    textAlign: 'center',
  },
  // Architecture v3: Video message styles
  videoMessage: {
    width: '100%',
  },
  videoMessageContent: {
    padding: sizes.md,
  },
  videoMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  videoMessageTitle: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    fontWeight: '600',
  },
  videoPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: sizes.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sizes.md,
  },
  videoPlaceholderText: {
    ...typography.body,
    color: colors.platinumSilver,
    marginTop: sizes.sm,
  },
  viewLimitText: {
    ...typography.caption,
    color: colors.chromeSilver,
    marginTop: sizes.xs,
  },
  videoMessageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  videoFooterText: {
    ...typography.caption,
    color: colors.chromeSilver,
  },
});
