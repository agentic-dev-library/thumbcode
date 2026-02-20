/**
 * Augment global scope with vitest utility types.
 *
 * vitest/globals adds runtime globals (vi, describe, it, expect, etc.)
 * but does NOT expose utility types like Mocked, Mock, MockInstance.
 * This declaration re-exports them so test files across all packages
 * can use them without explicit imports.
 */
import type {
  Mock as _Mock,
  MockInstance as _MockInstance,
  Mocked as _Mocked,
  MockedClass as _MockedClass,
  MockedFunction as _MockedFunction,
  MockedObject as _MockedObject,
} from 'vitest';

declare global {
  type Mock<T extends (...args: any[]) => any = (...args: any[]) => any> = _Mock<T>;
  type MockInstance<T extends (...args: any[]) => any = (...args: any[]) => any> = _MockInstance<T>;
  type Mocked<T> = _Mocked<T>;
  type MockedClass<T extends new (...args: any[]) => any> = _MockedClass<T>;
  type MockedFunction<T extends (...args: any[]) => any> = _MockedFunction<T>;
  type MockedObject<T> = _MockedObject<T>;
}
