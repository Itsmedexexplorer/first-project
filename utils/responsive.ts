import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const ResponsiveUtils = {
  // Scale based on screen width
  scaleWidth: (size: number) => {
    return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size);
  },

  // Scale based on screen height
  scaleHeight: (size: number) => {
    return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / BASE_HEIGHT) * size);
  },

  // Scale font size
  scaleFont: (size: number) => {
    const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
    return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
  },

  // Get dynamic spacing
  getSpacing: (small: number, medium: number, large: number) => {
    if (SCREEN_WIDTH < 350) return small;
    if (SCREEN_WIDTH < 400) return medium;
    return large;
  },

  // Get grid columns based on screen width
  getGridColumns: () => {
    if (SCREEN_WIDTH < 350) return 2;
    if (SCREEN_WIDTH < 400) return 2;
    return 3;
  },

  // Check if small screen
  isSmallScreen: () => SCREEN_WIDTH < 350,

  // Get button size
  getButtonSize: () => {
    if (SCREEN_WIDTH < 350) return { width: '45%', minHeight: 40 };
    if (SCREEN_WIDTH < 400) return { width: '48%', minHeight: 44 };
    return { width: '31%', minHeight: 48 };
  }
};

export const { scaleWidth, scaleHeight, scaleFont, getSpacing, getGridColumns, isSmallScreen, getButtonSize } = ResponsiveUtils;