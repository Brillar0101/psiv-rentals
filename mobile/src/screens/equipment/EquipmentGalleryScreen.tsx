// src/screens/equipment/EquipmentGalleryScreen.tsx
import React, { useState } from 'react';
import { View, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function EquipmentGalleryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { images, initialIndex } = route.params as any;
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      <View style={styles.counter}>
        <Text style={styles.counterText}>{currentIndex + 1} / {images.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  closeIcon: { fontSize: 24, color: COLORS.text },
  image: { width, height },
  counter: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusPill },
  counterText: { color: COLORS.white, fontSize: SIZES.bodySmall },
});
