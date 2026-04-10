const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      unique: true,
      match: [
        /^[A-Za-z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ],
      validate: {
        validator: function (value) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        message: 'Username cannot be empty or only spaces'
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please fill a valid email address'
      ],
      validate: {
        validator: function (value) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        message: 'Email cannot be empty or only spaces'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: [
        {
          validator: function (value) {
            return typeof value === 'string' && value.trim().length > 0;
          },
          message: 'Password cannot be empty or only spaces'
        },
        {
          validator: function (value) {
            return /[A-Za-z]/.test(value) && /\d/.test(value);
          },
          message: 'Password must contain at least one letter and one number'
        }
      ]
    },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Player'],
      default: 'Player'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving

UserSchema.pre('save', async function (next) {
  try {
    if (this.isModified('username') && typeof this.username === 'string') {
      this.username = this.username.trim();
    }

    if (this.isModified('email') && typeof this.email === 'string') {
      this.email = this.email.trim().toLowerCase();
    }

    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare plain password with hashed password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON responses
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema);