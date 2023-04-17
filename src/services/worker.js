const axios = require('axios')
const { logger } = require('../utils/logger')

class Worker {
  constructor (submissionService, problemSubmissionService) {
    this.name = 'Worker'
    this._submissionService = submissionService
    this._problemSubmissionService = problemSubmissionService
    this.URL = process.env.JUDGE_API_URL

    // Bind methods
    this.judgeSubmission = this.judgeSubmission.bind(this)
    this.checkJudgeDone = this.checkJudgeDone.bind(this)
  }

  async judgeSubmission (token) {
    // Create get request options
    const options = {
      method: 'GET',
      url: `${this.URL}/${token}`,
      params: {
        base64_encoded: 'true',
        fields:
          'compile_output,expected_output,language,memory,status,stderr,stdin,stdout,time'
      }
    }
    try {
      const response = await axios.request(options)
      const statusId = response.data.status.id

      if (statusId === 1 || statusId === 2) {
        return {
          statusId,
          data: null
        }
      } else {
        return {
          statusId,
          data: response.data
        }
      }
    } catch (err) {
      logger.error(err)
      return {
        statusId: 13,
        data: null
      }
    }
  }

  async checkJudgeDone (token) {
    // Create temporary result
    let tempRes = {
      statusId: 1,
      data: null
    }

    while (tempRes.statusId === 1 || tempRes.statusId === 2) {
      // wait for 800ms
      await new Promise((resolve) => setTimeout(resolve, 800))
      const res = await this.judgeSubmission(token)
      tempRes = res
    }

    return tempRes
  }

  async gradeSubmission (submission) {
    // Check if submission.data.status is 3 (Accepted)
    if (submission.data.status.id === 3) return 1

    return 0
  }

  async judgeSubmissions (tokens, submissionId, competeProblemId, userId) {
    const result = []
    const totalTestcase = tokens.length

    // wait 5 seconds for all submissions to be judged
    await new Promise((resolve) => setTimeout(resolve, 5000))

    for (const token of tokens) {
      const res = await this.checkJudgeDone(token)
      result.push(res)
    }

    // Grade the submission
    const grades = []
    let point = 0

    for (const submission of result) {
      const grade = await this.gradeSubmission(submission)
      grades.push(grade)
      point += grade
    }

    // Count final grade
    point = Math.round(point / (totalTestcase * 1.0) * 100)

    // Update submission
    const payload = {
      point,
      status: 1
    }
    await this._submissionService.updateSubmission(submissionId, payload)
    await this._problemSubmissionService.updateSubmissionPoint(userId, competeProblemId, point)
    logger.info('Finished judging submission')
  }
}

module.exports = {
  Worker
}
