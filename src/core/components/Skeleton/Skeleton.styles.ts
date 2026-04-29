import { createStyles } from '@/shared/theme/styles';

export const createSkeletonStyles = (colors: any) =>
  createStyles((utils) => ({
    base: {
      backgroundColor: colors.skeleton || '#E8ECEF',
      overflow: 'hidden',
      position: 'relative',
    },

    rect: {
      borderRadius: utils.borderRadius.md,
    },

    circle: {
      borderRadius: 999,
    },

    text: {
      borderRadius: utils.borderRadius.sm,
    },

    shimmer: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: '60%',
      backgroundColor: colors.surface + '80',
      transform: [{ skewX: '-15deg' }],
    },

    shimmerSecondary: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: '20%',
      backgroundColor: colors.surface + '30',
      transform: [{ skewX: '-15deg' }],
    },
  }))(colors);