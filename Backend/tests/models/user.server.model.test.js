const User = require('../../app/models/user.server.model');

const runPreSave = (user) =>
  new Promise((resolve, reject) => {
    user.schema.s.hooks.execPre('save', user, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

describe('User model', () => {
  it('normalizes email to lowercase and trims spaces before save', async () => {
    const user = new User({
      username: 'Niloo',
      email: '  TEST@EMAIL.COM  ',
      password: 'Password1',
      role: 'Player'
    });

    await runPreSave(user);

    expect(user.email).toBe('test@email.com');
  });

  it('hashes password in pre-save hook', async () => {
    const user = new User({
      username: 'Niloo',
      email: 'user@test.com',
      password: 'Password1',
      role: 'Player'
    });

    const rawPassword = user.password;

    await runPreSave(user);

    expect(user.password).not.toBe(rawPassword);
    expect(user.password.length).toBeGreaterThan(20);
  });

  it('comparePassword returns true for correct password', async () => {
    const user = new User({
      username: 'Niloo',
      email: 'user2@test.com',
      password: 'Password1',
      role: 'Player'
    });

    await runPreSave(user);

    const result = await user.comparePassword('Password1');

    expect(result).toBe(true);
  });

  it('comparePassword returns false for wrong password', async () => {
    const user = new User({
      username: 'Niloo',
      email: 'user3@test.com',
      password: 'Password1',
      role: 'Player'
    });

    await runPreSave(user);

    const result = await user.comparePassword('WrongPassword1');

    expect(result).toBe(false);
  });

  it('toJSON removes password field', () => {
    const user = new User({
      username: 'Niloo',
      email: 'user4@test.com',
      password: 'Password1',
      role: 'Player'
    });

    const json = user.toJSON();

    expect(json.password).toBeUndefined();
  });
});