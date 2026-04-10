const User = require('../models/user.server.model');
const Player = require('../models/player.server.model');
const Tournament = require('../models/tournament.server.model');

const {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  getUserFromToken,
  requireAuth,
  requireRole
} = require('../helpers/auth.server.helper');

const { getErrorMessage } = require('../helpers/error.server.helper');

const ALLOWED_ROLES = ['Admin', 'Player'];
const ALLOWED_STATUSES = ['Upcoming', 'Ongoing', 'Completed'];

const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
};

const normalizeString = (value) => {
  return typeof value === 'string' ? value.trim() : value;
};

const requireNonEmptyString = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty or only spaces`);
  }
  return value.trim();
};

const normalizeEmail = (email) => {
  return requireNonEmptyString(email, 'Email').toLowerCase();
};

const validateRole = (role) => {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error('Invalid role value');
  }
  return role;
};

const validateStatus = (status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error('Invalid tournament status');
  }
  return status;
};

const parseAndValidateDate = (dateValue) => {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Invalid tournament date');
  }

  return parsedDate;
};

const parseAndValidateRanking = (ranking) => {
  if (
    typeof ranking !== 'number' ||
    !Number.isInteger(ranking) ||
    ranking < 1 ||
    ranking > 100000
  ) {
    throw new Error('Ranking must be a whole number between 1 and 100000');
  }

  return ranking;
};

const requireValidObjectId = (id, fieldName) => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return id;
};

/**
 * Resolve current user from GraphQL context
 */
const resolveCurrentUser = async (context) => {
  if (context && context.currentUser) {
    return context.currentUser;
  }

  if (context && context.req) {
    return await getUserFromToken(context.req);
  }

  return null;
};

/**
 * Convert Mongoose document or populated object safely
 */
const mapDoc = (doc) => {
  if (!doc) return null;

  const plainDoc = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const idValue = doc._id ? doc._id.toString() : plainDoc._id?.toString();

  if (plainDoc.date) {
    const parsedDate =
      plainDoc.date instanceof Date
        ? plainDoc.date
        : new Date(Number(plainDoc.date) || plainDoc.date);

    plainDoc.date = Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate.toISOString();
  }

  return {
    ...plainDoc,
    id: idValue
  };
};

/**
 * Remove player from all tournament relationships
 */
const removePlayerFromAllTournaments = async (playerId) => {
  await Tournament.updateMany(
    { players: playerId },
    { $pull: { players: playerId } }
  );
};

/**
 * Remove tournament from all player relationships
 */
const removeTournamentFromAllPlayers = async (tournamentId) => {
  await Player.updateMany(
    { tournaments: tournamentId },
    { $pull: { tournaments: tournamentId } }
  );
};

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        return currentUser ? mapDoc(currentUser) : null;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    users: async (_, __, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        const users = await User.find().sort({ createdAt: -1 });
        return users.map(mapDoc);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    user: async (_, { id }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(id, 'user id');

        const user = await User.findById(id);
        if (!user) {
          throw new Error('User not found');
        }

        return mapDoc(user);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    players: async (_, __, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        const players = await Player.find()
          .populate('user')
          .populate('tournaments')
          .sort({ createdAt: -1 });

        return players.map(mapDoc);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    player: async (_, { id }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireAuth(currentUser);

        requireValidObjectId(id, 'player id');

        const player = await Player.findById(id)
          .populate('user')
          .populate('tournaments');

        if (!player) {
          throw new Error('Player not found');
        }

        if (
          currentUser.role !== 'Admin' &&
          player.user._id.toString() !== currentUser._id.toString()
        ) {
          throw new Error('Access denied');
        }

        return mapDoc(player);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    tournaments: async (_, __, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireAuth(currentUser);

        const tournaments = await Tournament.find()
          .populate({
            path: 'players',
            populate: { path: 'user' }
          })
          .sort({ date: 1 });

        return tournaments.map(mapDoc);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    tournament: async (_, { id }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireAuth(currentUser);

        requireValidObjectId(id, 'tournament id');

        const tournament = await Tournament.findById(id).populate({
          path: 'players',
          populate: { path: 'user' }
        });

        if (!tournament) {
          throw new Error('Tournament not found');
        }

        return mapDoc(tournament);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    upcomingTournaments: async (_, __, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireAuth(currentUser);

        const tournaments = await Tournament.find({
          status: 'Upcoming',
          date: { $gte: new Date() }
        })
          .populate({
            path: 'players',
            populate: { path: 'user' }
          })
          .sort({ date: 1 });

        return tournaments.map(mapDoc);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    myTournamentHistory: async (_, __, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Player');

        const player = await Player.findOne({ user: currentUser._id }).populate({
          path: 'tournaments',
          populate: {
            path: 'players',
            populate: { path: 'user' }
          }
        });

        if (!player) {
          throw new Error('Player profile not found');
        }

        return player.tournaments.map(mapDoc);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    }
  },

  Mutation: {
    register: async (_, { username, email, password, role = 'Player', adminSecretKey }, context) => {
      try {
        const normalizedUsername = requireNonEmptyString(username, 'Username');
        const normalizedEmail = normalizeEmail(email);
        const normalizedPassword = requireNonEmptyString(password, 'Password');
        const validatedRole = validateRole(role);

        if (
          validatedRole === 'Admin' &&
          adminSecretKey !== process.env.ADMIN_SECRET_KEY
        ) {
          throw new Error('Invalid admin secret key');
        }

        const existingUserByEmail = await User.findOne({ email: normalizedEmail });
        if (existingUserByEmail) {
          throw new Error('A user with this email already exists');
        }

        const existingUserByUsername = await User.findOne({ username: normalizedUsername });
        if (existingUserByUsername) {
          throw new Error('A user with this username already exists');
        }

        const user = new User({
          username: normalizedUsername,
          email: normalizedEmail,
          password: normalizedPassword,
          role: validatedRole
        });

        await user.save();

        if (validatedRole === 'Player') {
          const existingPlayer = await Player.findOne({ user: user._id });

          if (!existingPlayer) {
            await Player.create({
              user: user._id,
              ranking: 1000,
              tournaments: []
            });
          }
        }

        const token = generateToken(user);

        if (context && context.res) {
          setAuthCookie(context.res, token);
        }

        return {
          message: 'Registration successful',
          user: mapDoc(user),
          token
        };
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    login: async (_, { email, password }, context) => {
      try {
        const normalizedEmail = normalizeEmail(email);
        const normalizedPassword = requireNonEmptyString(password, 'Password');

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isMatch = await user.comparePassword(normalizedPassword);

        if (!isMatch) {
          throw new Error('Invalid email or password');
        }

        const token = generateToken(user);

        if (context && context.res) {
          setAuthCookie(context.res, token);
        }

        return {
          message: 'Login successful',
          user: mapDoc(user),
          token
        };
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    logout: async (_, __, context) => {
      try {
        if (context && context.res) {
          clearAuthCookie(context.res);
        }

        return {
          message: 'Logout successful'
        };
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    createUser: async (_, { username, email, password, role }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        const normalizedUsername = requireNonEmptyString(username, 'Username');
        const normalizedEmail = normalizeEmail(email);
        const normalizedPassword = requireNonEmptyString(password, 'Password');
        const validatedRole = validateRole(role);

        const existingUserByEmail = await User.findOne({ email: normalizedEmail });
        if (existingUserByEmail) {
          throw new Error('A user with this email already exists');
        }

        const existingUserByUsername = await User.findOne({ username: normalizedUsername });
        if (existingUserByUsername) {
          throw new Error('A user with this username already exists');
        }

        const user = new User({
          username: normalizedUsername,
          email: normalizedEmail,
          password: normalizedPassword,
          role: validatedRole
        });

        await user.save();

        if (validatedRole === 'Player') {
          const existingPlayer = await Player.findOne({ user: user._id });

          if (!existingPlayer) {
            await Player.create({
              user: user._id,
              ranking: 1000,
              tournaments: []
            });
          }
        }

        return mapDoc(user);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    updateUser: async (_, { id, username, email, password, role }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(id, 'user id');

        const user = await User.findById(id);
        if (!user) {
          throw new Error('User not found');
        }

        const oldRole = user.role;

        if (
          username === undefined &&
          email === undefined &&
          password === undefined &&
          role === undefined
        ) {
          throw new Error('At least one field is required to update the user');
        }

        if (username !== undefined) {
          const normalizedUsername = requireNonEmptyString(username, 'Username');

          const existingUserByUsername = await User.findOne({
            username: normalizedUsername,
            _id: { $ne: user._id }
          });

          if (existingUserByUsername) {
            throw new Error('A user with this username already exists');
          }

          user.username = normalizedUsername;
        }

        if (email !== undefined) {
          const normalizedEmail = normalizeEmail(email);

          const existingUserByEmail = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: user._id }
          });

          if (existingUserByEmail) {
            throw new Error('A user with this email already exists');
          }

          user.email = normalizedEmail;
        }

        if (password !== undefined) {
          if (password === '') {
            throw new Error('Password cannot be empty');
          }

          user.password = requireNonEmptyString(password, 'Password');
        }

        if (role !== undefined) {
          user.role = validateRole(role);
        }

        await user.save();

        if (user.role === 'Player') {
          const existingPlayer = await Player.findOne({ user: user._id });

          if (!existingPlayer) {
            await Player.create({
              user: user._id,
              ranking: 1000,
              tournaments: []
            });
          }
        }

        if (oldRole === 'Player' && user.role === 'Admin') {
          const existingPlayer = await Player.findOne({ user: user._id });

          if (existingPlayer) {
            await removePlayerFromAllTournaments(existingPlayer._id);
            await Player.findByIdAndDelete(existingPlayer._id);
          }
        }

        return mapDoc(user);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    deleteUser: async (_, { id }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(id, 'user id');

        const user = await User.findById(id);
        if (!user) {
          throw new Error('User not found');
        }

        const player = await Player.findOne({ user: user._id });

        if (player) {
          await removePlayerFromAllTournaments(player._id);
          await Player.findByIdAndDelete(player._id);
        }

        await User.findByIdAndDelete(id);

        return {
          message: 'User deleted successfully'
        };
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    createPlayer: async (_, { userId, ranking = 1000 }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(userId, 'user id');
        const validatedRanking = parseAndValidateRanking(ranking);

        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }

        if (user.role !== 'Player') {
          throw new Error('Only users with Player role can have a player profile');
        }

        const existingPlayer = await Player.findOne({ user: userId });
        if (existingPlayer) {
          throw new Error('Player profile already exists for this user');
        }

        const player = await Player.create({
          user: userId,
          ranking: validatedRanking,
          tournaments: []
        });

        const populatedPlayer = await Player.findById(player._id).populate('user');

        return mapDoc(populatedPlayer);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    updatePlayerRanking: async (_, { playerId, ranking }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(playerId, 'player id');
        const validatedRanking = parseAndValidateRanking(ranking);

        const player = await Player.findById(playerId);
        if (!player) {
          throw new Error('Player not found');
        }

        player.ranking = validatedRanking;
        await player.save();

        const updatedPlayer = await Player.findById(player._id)
          .populate('user')
          .populate('tournaments');

        return mapDoc(updatedPlayer);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    deletePlayer: async (_, { id }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(id, 'player id');

        const player = await Player.findById(id);
        if (!player) {
          throw new Error('Player not found');
        }

        await removePlayerFromAllTournaments(player._id);
        await Player.findByIdAndDelete(id);

        return {
          message: 'Player deleted successfully'
        };
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    createTournament: async (_, { name, game, date, status = 'Upcoming' }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        const normalizedName = requireNonEmptyString(name, 'Tournament name');
        const normalizedGame = requireNonEmptyString(game, 'Game name');
        const parsedDate = parseAndValidateDate(date);
        const validatedStatus = validateStatus(status);

        const existingTournament = await Tournament.findOne({
          name: normalizedName,
          game: normalizedGame,
          date: parsedDate,
          status: validatedStatus
        });

        if (existingTournament) {
          throw new Error(
            'A tournament with the same name, game, date, and status already exists.'
          );
        }

        const tournament = await Tournament.create({
          name: normalizedName,
          game: normalizedGame,
          date: parsedDate,
          status: validatedStatus,
          players: []
        });

        const createdTournament = await Tournament.findById(tournament._id);

        return mapDoc(createdTournament);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    updateTournament: async (_, { id, name, game, date, status }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(id, 'tournament id');

        const tournament = await Tournament.findById(id);
        if (!tournament) {
          throw new Error('Tournament not found');
        }

        if (
          name === undefined &&
          game === undefined &&
          date === undefined &&
          status === undefined
        ) {
          throw new Error('At least one field is required to update the tournament');
        }

        const updatedName =
          name !== undefined
            ? requireNonEmptyString(name, 'Tournament name')
            : tournament.name;

        const updatedGame =
          game !== undefined
            ? requireNonEmptyString(game, 'Game name')
            : tournament.game;

        const updatedDate =
          date !== undefined
            ? parseAndValidateDate(date)
            : tournament.date;

        const updatedStatus =
          status !== undefined
            ? validateStatus(status)
            : tournament.status;

        const duplicateTournament = await Tournament.findOne({
          name: updatedName,
          game: updatedGame,
          date: updatedDate,
          status: updatedStatus,
          _id: { $ne: tournament._id }
        });

        if (duplicateTournament) {
          throw new Error(
            'A tournament with the same name, game, date, and status already exists.'
          );
        }

        tournament.name = updatedName;
        tournament.game = updatedGame;
        tournament.date = updatedDate;
        tournament.status = updatedStatus;

        await tournament.save();

        const updatedTournament = await Tournament.findById(tournament._id).populate({
          path: 'players',
          populate: { path: 'user' }
        });

        return mapDoc(updatedTournament);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    deleteTournament: async (_, { id }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(id, 'tournament id');

        const tournament = await Tournament.findById(id);
        if (!tournament) {
          throw new Error('Tournament not found');
        }

        await removeTournamentFromAllPlayers(tournament._id);
        await Tournament.findByIdAndDelete(id);

        return {
          message: 'Tournament deleted successfully'
        };
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    assignPlayerToTournament: async (_, { playerId, tournamentId }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Admin');

        requireValidObjectId(playerId, 'player id');
        requireValidObjectId(tournamentId, 'tournament id');

        const player = await Player.findById(playerId);
        if (!player) {
          throw new Error('Player not found');
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          throw new Error('Tournament not found');
        }

        const alreadyInTournament = tournament.players.some(
          (id) => id.toString() === player._id.toString()
        );

        if (alreadyInTournament) {
          throw new Error('Player is already assigned to this tournament');
        }

        tournament.players.push(player._id);
        await tournament.save();

        const alreadyInPlayerHistory = player.tournaments.some(
          (id) => id.toString() === tournament._id.toString()
        );

        if (!alreadyInPlayerHistory) {
          player.tournaments.push(tournament._id);
          await player.save();
        }

        const updatedTournament = await Tournament.findById(tournament._id).populate({
          path: 'players',
          populate: { path: 'user' }
        });

        return mapDoc(updatedTournament);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    joinTournament: async (_, { tournamentId }, context) => {
      try {
        const currentUser = await resolveCurrentUser(context);
        requireRole(currentUser, 'Player');

        requireValidObjectId(tournamentId, 'tournament id');

        const player = await Player.findOne({ user: currentUser._id });
        if (!player) {
          throw new Error('Player profile not found');
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
          throw new Error('Tournament not found');
        }

        if (tournament.status !== 'Upcoming') {
          throw new Error('You can only join upcoming tournaments');
        }

        if (new Date(tournament.date) < new Date()) {
          throw new Error('You cannot join a tournament in the past');
        }

        const alreadyInTournament = tournament.players.some(
          (id) => id.toString() === player._id.toString()
        );

        if (alreadyInTournament) {
          throw new Error('You have already joined this tournament');
        }

        tournament.players.push(player._id);
        await tournament.save();

        const alreadyInHistory = player.tournaments.some(
          (id) => id.toString() === tournament._id.toString()
        );

        if (!alreadyInHistory) {
          player.tournaments.push(tournament._id);
          await player.save();
        }

        const updatedTournament = await Tournament.findById(tournament._id).populate({
          path: 'players',
          populate: { path: 'user' }
        });

        return mapDoc(updatedTournament);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    }
  },

  Player: {
    user: async (parent) => {
      if (parent.user && parent.user.username) {
        return mapDoc(parent.user);
      }

      const user = await User.findById(parent.user);
      return mapDoc(user);
    },

    tournaments: async (parent) => {
      if (
        parent.tournaments &&
        parent.tournaments.length > 0 &&
        typeof parent.tournaments[0] === 'object' &&
        parent.tournaments[0].name
      ) {
        return parent.tournaments.map(mapDoc);
      }

      const tournaments = await Tournament.find({
        _id: { $in: parent.tournaments || [] }
      });

      return tournaments.map(mapDoc);
    }
  },

  Tournament: {
    players: async (parent) => {
      if (
        parent.players &&
        parent.players.length > 0 &&
        typeof parent.players[0] === 'object' &&
        parent.players[0].ranking !== undefined
      ) {
        return parent.players.map(mapDoc);
      }

      const players = await Player.find({
        _id: { $in: parent.players || [] }
      }).populate('user');

      return players.map(mapDoc);
    }
  }
};

module.exports = resolvers;