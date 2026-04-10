const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TournamentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
      minlength: [3, 'Tournament name must be at least 3 characters long'],
      maxlength: [100, 'Tournament name cannot exceed 100 characters'],
      validate: {
        validator: function (value) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        message: 'Tournament name cannot be empty or only spaces'
      }
    },
    game: {
      type: String,
      required: [true, 'Game name is required'],
      trim: true,
      minlength: [2, 'Game name must be at least 2 characters long'],
      maxlength: [50, 'Game name cannot exceed 50 characters'],
      validate: {
        validator: function (value) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        message: 'Game name cannot be empty or only spaces'
      }
    },
    date: {
      type: Date,
      required: [true, 'Tournament date is required'],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'Tournament date must be a valid date'
      }
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Player'
      }
    ],
    status: {
      type: String,
      required: true,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming'
    }
  },
  {
    timestamps: true
  }
);

TournamentSchema.index(
  { name: 1, game: 1, date: 1, status: 1 },
  { unique: true }
);

module.exports = mongoose.model('Tournament', TournamentSchema);