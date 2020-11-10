const { Schema, SchemaType, Types } = require('mongoose')
const Game = require('../models/game')
const User = require('../models/user')
const shortUUID = require('short-uuid')
const httpStatus = require('http-status')

async function CreateGame(req, res, next) {
  try {
    const uuid = shortUUID()
    const game = new Game({
      game_id: uuid.generate(),
      host: Types.ObjectId.createFromHexString(req.user.id),
      answer: req.body.answer,
      // title: req.body.name
    })

    const newGame = await game.save()
    const user = await User.findOne({ _id: req.user.id })

    user.games = user.games.concat(newGame._id)
    await user.save()
    return res.status(httpStatus.CREATED).json({ data: newGame, error: null, message: 'New game created', status: httpStatus.CREATED })
  } catch (error) {
    console.log(`Error creating game`)
    return next(error)
  }
}

async function GetGame(req, res, next) {
  try {
    const { gameid } = req.params
    const game = await Game.findOne({ game_id: gameid }).populate('host')
    let getWinner = await User.findOne({ _id: game.winner })
    let result = { ...game._doc }
    if (getWinner) {
      result.winner = getWinner.username
    }
    return res.status(httpStatus.OK).json({ data: result, error: null, message: 'Game fetched', status: httpStatus.OK })
  } catch (error) {
    console.log(`Error getting game`)
    next(error)
  }
}

async function DeleteGame(req, res, next) {
  try {
    const { gameid } = req.param
    await Game.deleteOne({ game_id: gameid })
    return res.status(httpStatus.OK).json({ data: null, error: null, message: 'Game deleted', status: httpStatus.OK })
  } catch (error) {
    console.log(`Error getting game`)
    next(error)
  }
}

async function UpdateGame(req, res, next) {
  try {
    const { gameid } = req.param
    const game = await Game.findOneAndUpdate({ game_id: gameid }, req.body)
    return res.status(httpStatus.OK).json({ data: game, error: null, message: 'Game updated', status: httpStatus.OK })
  } catch (error) {
    console.log(`Error getting game`)
    next(error)
  }
}

async function AcceptInvite(req, res, next) {
  try {
    const { gameid } = req.params
    const { id: invitee } = req.user
    const game = await Game.findOne({ game_id: gameid })

    if (String(game.host) === invitee) {
      return res.status(httpStatus.CONFLICT).json({ data: null, error: 'CONFLICT', status: httpStatus.CONFLICT, message: 'Cannot accept own invite' })
    }

    if (!game.opponent) {
      const updatedUser = await User.findOne({ _id: invitee })
      game.opponent = updatedUser.username
      updatedUser.games = updatedUser.games.concat(game.id)
      await updatedUser.save()
      await game.save()
      return res.status(httpStatus.OK).json({ data: null, error: null, status: httpStatus.OK, message: 'Invited Accepted' })
    }

    if (game.opponent === invitee) {
      return res.status(httpStatus.CONFLICT).json({ data: null, error: null, status: httpStatus.CONFLICT, message: 'Invite already accepted' })
    }

    return res.status(httpStatus.NOT_ACCEPTABLE).json({ data: null, error: null, status: httpStatus.NOT_ACCEPTABLE, message: 'Invite full. Cannot play with more than one person' })
  } catch (error) {
    console.log(`Error accepting invite here`)
    return next(error)
  }
}


async function PlayGame({ gameid, host, text, sender, opponent }) {
  try {
    let game = await Game.findOne({ game_id: gameid }).populate('host')
    let senderInfo = await User.findOne({ _id: sender })

    let count = game.count
    let history = game.history
    let winner = null

    history.push({ sender, text, timestamp: new Date() })

    if (count <= 20) {
      if (senderInfo.username.toLowerCase() === host.toLowerCase()) {
        count++
        if (count === 20) {
          winner = senderInfo._id
          await Game.findOneAndUpdate({ game_id: gameid }, { count, winner, history })
          return { status: 'ended', winner: host }
        }
        await Game.findOneAndUpdate({ game_id: gameid }, { history, count })
        return { status: 'open', winner: null }
      } else if (senderInfo.username.toLowerCase() === opponent.toLowerCase()) {
        if (text === game.answer) {
          winner = senderInfo.id
          await Game.findOneAndUpdate({ game_id: gameid }, { count, winner, history })
          return { status: 'ended', winner: opponent }
        }
        await Game.findOneAndUpdate({ game_id: gameid }, { history })
        return { status: 'open', winner: null }
      }
      await Game.findOneAndUpdate({ game_id: gameid }, { history })
      return { status: 'open', winner: null }
    } else {
      if (!game.winner) {
        winner = senderInfo._id
        await Game.findOneAndUpdate({ game_id: gameid }, { count, winner, history })
        return { status: 'ended', winner: host }
      }
      return { status: 'ended', winner: host }
    }
  } catch (error) {
    console.log(`Error playing game`)
    console.log(error)
  }
}


module.exports = { CreateGame, UpdateGame, DeleteGame, GetGame, AcceptInvite, PlayGame }