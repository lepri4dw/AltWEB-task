const {model, Schema} = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      {
        validator: async function (email) {
          if (!this.isModified('email')) return true;
          const user = await User.findOne({email: email});
          return !Boolean(user);
        },
        message: 'This user is already registered'
      },
      {
        validator: function(email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: 'Please enter a valid email address'
      }
    ]
  },
  displayName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,    validate: {
      validator: function(password) {
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
      },
      message: 'Password must be at least 8 characters long and contain both letters and numbers'
    }  },
  role: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'admin']
  },
  avatar: {
    type: String,
    required: true,
  },
  googleId: String,
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.set('toJSON', {
  transform: (doc, ret, _options) => {
    delete ret.password;
    return ret;
  }
});

UserSchema.methods.checkPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateJWT = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const User = model('User', UserSchema);

module.exports = User;
