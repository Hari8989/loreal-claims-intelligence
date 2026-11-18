import { Logger } from '@nestjs/common';
import type { ArgumentsHost, HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core/exceptions/base-exception-filter.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('API error sanitization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a generic 500 body for internal errors without exposing details', () => {
    const response = {};
    const adapter = {
      isHeadersSent: vi.fn(() => false),
      reply: vi.fn(),
    };
    const host = {
      getArgByIndex: vi.fn(() => response),
    } as unknown as ArgumentsHost;
    const filter = new BaseExceptionFilter(adapter as unknown as HttpServer);
    const internalError = new Error(
      'internal database detail and credential-marker',
    );
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    filter.catch(internalError, host);

    expect(adapter.reply).toHaveBeenCalledWith(
      response,
      { statusCode: 500, message: 'Internal server error' },
      500,
    );
    const apiBody = JSON.stringify(adapter.reply.mock.calls[0][1]);
    expect(apiBody).not.toContain('credential-marker');
    expect(apiBody).not.toContain('database detail');
    expect(apiBody).not.toContain('stack');
  });
});
