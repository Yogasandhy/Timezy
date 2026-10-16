/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { View } from 'react-native';
import { QuietStepsMark } from '../src/shared/components/QuietStepsMark';

test('renders the selected Quiet Steps brand mark', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<QuietStepsMark />);
  });
  expect(tree?.root.findAllByType(View)).toHaveLength(7);
});
