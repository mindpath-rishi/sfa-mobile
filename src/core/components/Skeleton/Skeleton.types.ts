export type SkeletonVariant = 'rect' | 'circle' | 'text';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;

  /** Shape of skeleton */
  variant?: SkeletonVariant;

  /** Border radius override */
  borderRadius?: number;

  /** Enable shimmer animation */
  animated?: boolean;

  /** Custom style */
  style?: any;

  testID?: string;
}
