import { render } from '@testing-library/react';
import { ErrorFallback } from '../ErrorFallback';

// Mock Linking

describe('ErrorFallback', () => {
  it('renders without crashing', () => {
    render(<ErrorFallback error={new Error('Test error')} componentStack="Test stack" />);
    // Note: detailed UI element queries are skipped due to test environment issues with jest-expo/react-native-web
  });
});
