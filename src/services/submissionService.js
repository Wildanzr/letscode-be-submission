const { Submission, User, Log } = require('../models')
const { ClientError } = require('../errors')
class SubmissionService {
  constructor () {
    this.name = 'SubmissionService'
  }

  async createSubmission (payload) {
    const submission = await Submission.create(payload)
    if (!submission) throw new ClientError('Gagal membuat pengumpulan', 500)
    return submission
  }

  async updateSubmission (id, payload) {
    const submission = await Submission.findOneAndUpdate({ _id: id }, payload, { new: true })
    if (!submission) throw new ClientError('Gagal memperbarui pengumpulan', 500)
    return submission
  }

  async putSubmissionToUserLogs (userId, submissionId) {
    // Create log
    const log = await Log.create({ userId, submissionId })

    // Push log to user.logs
    const user = await User.findById(userId)
    user.logActivities.push(log._id)
    await user.save()
  }
}

module.exports = {
  SubmissionService
}
