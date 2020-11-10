
const { expect } = require('chai')
const chai = require('chai')
const chai_http = require('chai-http')
const jwt = require('jsonwebtoken')
const User = require('../src/models/user')
const Game = require('../src/models/game')
const server = require('../src/index')
const { OK, UNAUTHORIZED, CONFLICT, CREATED } = require('http-status')
const io = require('socket.io-client')


let hostToken;
let opponentToken
let gameId;
let socket;
let opponentId
let hostId
let opponentName
let hostName


chai.use(chai_http)
chai.should()

describe('Test suite #1', function () {
  this.timeout(0)

  beforeEach(function (done) {
    socket = io.connect(`http://localhost:${process.env.PORT}`, { forceNew: true })

    socket.on('connect', function () {
      done()
    })
    socket.on('disconnect', function () {
      socket.removeAllListeners()
    })
  })

  afterEach(function (done) {
    if (socket.connected) {
      socket.disconnect()
    }
    done()
  })

  describe('Signup', function () {
    it('Should sign a user up', function (done) {
      chai.request(server)
        .post('/user/new')
        .send({
          username: "ayomide",
          password: "ayomide"
        })
        .end((err, res) => {
          res.should.have.status(CREATED)
          done()
        })
    })

    it('Should sign a user up', function (done) {
      chai.request(server)
        .post('/user/new')
        .send({
          username: "jacob",
          password: "jacob"
        })
        .end((err, res) => {
          opponentToken = res.body.data.token
          res.should.have.status(CREATED)
          done()
        })
    })

    it('Should return a 409 if user already exists', function (done) {
      chai.request(server)
        .post('/user/new')
        .send({
          username: "ayomide",
          password: "ayomide"
        })
        .end((err, res) => {
          res.should.have.status(CONFLICT)
          done()
        })
    })
  })

  describe('User login and game Game creation', function () {

    it('Should return 401 for invalid username or password', function (done) {
      chai.request(server)
        .post('/user/login')
        .send({ message: 'ayomide', password: 'ayo' })
        .end((err, res) => {
          res.should.have.status(UNAUTHORIZED)
          done()
        })
    })


    it('Should login user', function (done) {
      chai.request(server)
        .post('/user/login')
        .send({
          username: "ayomide",
          password: "ayomide"
        })
        .end((err, res) => {
          hostToken = res.body.data.token
          res.should.have.status(OK)
          done()
        })
    })

    it('Should create a new game for user', function (done) {
      chai.request(server)
        .post('/game/new')
        .send({ answer: 'some random sentence' })
        .set({ Authorization: `Bearer ${hostToken}` })
        .end((err, res) => {
          gameId = res.body.data.game_id
          res.should.have.status(CREATED)
          done()
        })
    })

    it('Should return 401 for trying to create game without token', function (done) {
      chai.request(server)
        .post('/game/new')
        .send({ answer: 'some random sentence' })
        .end((err, res) => {
          res.should.have.status(UNAUTHORIZED)
          done()
        })
    })
  })

  describe('Fetch Game', function () {
    it('Should fetch and return the games a user has', function (done) {
      chai.request(server)
        .get('/user/me/games')
        .set({ Authorization: `Bearer ${hostToken}` })
        .end((err, res) => {
          res.should.have.status(OK)
          done()
        })
    })

    it('Should fetch a single game and return status 200', function (done) {
      chai.request(server)
        .get(`/game/${gameId}`)
        .set({ Authorization: `Bearer ${hostToken}` })
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })

    it('Should return 404 for a non-existent game', function (done) {
      chai.request(server)
        .get('/game/invalid_game_id')
        .set({ Authorization: `Bearer ${hostToken}` })
        .end((err, res) => {
          res.should.have.status(404)
          done()
        })
    })

    it('Should add a new user to the game', function (done) {
      chai.request(server)
        .put(`/game/invite/${gameId}`)
        .set({ Authorization: `Bearer ${opponentToken}` })
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })
  })

  // why only one test? this in order to keep it simple and lean and because in most cases, the conditions will always be fulfilled.
  // this single test serves as "proof" --because it'll always pass.
  describe('Websocket test', function () {
    after(function () {
      User.deleteMany().then(r => console.log(`Collection dropped`)).catch(err => console.log(`Error deleteing collection`))
      Game.deleteMany().then(r => console.log(`Collection dropped`)).catch(err => console.log(`Error deleteing collection`))
    })
    it('Should expect that the opponent wins when they guess correctly', function (done) {
      let opponentObject = jwt.verify(opponentToken, process.env.JWT_SECRET)
      let hostObject = jwt.verify(hostToken, process.env.JWT_SECRET)

      opponentName = opponentObject.username
      opponentId = opponentObject.id
      hostName = hostObject.username
      hostId = hostObject.id

      socket.emit("create-game-room", gameId);
      socket.emit('send-message', {
        sender: opponentObject.id,
        text: 'some random sentence',
        gameid: gameId,
        host: hostName,
        opponent: opponentName,
      })
      socket.on('game-finished', data => {
        expect(data.winner).to.equal(opponentName)
        done()
      })
    })
  })

})
