import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NeumorphicTabBar } from './NeumorphicTabBar';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 24, left: 0, right: 0 }),
}));

describe('bottom navigation', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const navigate = jest.fn();
  const emit = jest.fn();
  const routes = ['Today', 'Calendar', 'Tasks', 'Insights', 'Profile'].map(
    name => ({
      key: name,
      name,
      params: undefined,
    }),
  );
  const props = {
    state: { index: 0, routes },
    descriptors: Object.fromEntries(
      routes.map(route => [route.key, { options: {} }]),
    ),
    navigation: { navigate, emit },
  } as unknown as BottomTabBarProps;

  beforeEach(async () => {
    jest.clearAllMocks();
    emit.mockReturnValue({ defaultPrevented: false });
    await act(() => {
      renderer = ReactTestRenderer.create(<NeumorphicTabBar {...props} />);
    });
  });

  afterEach(async () => {
    await act(() => renderer.unmount());
  });

  it('exposes four tabs including Profile and marks the active tab', () => {
    for (const route of routes) {
      expect(
        renderer.root.findByProps({ accessibilityLabel: route.name }).props
          .accessibilityRole,
      ).toBe('tab');
    }
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Today' }).props
        .accessibilityState,
    ).toEqual({ selected: true });
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Profile' }).props
        .accessibilityState,
    ).toEqual({ selected: false });
  });

  it('opens Profile through the navigator', async () => {
    await act(() =>
      renderer.root
        .findByProps({ accessibilityLabel: 'Profile' })
        .props.onPress(),
    );
    expect(emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'Profile',
      canPreventDefault: true,
    });
    expect(navigate).toHaveBeenCalledWith('Profile', undefined);
  });

  it('honours a prevented tab press', async () => {
    emit.mockReturnValue({ defaultPrevented: true });
    await act(() =>
      renderer.root
        .findByProps({ accessibilityLabel: 'Profile' })
        .props.onPress(),
    );
    expect(navigate).not.toHaveBeenCalled();
  });
});
