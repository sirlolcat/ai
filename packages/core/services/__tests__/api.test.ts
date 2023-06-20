import { post } from '../api';

// Mock the global fetch function
global.fetch = jest.fn();

// Mock the utilities used in api.ts
jest.mock('../../shared/utils', () => ({
  decodeAIStreamChunk: jest.fn((value) => new TextDecoder().decode(value)),
  nanoid: jest.fn(() => 'random-id'),
}));

/**
 * Test suite for the `post` function in the API service.
 */
describe('post function', () => {

  /**
   * Clears mock data before each test.
   */
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  /**
   * Tests if the `post` function sends a POST request and processes a successful streaming response.
   */
  it('sends a POST request and handles a successful streaming response', (done) => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('test content'));
        controller.close();
      }
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      body: mockStream,
    });

    const handleFinish = jest.fn(() => {
      expect(handleFinish).toHaveBeenCalledWith(expect.objectContaining({
        id: 'random-id',
        content: 'test content',
        role: 'assistant',
      }));
      done();
    });

    post(
      'http://mock-api.com/endpoint',
      [{ content: 'test content', role: 'system' }],
      {
        headers: { 'Content-Type': 'application/json' },
        onFinish: handleFinish,
      }
    );
  });

  /**
   * Tests if the `post` function handles a non-200 response status.
   */
  it('handles a non-200 response status', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 404,
    });

    const handleError = jest.fn();

    await post(
      'http://mock-api.com/endpoint',
      [{ content: 'test content', role: 'system' }],
      {
        onError: handleError,
      }
    );

    expect(handleError).toHaveBeenCalledWith(new Error('Received status 404'));
  });

  /**
   * Tests if the `post` function handles a null response body.
   */
  it('handles a null response body', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      body: null,
    });

    const handleError = jest.fn();

    await post(
      'http://mock-api.com/endpoint',
      [{ content: 'test content', role: 'system' }],
      {
        onError: handleError,
      }
    );

    expect(handleError).toHaveBeenCalledWith(new Error('Response body is null'));
  });

  /**
   * Tests if the `post` function handles errors thrown during fetching.
   */
  it('handles errors thrown during fetching', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const handleError = jest.fn();

    await post(
      'http://mock-api.com/endpoint',
      [{ content: 'test content', role: 'system' }],
      {
        onError: handleError,
      }
    );

    expect(handleError).toHaveBeenCalledWith(new Error('Network error'));
  });
});
