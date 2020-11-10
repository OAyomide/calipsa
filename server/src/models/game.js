const { model, Schema, Types } = require('mongoose')

const gameSchema = new Schema({
  game_id: {
    type: String,
    unique: true,
    required: true
  },
  host: {
    type: Types.ObjectId,
    ref: 'User'
  },
  winner: {
    type: Schema.Types.ObjectId
  },
  opponent: {
    type: String,
  },
  history: [{ type: Object }],
  count: { type: Number, default: 0 },
  answer: { type: String, required: true },
  // name: { type: String, required: true }
}, { timestamps: true })

module.exports = model('Game', gameSchema)