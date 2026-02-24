import { StreamHandler } from '../StreamHandler';

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}));

describe('StreamHandler', () => {
  let handler: StreamHandler;

  beforeEach(() => {
    handler = new StreamHandler();
  });

  describe('onEvent / emit', () => {
    it('calls listeners with emitted events', () => {
      const listener = vi.fn();
      handler.onEvent(listener);
      handler.emit({ type: 'typing_start', threadId: 't-1', sender: 'user' });
      expect(listener).toHaveBeenCalledWith({ type: 'typing_start', threadId: 't-1', sender: 'user' });
    });

    it('supports multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      handler.onEvent(listener1);
      handler.onEvent(listener2);
      handler.emit({ type: 'typing_end', threadId: 't-1', sender: 'architect' });
      expect(listener1).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledOnce();
    });

    it('returns unsubscribe function', () => {
      const listener = vi.fn();
      const unsub = handler.onEvent(listener);
      unsub();
      handler.emit({ type: 'typing_start', threadId: 't-1', sender: 'user' });
      expect(listener).not.toHaveBeenCalled();
    });

    it('catches listener errors without crashing', () => {
      const badListener = vi.fn(() => { throw new Error('boom'); });
      const goodListener = vi.fn();
      handler.onEvent(badListener);
      handler.onEvent(goodListener);
      handler.emit({ type: 'typing_start', threadId: 't-1', sender: 'user' });
      expect(goodListener).toHaveBeenCalledOnce();
    });
  });

  describe('registerAbort / cancelResponse / cleanupAbort', () => {
    it('registers and returns abort controller', () => {
      const controller = handler.registerAbort('t-1');
      expect(controller).toBeInstanceOf(AbortController);
    });

    it('cancels response by aborting the controller', () => {
      const controller = handler.registerAbort('t-1');
      const abortSpy = vi.spyOn(controller, 'abort');
      handler.cancelResponse('t-1');
      expect(abortSpy).toHaveBeenCalled();
    });

    it('does nothing when cancelling non-existent thread', () => {
      expect(() => handler.cancelResponse('nonexistent')).not.toThrow();
    });

    it('cleans up abort controller', () => {
      handler.registerAbort('t-1');
      handler.cleanupAbort('t-1');
      // Cancelling after cleanup should not abort
      expect(() => handler.cancelResponse('t-1')).not.toThrow();
    });
  });

  describe('emitTypingStart / emitTypingEnd', () => {
    it('emits typing_start event', () => {
      const listener = vi.fn();
      handler.onEvent(listener);
      handler.emitTypingStart('t-1', 'architect');
      expect(listener).toHaveBeenCalledWith({
        type: 'typing_start',
        threadId: 't-1',
        sender: 'architect',
      });
    });

    it('emits typing_end event', () => {
      const listener = vi.fn();
      handler.onEvent(listener);
      handler.emitTypingEnd('t-1', 'reviewer');
      expect(listener).toHaveBeenCalledWith({
        type: 'typing_end',
        threadId: 't-1',
        sender: 'reviewer',
      });
    });
  });

  describe('delay', () => {
    it('resolves after the given time', async () => {
      vi.useFakeTimers();
      const promise = handler.delay(100);
      vi.advanceTimersByTime(100);
      await expect(promise).resolves.toBeUndefined();
      vi.useRealTimers();
    });

    it('rejects when aborted', async () => {
      vi.useFakeTimers();
      const controller = new AbortController();
      const promise = handler.delay(1000, controller.signal);
      controller.abort();
      await expect(promise).rejects.toThrow('Aborted');
      vi.useRealTimers();
    });
  });
});
