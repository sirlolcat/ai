import { nanoid, decodeAIStreamChunk } from '../utils';

/**
 * This test suite contains tests for utility functions.
 */
describe('Utility Functions', () => {

  /**
   * Tests if the `nanoid` function generates a 7-character random string
   * using a custom alphabet.
   */
  it('should generate a 7-character random string', () => {
    const id = nanoid();

    // Assert that the generated string is 7 characters long
    expect(id).toHaveLength(7);

    // Assert that the generated string only contains characters from the custom alphabet
    expect(/^[0-9A-Za-z]{7}$/.test(id)).toBe(true);
  });

  /**
   * Tests if the `decodeAIStreamChunk` function decodes a chunk of binary data
   * from an AI stream into a string.
   */
  it('should decode a chunk of binary data into a string', () => {
    const data = new Uint8Array([72, 101, 108, 108, 111]); // Represents the string "Hello"
    const text = decodeAIStreamChunk(data);

    // Assert that the decoded string is "Hello"
    expect(text).toBe('Hello');
  });
});
