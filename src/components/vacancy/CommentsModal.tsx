/**
 * 360° РАБОТА - ULTRA EDITION
 * Comments Modal Component (TikTok-style)
 * Architecture v3: Bottom sheet with comments
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import { colors, typography, sizes } from '@/constants';
import { GlassCard, LoadingSpinner } from '@/components/ui';
import { api } from '@/services/api';
import { haptics } from '@/utils/haptics';
import { useToastStore } from '@/stores/toastStore';
import { getKeyboardBehavior, getTextSelectionProps } from '@/utils/platform';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Comment {
  id: string;
  text: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  likesCount: number;
}

interface CommentsModalProps {
  visible: boolean;
  vacancyId: string | null;
  onClose: () => void;
}

export function CommentsModal({ visible, vacancyId, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToastStore();
  const inputRef = useRef<TextInput>(null);

  // Load comments when modal opens
  useEffect(() => {
    if (visible && vacancyId) {
      loadComments();
    } else {
      // Reset state when closing
      setComments([]);
      setCommentText('');
    }
  }, [visible, vacancyId]);

  const loadComments = async () => {
    if (!vacancyId) return;

    try {
      setLoading(true);
      const result = await api.getComments(vacancyId, { limit: 50 });

      // Mock data for now (until backend is ready)
      const mockComments: Comment[] = [
        {
          id: '1',
          text: 'Отличная компания! Работаю здесь уже 2 года 👍',
          userName: 'Алексей М.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          likesCount: 15,
        },
        {
          id: '2',
          text: 'Какой график работы?',
          userName: 'Мария С.',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          likesCount: 3,
        },
        {
          id: '3',
          text: 'Интересно, а какие требования к кандидатам?',
          userName: 'Дмитрий К.',
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          likesCount: 7,
        },
      ];

      setComments(result.length > 0 ? result : mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      showToast('error', 'Ошибка загрузки комментариев');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !vacancyId) return;

    try {
      setSubmitting(true);

      const result = await api.addComment(vacancyId, commentText.trim());

      // Add new comment to the top
      const newComment: Comment = {
        id: result.id,
        text: commentText.trim(),
        userName: 'Вы',
        createdAt: result.createdAt,
        likesCount: 0,
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      haptics.success();
      showToast('success', 'Комментарий добавлен!');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error submitting comment:', error);
      haptics.error();
      showToast('error', 'Ошибка при отправке комментария');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const commentDate = new Date(dateString).getTime();
    const diff = now - commentDate;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Icon name="account-circle" size={36} color={colors.chromeSilver} />
      </View>

      {/* Comment content */}
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>

        {/* Like button */}
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.likeButton} activeOpacity={0.7}>
            <Icon name="heart-outline" size={16} color={colors.chromeSilver} />
            {item.likesCount > 0 && (
              <Text style={styles.likesCount}>{item.likesCount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor={colors.primaryBlack}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Sheet */}
      <KeyboardAvoidingView
        behavior={getKeyboardBehavior()}
        style={styles.keyboardAvoid}
      >
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={styles.bottomSheet}
        >
          <GlassCard variant="strong" style={styles.sheetContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dragHandle} />
              <Text style={styles.headerTitle}>
                Комментарии {comments.length > 0 && `(${comments.length})`}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color={colors.softWhite} />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner size="large" variant="spinner" />
              </View>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="comment-outline" size={64} color={colors.graphiteSilver} />
                    <Text style={styles.emptyText}>
                      Комментариев пока нет{'\n'}Будьте первым!
                    </Text>
                  </View>
                }
              />
            )}

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Добавьте комментарий..."
                placeholderTextColor={colors.graphiteSilver}
                multiline
                maxLength={500}
                editable={!submitting}
                {...getTextSelectionProps(colors.platinumSilver)}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!commentText.trim() || submitting) && styles.sendButtonDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                activeOpacity={0.7}
              >
                {submitting ? (
                  <LoadingSpinner size="small" variant="spinner" />
                ) : (
                  <Icon
                    name="send"
                    size={20}
                    color={
                      commentText.trim()
                        ? colors.platinumSilver
                        : colors.graphiteSilver
                    }
                  />
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderTopLeftRadius: sizes.radiusXLarge,
    borderTopRightRadius: sizes.radiusXLarge,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingBottom: sizes.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.chromeSilver,
    marginBottom: sizes.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.softWhite,
    fontSize: 18,
  },
  closeButton: {
    position: 'absolute',
    right: sizes.lg,
    top: sizes.md,
  },
  listContent: {
    paddingHorizontal: sizes.lg,
    paddingVertical: sizes.md,
    minHeight: 200,
  },
  loadingContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.xxxLarge,
  },
  emptyText: {
    ...typography.body,
    color: colors.chromeSilver,
    textAlign: 'center',
    marginTop: sizes.md,
    lineHeight: 22,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: sizes.lg,
  },
  avatar: {
    marginRight: sizes.md,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.xs,
  },
  userName: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    fontSize: 14,
    marginRight: sizes.sm,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.chromeSilver,
    fontSize: 12,
  },
  commentText: {
    ...typography.body,
    color: colors.liquidSilver,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: sizes.xs,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesCount: {
    ...typography.caption,
    color: colors.chromeSilver,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: sizes.lg,
    paddingTop: sizes.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    gap: sizes.sm,
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
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.slateGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
