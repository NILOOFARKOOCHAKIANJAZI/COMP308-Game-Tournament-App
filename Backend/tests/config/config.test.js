describe('config/config.js', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('loads test environment config when NODE_ENV=test', () => {
    process.env.NODE_ENV = 'test';
    const config = require('../../config/config');

    expect(config).toBeDefined();
    expect(config.nodeEnv).toBe('test');
  });
});