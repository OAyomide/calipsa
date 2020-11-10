const { Router } = require('express')
const userRouter = require('./user')
const gameRouter = require('./game')


const router = Router()
router.use('/user', userRouter)
router.use('/game', gameRouter)

module.exports = router