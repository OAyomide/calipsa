const router = require('./router')

require('dotenv').config({ path: `.env.${process.env.ENV}` })
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const cors = require('cors')
const { PlayGame } = require('./controllers/game')


mongoose.Promise = global.Promise
mongoose.connection.on('connected', () => {
  console.log(`DB connected`)
})
mongoose.connection.on('error', err => {
  console.log(`MongoDB connection error: `, err)
  process.exit(1)
})

console.log(`Secret key is: `, process.env.JWT_SECRET)
const ConnectToMongo = async () => {
  await mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
}


ConnectToMongo()


io.on('connection', socket => {
  console.log(`Client connected...`)
  socket.on('disconnect', () => {
    socket.removeAllListeners()
  })

  socket.on('create-game-room', room => {
    socket.join(room)
  })


  socket.on(`send-message`, async (data) => {
    let { winner, status } = await PlayGame(data)
    if (status === 'win' || status === 'ended') {
      io.in(data?.gameid).emit('send-message', { sender: data?.sender, text: data?.text })
      io.in(data?.gameid).emit('game-finished', { winner })
      return
    }
    socket.to(data?.gameid).emit('send-message', { sender: data?.sender, text: data?.text })
  })
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.options(cors())
app.use(router)

server.listen(process.env.PORT, () => {
  console.log(`Server up and listening on: ${process.env.PORT}`)
})

module.exports = app