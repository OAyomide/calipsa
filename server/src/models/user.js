const { model, Schema } = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const httpStatus = require('http-status')
const { schema } = require('./game')

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 100
  },
  games: [{ type: Schema.Types.ObjectId, ref: 'Game' }]
}, {
  timestamps: true
})

userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) {
      return next()
    }
    this.password = bcrypt.hashSync(this.password)
    return next()
  } catch (error) {
    return next(error)
  }
})

userSchema.method({
  comparePassword(password) {
    return bcrypt.compareSync(password, this.password)
  },
})

userSchema.statics = {
  handleCreationError(err) {
    if (err.code === 11000) {
      const error = new Error('Email is already taken')
      error.status = httpStatus.CONFLICT
      return error
    }
    return err
  }
}


module.exports = model('User', userSchema)