import { describe, it, expect } from 'vitest';
import { resolveGraphqlUrl } from './config.js';

describe('resolveGraphqlUrl', () => {
  it('returns env URL when provided', () => {
    expect(resolveGraphqlUrl('http://example.com/graphql')).toBe(
      'http://example.com/graphql'
    );
  });

  it('returns localhost fallback when env URL is undefined', () => {
    expect(resolveGraphqlUrl(undefined)).toBe(
      'http://localhost:4000/graphql'
    );
  });

  it('returns localhost fallback when env URL is empty', () => {
    expect(resolveGraphqlUrl('')).toBe(
      'http://localhost:4000/graphql'
    );
  });
});