// Conifg environment
require('dotenv').config()

// Service

// Consumer
const { Consumer } = require('./services/consumer')
const consumer = new Consumer()

// Start consumer
consumer.consumeMessage()
