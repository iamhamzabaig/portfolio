import { describe, it, expect } from 'vitest';
import { errorHandler } from '../../src/middlewares/error.middleware.js';

function makeFakeRes() {
  const res = {
    _status: null,
    _body: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
    },
  };
  return res;
}

const noop = () => {};

describe('errorHandler', () => {
  it('duplicate-key error without keyValue property → 409, does not throw', () => {
    const err = { code: 11000 };
    const res = makeFakeRes();
    expect(() => errorHandler(err, {}, res, noop)).not.toThrow();
    expect(res._status).toBe(409);
    expect(res._body.success).toBe(false);
    expect(res._body.message).toContain('field');
  });

  it('ValidationError without errors property → 422, does not throw', () => {
    const err = { name: 'ValidationError' };
    const res = makeFakeRes();
    expect(() => errorHandler(err, {}, res, noop)).not.toThrow();
    expect(res._status).toBe(422);
    expect(res._body.success).toBe(false);
    expect(res._body.details).toEqual([]);
  });

  it('ApiError-like error → responds with its statusCode and message', () => {
    const err = { statusCode: 404, message: 'Nope', details: [] };
    const res = makeFakeRes();
    expect(() => errorHandler(err, {}, res, noop)).not.toThrow();
    expect(res._status).toBe(404);
    expect(res._body.message).toBe('Nope');
    expect(res._body.success).toBe(false);
  });
});
