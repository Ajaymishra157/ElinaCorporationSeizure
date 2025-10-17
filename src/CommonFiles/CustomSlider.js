import React, { useRef, useEffect } from 'react';
import { View, PanResponder, Animated, Dimensions } from 'react-native';

const { width: windowWidth } = Dimensions.get('window');

export default function CustomSlider({ min = 10, max = 20, step = 1, value = 16, onValueChange }) {
  const sliderWidth = windowWidth - 90;
  const pan = useRef(new Animated.Value(((value - min) / (max - min)) * sliderWidth)).current;
  const offsetX = useRef(0);

  // Update handle position if value prop changes
  useEffect(() => {
    const pos = ((value - min) / (max - min)) * sliderWidth;
    pan.setValue(pos);
  }, [value]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        offsetX.current = pan._value;
      },
      onPanResponderMove: (_, gestureState) => {
        let newX = offsetX.current + gestureState.dx;
        if (newX < 0) newX = 0;
        if (newX > sliderWidth) newX = sliderWidth;

        const rawValue = min + ((max - min) * newX) / sliderWidth;
        const steppedValue = Math.round(rawValue / step) * step;

        pan.setValue((steppedValue - min) / (max - min) * sliderWidth);

        if (onValueChange) onValueChange(steppedValue);
      },
    })
  ).current;

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      {/* Background track */}
      <View style={{
        width: sliderWidth,
        height: 6,
        backgroundColor: '#ddd',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        {/* Progress fill - always visible based on current value */}
        <Animated.View
          style={{
            position: 'absolute',
            width: Animated.add(pan, 10), // This will automatically update when value changes
            height: 6,
            backgroundColor: '#050505ff',
            borderRadius: 3,
          }}
        />
      </View>

      {/* Slider handle */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          left: pan,
          top: -7,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: 'rgba(59, 59, 58, 1)ff',
        }}
      />
    </View>
  );
}