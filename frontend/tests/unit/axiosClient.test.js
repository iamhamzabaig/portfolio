import { describe, expect, it } from 'vitest';
import { axiosClient } from '../../src/api/axiosClient.js';

describe('axiosClient', () => {
  it('uses the API base URL and sends credentials', () => {
    expect(axiosClient.defaults.baseURL).toBe('http://localhost:5000/api/v1');
    expect(axiosClient.defaults.withCredentials).toBe(true);
  });
});
