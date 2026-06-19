import { describe, it, expect } from 'vitest';
import { ApiError } from '../../src/utils/ApiError.js';
import { ApiResponse } from '../../src/utils/ApiResponse.js';
import { asyncHandler } from '../../src/utils/asyncHandler.js';

describe('ApiError', () => {
  it('sets statusCode, message, details, and isOperational', () => {
    const err = new ApiError(404, 'Not found', ['x']);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.details).toEqual(['x']);
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });
});

describe('ApiResponse', () => {
  it('shapes a success envelope', () => {
    const res = new ApiResponse(200, { id: 1 }, 'ok');
    expect(res).toEqual({ success: true, statusCode: 200, message: 'ok', data: { id: 1 } });
  });
});

describe('asyncHandler', () => {
  it('forwards async rejection to next', async () => {
    const boom = new Error('boom');
    const handler = asyncHandler(async () => { throw boom; });
    let passed;
    await handler({}, {}, (e) => { passed = e; });
    expect(passed).toBe(boom);
  });
});
