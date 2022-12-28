const amqp = require('amqplib')
const { ClientError } = require('../errors')

class Consumer {
  constructor (submissionService, problemSubmissionService, worker) {
    this.name = 'Consumer'
    this._connection = null
    this._channel = null
    this._submissionService = submissionService
    this._problemSubmissionService = problemSubmissionService
    this._worker = worker

    // Bind methods
    this.consumeMessage = this.consumeMessage.bind(this)
  }

  async consumeMessage () {
    console.log('Consumer listening for messages...')

    try {
      // Create a connection to the RabbitMQ server
      const HOST = process.env.RABBITMQ_HOST || 'localhost'
      const PORT = process.env.RABBITMQ_PORT || 5672
      const USER = process.env.RABBITMQ_USERNAME || 'guest'
      const PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest'

      this._connection = await amqp.connect(`amqp://${USER}:${PASSWORD}@${HOST}:${PORT}`)
      this._channel = await this._connection.createChannel()

      // Register a consumer for the queue, or create the queue if it doesn't exist
      await this._channel.assertQueue('submission', { durable: true })

      // Consume message from the submission queue
      this._channel.consume('submission', async (data) => {
        // Parse the message then destructuring the data
        const payload = await JSON.parse(data.content.toString())
        const { userId, competeProblemId, languageCode, code, tokens } = payload
        console.log(`Incoming submission queue from ${userId} for problem ${competeProblemId}`)

        // Create a new submission
        const submission = await this._submissionService.createSubmission({ code, languageCode, tokens })

        // Put submission to user logs
        this._submissionService.putSubmissionToUserLogs(userId, submission._id)

        // Check problemSubmission is exist or not
        let problemSubmission = await this._problemSubmissionService.getProblemSubmissionByCpAndUserId(competeProblemId, userId)
        if (!problemSubmission) {
          // Create a new problemSubmission
          problemSubmission = await this._problemSubmissionService.createProblemSubmission({ competeProblemId, userId })
        }

        // Push submissionId to problemSubmission.listOfSubmission
        problemSubmission.listOfSubmission.push(submission._id)
        await problemSubmission.save()

        // Send tokens to worker
        this._worker.judgeSubmissions(tokens, submission._id, competeProblemId, userId)

        this._channel.ack(data)
      })
    } catch (error) {
      console.log(error)
      const messages = error.messages || 'Internal server error'
      const statusCode = error.statusCode || 500
      return new ClientError(messages, statusCode)
    }
  }
}

module.exports = {
  Consumer
}
