const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PlayerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    ranking: {
      type: Number,
      required: [true, 'Ranking is required'],
      min: [1, 'Ranking must be at least 1'],
      max: [100000, 'Ranking cannot exceed 100000'],
      default: 1000,
      validate: {
        validator: Number.isInteger,
        message: 'Ranking must be a whole number'
      }
    },
    tournaments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tournament'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Player', PlayerSchema);