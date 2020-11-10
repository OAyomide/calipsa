const httpStatus = require('http-status')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Game = require('../models/game')
const bcrypt = require('bcrypt-nodejs')


async function CreateUser(req, res) {
  try {
    const user = new User({
      ...req.body
    })
    const newUser = await user.save()
    const payload = {
      id: newUser.id,
      username: newUser.username
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' })
    const result = { token }
    return res.status(httpStatus.CREATED).json({ data: result, error: null, status: httpStatus.CREATED, message: 'User created' })
  } catch (error) {
    const err = User.handleCreationError(error)
    if (err?.status === httpStatus.CONFLICT) {
      return res.status(httpStatus.CONFLICT).json({ data: null, error: 'Email already taken', status: httpStatus.CONFLICT, message: 'Unable to creat new user' })
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ data: null, error: 'Intenal Server Error', status: httpStatus.INTERNAL_SERVER_ERROR, message: 'An internal error occured' })
  }
}


async function UpdateUser(req, res, next) {
  try {
    let user = await User.findOneAndUpdate({ _id: req.params.id }, req.body)
    user.password = ""
    return res.status(httpStatus.OK).json({ data: user, error: null, status: httpStatus.OK, message: 'User updated' })
  } catch (error) {
    console.log(`Error updating user`)
    return next(error)
  }
}

async function DeleteUser(req, res, next) {
  try {
    await User.deleteOne({ _id: req.params.id })
    return res.status(httpStatus.OK).json({ data: null, error: null, status: httpStatus.OK, message: 'User deleted' })
  } catch (error) {
    console.log(`Error deleting user`)
    return next(error)
  }
}

async function GetUser(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.user.id })
    user.password = ""
    return res.status(httpStatus.OK).json({ data: user, error: null, status: httpStatus.OK, message: 'User found' })
  } catch (error) {
    console.log(`Error finding user`)
    return next(error)
  }
}

async function GetAllGames(req, res) {
  try {

    const populatedGames = await User.findOne({ _id: req.params.id }).populate('games')
    if (!populatedGames || populatedGames && populatedGames.games.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ data: null, error: 'ERRNOTFOUND', status: httpStatus.NOT_FOUND, message: 'No record found' })
    }

    populatedGames.password = ""
    const docs = await Game.find({ opponent: req.params.id })

    if (docs.length !== 0) {
      populatedGames.games = populatedGames.games.concat(...docs)
    }

    return res.status(httpStatus.OK).json({ data: populatedGames, error: null, status: httpStatus.OK, message: 'All games for a user found' })
  } catch (error) {
    console.log(`Error getting all games for user`)
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error getting all games for a user', data: null, error, status: httpStatus.INTERNAL_SERVER_ERROR })
  }
}

async function GetAllMyGames(req, res) {
  try {
    const populatedGames = await User.findOne({ _id: req.user.id }).populate({
      path: 'games', populate: {
        path: 'host'
      }
    })
    if (!populatedGames || populatedGames && populatedGames.games.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ data: null, error: 'ERRNOTFOUND', status: httpStatus.NOT_FOUND, message: 'No record found' })
    }

    populatedGames.password = ""
    const docs = await Game.find({ opponent: req.user.id })
    populatedGames.games = populatedGames.games.concat(...docs)
    return res.status(httpStatus.OK).json({ data: populatedGames, error: null, status: httpStatus.OK, message: 'All games for a user found' })
  } catch (error) {
    console.log(`Error getting my games`)
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error getting all games for a user', data: null, error, status: httpStatus.INTERNAL_SERVER_ERROR })
  }
}

async function Login(req, res) {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid username or password', error: 'INVALID', data: null, status: httpStatus.UNAUTHORIZED })
    }

    const match = await bcrypt.compareSync(password, user.password)

    if (!match) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid username or password', error: 'INVALID', data: null, status: httpStatus.UNAUTHORIZED })
    }
    const payload = {
      id: user.id,
      username: user.username
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' })
    const result = {
      token
    }
    return res.status(httpStatus.OK).json({ message: 'Login Successful', error: null, data: result, status: httpStatus.OK })
  } catch (error) {
    console.log(`Error loggin user in`)
    console.log(error)
  }
}
module.exports = { GetUser, DeleteUser, UpdateUser, CreateUser, GetAllGames, GetAllMyGames, Login }