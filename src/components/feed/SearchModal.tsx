/**
 * 360° РАБОТА - SearchModal Component
 * Search modal for vacancies
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { colors, sizes, typography } from '@/constants';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const POPULAR_SEARCHES = [
  'Официант',
  'Бариста',
  'Курьер',
  'Продавец',
  'Повар',
  'Водитель',
];

export function SearchModal({ visible, onClose, onSearch }: SearchModalProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
      Keyboard.dismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView
          style={styles.blurView}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor={colors.graphiteBlack}
        />
        <View style={styles.modalContainer}>
          {/* Хедер */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={colors.platinumSilver} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Поиск вакансий</Text>
          </View>

          {/* Поле поиска */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color={colors.chromeSilver} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Профессия, компания..."
              placeholderTextColor={colors.chromeSilver}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Icon name="close-circle" size={20} color={colors.chromeSilver} />
              </TouchableOpacity>
            )}
          </View>

          {/* Популярные запросы */}
          <View style={styles.popularContainer}>
            <Text style={styles.popularTitle}>Популярные запросы</Text>
            <View style={styles.tagsContainer}>
              {POPULAR_SEARCHES.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => {
                    setQuery(tag);
                    onSearch(tag);
                  }}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: colors.graphiteBlack,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: sizes.md,
    minHeight: 400,
    borderTopWidth: 1,
    borderTopColor: colors.steelGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.softWhite,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.carbonGray,
    borderRadius: 12,
    paddingHorizontal: sizes.md,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.steelGray,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.softWhite,
  },
  popularContainer: {
    marginTop: 8,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.liquidSilver,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.carbonGray,
    borderWidth: 1,
    borderColor: colors.steelGray,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.platinumSilver,
  },
});
