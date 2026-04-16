const Player = require('../../app/models/player.server.model');

describe('Player model', () => {
  it('creates a valid player document', () => {
    const player = new Player({
      user: '507f1f77bcf86cd799439011',
      ranking: 1000,
      tournaments: []
    });

    expect(player.user.toString()).toBe('507f1f77bcf86cd799439011');
    expect(player.ranking).toBe(1000);
    expect(player.tournaments).toEqual([]);
  });
});