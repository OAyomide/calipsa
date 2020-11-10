const httpStatus = require("http-status")
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Game = require('../models/game')


async function ValidateJWT(req, res, next) {
  try {
    const headers = req.headers['authorization']
    const token = headers && headers.split(' ')[1]
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Auth token is missing' })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(httpStatus.FORBIDDEN).json({ message: 'Token is invalid' })
      }
      req.user = user
      next()
    })
  } catch (error) {
    console.log(`Error validating JWT`)
    console.log(error)
  }
}

async function ValidateUserExists(req, res, next) {
  try {
    const { id } = req.user
    let user = await User.findOne({ _id: id })
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User does not exist' })
    }
    next()
  } catch (error) {
    console.log(`Error validating if user exists`)
    console.log(error)
  }
}

async function ValidateGameExists(req, res, next) {
  try {
    const { gameid } = req.params
    let game = await Game.findOne({ game_id: gameid })
    if (!game) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Game does not exist' })
    }
    next()
  } catch (error) {
    console.log(`Error validating if game exists`)
    console.log(error)
  }
}

module.exports = { ValidateJWT, ValidateUserExists, ValidateGameExists }