/**
 * 360° РАБОТА - ULTRA EDITION
 * Error Boundary Component
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassCard, MetalIcon } from './ui';
import { colors, typography, sizes } from '@/constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Here you could log to error tracking service (Sentry, etc.)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <MetalIcon name="alert-circle" variant="steel" size="large" glow />

            <Text style={styles.title}>Что-то пошло не так</Text>
            <Text style={styles.message}>
              Произошла непредвиденная ошибка. Попробуйте перезагрузить экран.
            </Text>

            {__DEV__ && this.state.error && (
              <GlassCard variant="dark" style={styles.errorCard}>
                <Text style={styles.errorTitle}>Детали ошибки (dev only):</Text>
                <Text style={styles.errorText} numberOfLines={5}>
                  {this.state.error.toString()}
                </Text>
              </GlassCard>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={20} color={colors.softWhite} />
              <Text style={styles.buttonText}>Перезагрузить</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sizes.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    ...typography.h2,
    color: colors.softWhite,
    marginTop: sizes.lg,
    marginBottom: sizes.md,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.liquidSilver,
    textAlign: 'center',
    marginBottom: sizes.xl,
  },
  errorCard: {
    width: '100%',
    marginBottom: sizes.lg,
  },
  errorTitle: {
    ...typography.captionMedium,
    color: colors.platinumSilver,
    marginBottom: sizes.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.graphiteSilver,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    paddingHorizontal: sizes.xl,
    paddingVertical: sizes.md,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusLarge,
  },
  buttonText: {
    ...typography.bodyMedium,
    color: colors.softWhite,
  },
});
