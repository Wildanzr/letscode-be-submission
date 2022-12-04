const { ProblemSubmission } = require('../models')
const { ClientError } = require('../errors')

class ProblemSubmissionService {
  constructor () {
    this.name = 'ProblemSubmissionService'
  }

  async createProblemSubmission (payload) {
    const problemSubmission = await ProblemSubmission.create(payload)
    if (!problemSubmission) throw new ClientError('Failed to create problem submission', 500)
    return problemSubmission
  }

  async updateProblemSubmission (id, payload) {
    const problemSubmission = await ProblemSubmission.findOneAndUpdate({ _id: id }, payload, { new: true })
    if (!problemSubmission) throw new ClientError('Failed to update problem submission', 500)
    return problemSubmission
  }

  async getProblemSubmissionByCpAndUserId (competeProblemId, userId) {
    const problemSubmission = await ProblemSubmission.findOne({ competeProblemId, userId })
    if (!problemSubmission) return false
    return problemSubmission
  }
}

module.exports = {
  ProblemSubmissionService
}
