import { abortManager } from '../abortController';

/**
 * This test suite contains tests for the `AbortManager` class.
 */
describe('AbortManager', () => {

  // Reset the abortManager before each test
  beforeEach(() => {
    abortManager.abortRequest();
  });

  /**
   * Tests if the `startNewRequest` method starts a new request and returns an AbortSignal.
   */
  it('should start a new request and return an AbortSignal', () => {
    const signal = abortManager.startNewRequest();

    // Assert that the returned signal is an instance of AbortSignal and is not aborted
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  /**
   * Tests if the `abortRequest` method aborts the current request.
   */
  it('should abort the current request', (done) => {
    const signal = abortManager.startNewRequest();
    expect(signal.aborted).toBe(false);

    // Set up an abort event listener
    signal.onabort = () => {
      // Assert that the signal is aborted when abortRequest is called
      expect(signal.aborted).toBe(true);
      done();
    };

    abortManager.abortRequest();
  });

  /**
   * Tests if the `startNewRequest` method aborts the previous request when starting a new one.
   */
  it('should abort the previous request when starting a new one', (done) => {
    const firstSignal = abortManager.startNewRequest();

    // Set up an abort event listener for the first signal
    firstSignal.onabort = () => {
      // Assert that the first signal is aborted when a new request is started
      expect(firstSignal.aborted).toBe(true);
      done();
    };

    // Start a new request
    const secondSignal = abortManager.startNewRequest();

    // Assert that the second signal is different from the first and is not aborted
    expect(secondSignal).not.toBe(firstSignal);
    expect(secondSignal.aborted).toBe(false);
  });

  /**
   * Tests if the `shouldAbort` method correctly determines whether the current request should be aborted.
   */
  it('should determine if the current request should be aborted', () => {
    // Initially, there is no request, so shouldAbort should return true
    expect(abortManager.shouldAbort()).toBe(true);

    // After starting a new request, shouldAbort should return false
    abortManager.startNewRequest();
    expect(abortManager.shouldAbort()).toBe(false);

    // After aborting the request, shouldAbort should return true again
    abortManager.abortRequest();
    expect(abortManager.shouldAbort()).toBe(true);
  });

});
