// Conifg environment
require('dotenv').config()

// Database
const mongoose = require('mongoose')

// Service
const { SubmissionService, ProblemSubmissionService, Consumer, Worker } = require('./services')
const submissionService = new SubmissionService()
const problemSubmissionService = new ProblemSubmissionService()
const worker = new Worker(submissionService, problemSubmissionService)
const consumer = new Consumer(submissionService, problemSubmissionService, worker)

// Connect to mongodb
mongoose.connect(process.env.DATABASE_URL, {
  useNewURLParser: true,
  useUnifiedTopology: true
}).then(console.log('connected to db')).catch((err) => console.log(err))

// Start consumer
consumer.consumeMessage()

// // test checkJudgeDone
// const check = async () => {
//   const res = await worker.checkJudgeDone('2d8d1bf4-14cb-437e-9838-c3b835a99c41')
//   console.log(res)
// }

// check()
