import React from 'react';
import { render } from '@testing-library/react-native';

import AppText from '@/core/components/Text';
import { MAX_FONT_SCALE, Text, TextInput } from '@/core/components/Text/ScaledText';
import { SkeletonList } from '@/core/components/Skeleton';

describe('font scaling cap', () => {
  it('applies the cap to Text, TextInput and AppText by default', () => {
    const screen = render(
      <>
        <Text testID="t">hello</Text>
        <TextInput testID="i" />
        <AppText testID="a">hi</AppText>
      </>,
    );
    expect(MAX_FONT_SCALE).toBe(1.3);
    expect(screen.getByTestId('t').props.maxFontSizeMultiplier).toBe(1.3);
    expect(screen.getByTestId('i').props.maxFontSizeMultiplier).toBe(1.3);
    expect(screen.getByTestId('a').props.maxFontSizeMultiplier).toBe(1.3);
  });

  it('lets a screen override the cap explicitly', () => {
    const screen = render(
      <Text testID="t" maxFontSizeMultiplier={2}>
        big
      </Text>,
    );
    expect(screen.getByTestId('t').props.maxFontSizeMultiplier).toBe(2);
  });

  it('forwards refs on TextInput (focus still works)', () => {
    const ref = React.createRef<TextInput>();
    render(<TextInput ref={ref} />);
    expect(ref.current).toBeTruthy();
  });
});

describe('SkeletonList', () => {
  it('renders the requested number of placeholder rows and is announced as loading', () => {
    const screen = render(<SkeletonList rows={3} />);
    const container = screen.getByLabelText('Loading');
    expect(container.props.children).toHaveLength(3);
  });
});
