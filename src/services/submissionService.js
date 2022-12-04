const { Submission } = require('../models')
const { ClientError } = require('../errors')
class SubmissionService {
  constructor () {
    this.name = 'SubmissionService'
  }

  async createSubmission (payload) {
    const submission = await Submission.create(payload)
    if (!submission) throw new ClientError('Failed to create submission', 500)
    return submission
  }

  async updateSubmission (id, payload) {
    const submission = await Submission.findOneAndUpdate({ _id: id }, payload, { new: true })
    if (!submission) throw new ClientError('Failed to update submission', 500)
    return submission
  }
}

module.exports = {
  SubmissionService
}
