const { model, Schema } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const competeLeaderboardSchema = new Schema({
  _id: {
    type: String,
    default: () => { return `clb-${nanoid(15)}` }
  },
  userId: { type: Schema.Types.String, ref: 'users' }
})

// Create model
const CompeteLeaderboard = model('competeLeaderboards', competeLeaderboardSchema)

module.exports = {
  CompeteLeaderboard,
  competeLeaderboardSchema
}
