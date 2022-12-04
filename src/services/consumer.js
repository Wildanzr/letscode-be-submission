const amqp = require('amqplib')
const { ClientError } = require('../errors')

class Consumer {
  constructor () {
    this.name = 'Consumer'
    this._connection = null
    this._channel = null

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
        console.log('receive new message')

        // Parse the message then destructuring the data
        const payload = await JSON.parse(data.content.toString())
        console.log(payload)
        this._channel.ack(data)
      })
    } catch (error) {
      console.log(error)
      const messages = error.messages || 'Internal server error'
      const statusCode = error.statusCode || 500
      throw new ClientError(messages, statusCode)
    }
  }
}

module.exports = {
  Consumer
}
