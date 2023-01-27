const { ProblemSubmission, User } = require('../models')
const { ClientError } = require('../errors')

class ProblemSubmissionService {
  constructor () {
    this.name = 'ProblemSubmissionService'
  }

  async createProblemSubmission (payload) {
    const problemSubmission = await ProblemSubmission.create(payload)
    if (!problemSubmission) throw new ClientError('Gagal membuat permasalahan', 500)
    return problemSubmission
  }

  async updateProblemSubmission (id, payload) {
    const problemSubmission = await ProblemSubmission.findOneAndUpdate({ _id: id }, payload, { new: true })
    if (!problemSubmission) throw new ClientError('Gagal memperbarui permasalaahan', 500)
    return problemSubmission
  }

  async getProblemSubmissionByCpAndUserId (competeProblemId, userId) {
    const problemSubmission = await ProblemSubmission.findOne({ competeProblemId, userId })
    if (!problemSubmission) return false
    return problemSubmission
  }

  async updateSubmissionPoint (userId, competeProblemId, point) {
    const problemSubmission = await this.getProblemSubmissionByCpAndUserId(competeProblemId, userId)
    const user = await User.findById(userId)

    // Check if point is greater than currentpoints, update it
    if (point > problemSubmission.currentPoints) {
      // Check difference between currentPoints and point, then add it to user.totalPoints
      const diff = point - problemSubmission.currentPoints
      user.point += diff
      await user.save()

      problemSubmission.currentPoints = point
      await problemSubmission.save()
    }

    return problemSubmission
  }
}

module.exports = {
  ProblemSubmissionService
}
