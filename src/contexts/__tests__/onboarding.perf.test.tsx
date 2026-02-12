import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { OnboardingProvider, useOnboarding } from '../onboarding';


describe('OnboardingContext Performance', () => {
  it('should have stable context value reference across re-renders', async () => {
    const renderValues: unknown[] = [];
    let triggerUpdate: (() => void) | undefined;

    const Consumer = () => {
      const value = useOnboarding();
      renderValues.push(value);
      return <Text>Consumer</Text>;
    };

    const TestWrapper = () => {
      const [count, setCount] = React.useState(0);
      triggerUpdate = () => setCount((c) => c + 1);
      return (
        <View>
          <Text testID="count">{count}</Text>
          <OnboardingProvider>
            <Consumer />
          </OnboardingProvider>
        </View>
      );
    };

    render(<TestWrapper />);

    await waitFor(() => expect(renderValues.length).toBeGreaterThan(0));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const valueAfterLoad = renderValues[renderValues.length - 1];

    expect(triggerUpdate).toBeDefined();

    // Trigger re-render of parent
    await act(async () => {
      triggerUpdate?.();
    });

    await waitFor(() => {
      expect(renderValues.length).toBeGreaterThan(1);
    });

    const valueAfterRerender = renderValues[renderValues.length - 1];

    expect(valueAfterLoad).toBe(valueAfterRerender);
  }, 10000);
});
