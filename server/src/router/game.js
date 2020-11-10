const { Router } = require('express')
const { AcceptInvite, DeleteGame, UpdateGame, GetGame, CreateGame } = require('../controllers/game')
const { ValidateJWT, ValidateGameExists, ValidateUserExists } = require('../middleware/auth')
const router = Router()

router.post('/new', [ValidateJWT, ValidateUserExists], CreateGame)
router.get('/:gameid', [ValidateJWT, ValidateGameExists], GetGame)
router.put('/invite/:gameid', [ValidateJWT, ValidateGameExists], AcceptInvite)
router.delete('/:gameid', ValidateJWT, DeleteGame)
router.put('/:gamedid', ValidateJWT, UpdateGame)

module.exports = router