import { getFocusedFieldScrollOffset } from './KeyboardAwareScrollView';

const geometry = {
  scrollY: 80,
  viewportTop: 100,
  viewportHeight: 500,
  keyboardTop: 500,
  inputTop: 250,
  inputHeight: 50,
};

describe('focused field visibility', () => {
  it('does not move a field that is already visible', () => {
    expect(getFocusedFieldScrollOffset(geometry)).toBe(80);
  });

  it('lifts an obscured field above the keyboard with breathing room', () => {
    expect(getFocusedFieldScrollOffset({ ...geometry, inputTop: 570 })).toBe(
      224,
    );
  });

  it('uses the resized viewport when it ends above the keyboard', () => {
    expect(
      getFocusedFieldScrollOffset({
        ...geometry,
        viewportHeight: 250,
        keyboardTop: 600,
        inputTop: 320,
      }),
    ).toBe(124);
  });

  it('reveals a newly focused field above the current scroll position', () => {
    expect(getFocusedFieldScrollOffset({ ...geometry, inputTop: 70 })).toBe(38);
  });

  it('keeps the start of a tall note visible on a small viewport', () => {
    expect(
      getFocusedFieldScrollOffset({
        ...geometry,
        viewportHeight: 250,
        inputTop: 300,
        inputHeight: 300,
      }),
    ).toBe(268);
  });

  it('never scrolls before the beginning of the form', () => {
    expect(
      getFocusedFieldScrollOffset({ ...geometry, scrollY: 0, inputTop: 70 }),
    ).toBe(0);
  });

  it('ignores a transient collapsed viewport during keyboard layout', () => {
    expect(
      getFocusedFieldScrollOffset({ ...geometry, viewportHeight: 0 }),
    ).toBe(80);
  });
});
