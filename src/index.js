// Conifg environment
require('dotenv').config()

// Wait for RabbitMQ to start before starting the consumer, set timeout for 30 seconds
setTimeout(() => {
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
}, 30000)

console.log('Waiting for RabbitMQ to start...')
