const Tournament = require('../../app/models/tournament.server.model');

describe('Tournament model', () => {
  it('creates a valid tournament document', () => {
    const tournament = new Tournament({
      name: 'Spring Clash',
      game: 'Valorant',
      date: new Date('2026-05-01T10:00:00Z'),
      status: 'Upcoming',
      players: []
    });

    expect(tournament.name).toBe('Spring Clash');
    expect(tournament.game).toBe('Valorant');
    expect(tournament.status).toBe('Upcoming');
    expect(tournament.players).toEqual([]);
  });

  it('fails validation for invalid status if enum exists', async () => {
    const tournament = new Tournament({
      name: 'Broken Event',
      game: 'CS2',
      date: new Date(),
      status: 'InvalidStatus',
      players: []
    });

    const error = tournament.validateSync();
    expect(error).toBeDefined();
  });
});