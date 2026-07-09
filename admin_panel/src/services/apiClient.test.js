import { describe, it, expect } from 'vitest';

import { getApiErrorMessage } from './apiClient';

describe('getApiErrorMessage', () => {
  it('returns a generic message for non-Axios errors', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('Something went wrong');
    expect(getApiErrorMessage('a string')).toBe('Something went wrong');
  });

  it('extracts the API message from an Axios error response', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed',
      response: { data: { message: 'Invalid email or password' } },
    };
    expect(getApiErrorMessage(error)).toBe('Invalid email or password');
  });

  it('falls back to the Axios message when no response body message', () => {
    const error = { isAxiosError: true, message: 'Network Error' };
    expect(getApiErrorMessage(error)).toBe('Network Error');
  });
});
