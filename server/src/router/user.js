const { Router } = require('express')
const { CreateUser, GetUser, UpdateUser, DeleteUser, GetAllGames, GetAllMyGames, Login } = require('../controllers/user')
const { ValidateJWT, ValidateUserExists } = require('../middleware/auth')
const router = Router()

router.post('/login', Login)
router.post('/new', CreateUser)
router.get('/me/games', ValidateJWT, GetAllMyGames)
router.use([ValidateJWT, ValidateUserExists])
router.get('/:id', GetUser)
router.put('/:id', UpdateUser)
router.delete('/:id', DeleteUser)
router.get('/:id/games', GetAllGames)


module.exports = router