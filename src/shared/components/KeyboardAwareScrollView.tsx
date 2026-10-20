import React, { useCallback, useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  TextInput,
} from 'react-native';

type FieldGeometry = {
  scrollY: number;
  viewportTop: number;
  viewportHeight: number;
  keyboardTop?: number;
  inputTop: number;
  inputHeight: number;
};

export function getFocusedFieldScrollOffset({
  scrollY,
  viewportTop,
  viewportHeight,
  keyboardTop,
  inputTop,
  inputHeight,
}: FieldGeometry): number {
  const visibleTop = viewportTop + 12;
  const visibleBottom =
    Math.min(viewportTop + viewportHeight, keyboardTop ?? Infinity) - 24;
  if (visibleBottom <= visibleTop) return scrollY;
  if (inputTop < visibleTop || inputHeight > visibleBottom - visibleTop) {
    return Math.max(0, scrollY + inputTop - visibleTop);
  }
  if (inputTop + inputHeight > visibleBottom) {
    return Math.max(0, scrollY + inputTop + inputHeight - visibleBottom);
  }
  return scrollY;
}

/** Keep the focused input visible both when the IME opens and when focus changes. */
export function KeyboardAwareScrollView({
  children,
  onFocusCapture,
  onLayout,
  onScroll,
  onContentSizeChange,
  ...props
}: ScrollViewProps) {
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  const frame = useRef<number | null>(null);

  const revealFocusedField = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const input = TextInput.State.currentlyFocusedInput();
      if (!input || !Keyboard.isVisible()) return;
      scroll.current?.measureInWindow(
        (_x, viewportTop, _width, viewportHeight) => {
          input.measureInWindow(
            (_inputX, inputTop, _inputWidth, inputHeight) => {
              if (input !== TextInput.State.currentlyFocusedInput()) return;
              const target = getFocusedFieldScrollOffset({
                scrollY: scrollY.current,
                viewportTop,
                viewportHeight,
                keyboardTop: Keyboard.metrics()?.screenY,
                inputTop,
                inputHeight,
              });
              if (Math.abs(target - scrollY.current) > 1)
                scroll.current?.scrollTo({ y: target, animated: true });
            },
          );
        },
      );
    });
  }, []);

  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', revealFocusedField);
    const changed = Keyboard.addListener(
      'keyboardDidChangeFrame',
      revealFocusedField,
    );
    return () => {
      shown.remove();
      changed.remove();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [revealFocusedField]);

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        {...props}
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        scrollEventThrottle={16}
        onFocusCapture={event => {
          onFocusCapture?.(event);
          revealFocusedField();
        }}
        onLayout={event => {
          onLayout?.(event);
          revealFocusedField();
        }}
        onContentSizeChange={(width, height) => {
          onContentSizeChange?.(width, height);
          revealFocusedField();
        }}
        onScroll={event => {
          scrollY.current = event.nativeEvent.contentOffset.y;
          onScroll?.(event);
        }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
