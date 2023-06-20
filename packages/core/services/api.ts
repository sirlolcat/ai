import { decodeAIStreamChunk, nanoid } from '../shared/utils';
import type {
  Message,
  CreateMessage,
  UseChatOptions,
  TApiHeaders,
  TApiBody
} from '../shared/types';

/**
 * Sends a POST HTTP request to the given API endpoint and processes the streaming response.
 *
 * @param {string} endpoint - The URL of the API endpoint to which the request should be sent.
 * @param {CreateMessage[]} messages - The messages to be sent to the chat API.
 * @param {UseChatOptions} options - Configuration options for the chat API, including headers, body, and error handling callbacks.
 * @return {Promise<void>} Resolves when the request is complete or if there is an error.
 * @throws Will throw an Error if the response status is not 200 or if the response body is null.
 */
export async function post(
  endpoint: string,
  messages: CreateMessage[],
  options: UseChatOptions
): Promise<void> {
  const headers: TApiHeaders = options.headers || {};
  const body: TApiBody = {
    ...options.body,
    messages: options.sendExtraMessageFields ? messages : messages.map((message) => ({ content: message.content, role: message.role })),
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });

    if (response.status !== 200) {
      throw new Error(`Received status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    let content = '';

    reader.read().then(function processStream({ done, value }) {
      if (done) {
        const receivedMessage: Message = {
          id: nanoid(),
          content: content,
          role: 'assistant',
          createdAt: new Date(),
        };
        if (options.onFinish) {
          options.onFinish(receivedMessage);
        }
        return;
      }

      content += decodeAIStreamChunk(value);
      reader.read().then(processStream);
    });
  } catch (error) {
    if (options.onError) {
      options.onError(error as Error);
    }
  }
}
