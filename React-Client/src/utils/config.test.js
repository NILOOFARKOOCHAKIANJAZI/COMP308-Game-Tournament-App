import { describe, it, expect } from 'vitest';
import { resolveGraphqlUrl } from './config.js';

const FALLBACK_URL =
  'https://comp308-backend-d0hec7hbg0dye6es.eastus2-01.azurewebsites.net/graphql';

describe('resolveGraphqlUrl', () => {
  it('returns env URL when provided', () => {
    expect(resolveGraphqlUrl('http://example.com/graphql')).toBe(
      'http://example.com/graphql'
    );
  });

  it('returns deployed fallback when env URL is undefined', () => {
    expect(resolveGraphqlUrl(undefined)).toBe(FALLBACK_URL);
  });

  it('returns deployed fallback when env URL is empty', () => {
    expect(resolveGraphqlUrl('')).toBe(FALLBACK_URL);
  });
});
