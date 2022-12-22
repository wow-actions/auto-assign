import * as core from '@actions/core'
import * as github from '@actions/github'
import * as util from './util'
import { getInputs } from './inputs'

async function run() {
  try {
    const { context } = github
    const payload = context.payload.pull_request || context.payload.issue

    core.debug(`event: ${context.eventName}`)
    core.debug(`action: ${context.payload.action}`)

    const actions = ['opened', 'edited', 'labeled', 'unlabeled']
    if (
      payload &&
      (util.isValidEvent('issues', actions) ||
        util.isValidEvent('pull_request', actions) ||
        util.isValidEvent('pull_request_target', actions))
    ) {
      const inputs = getInputs()
      core.debug(`inputs: \n${JSON.stringify(inputs, null, 2)}`)

      if (context.payload.pull_request) {
        if (payload.draft && inputs.skipDraft !== false) {
          return util.skip('is draft')
        }
      }

      if (
        inputs.skipKeywords &&
        inputs.skipKeywords.length &&
        util.hasSkipKeywords(payload.title, inputs.skipKeywords)
      ) {
        return util.skip('title includes skip-keywords')
      }

      const octokit = util.getOctokit()

      const checkIncludeLabels =
        inputs.includeLabels != null && inputs.includeLabels.length > 0
      const checkExcludeLabels =
        inputs.excludeLabels != null && inputs.excludeLabels.length > 0

      if (checkIncludeLabels || checkExcludeLabels) {
        const labelsRes = await octokit.rest.issues.listLabelsOnIssue({
          ...context.repo,
          issue_number: payload.number,
          per_page: 100,
        })
        const labels = labelsRes.data.map((item) => item.name)
        const hasAnyLabel = (inputs: string[]) =>
          labels.some((label) => inputs.includes(label))

        if (checkIncludeLabels) {
          const hasLabels = hasAnyLabel(inputs.includeLabels!)
          if (!hasLabels) {
            return util.skip(`is not labeled with any of the "includeLabels"`)
          }
        }

        if (checkExcludeLabels) {
          const hasLabels = hasAnyLabel(inputs.excludeLabels!)
          if (hasLabels) {
            return util.skip(`is labeled with one of the "excludeLabels"`)
          }
        }
      }

      const owner = payload.user.login

      if (inputs.addReviewers && context.payload.pull_request) {
        const { reviewers: candidates, teamReviewers } = util.chooseReviewers(
          owner,
          inputs,
        )
        const reviewers: string[] = []
        for (let i = 0; i < candidates.length; i++) {
          const username = candidates[i]
          // eslint-disable-next-line no-await-in-loop
          const valid = await util.isValidUser(octokit, username)
          if (valid) {
            reviewers.push(username)
          } else {
            core.info(`Ignored unknown reviewer "${username}"`)
          }
        }

        core.info(`Reviewers: ${JSON.stringify(reviewers, null, 2)}`)
        core.info(`Team Reviewers: ${JSON.stringify(teamReviewers, null, 2)}`)
        if (reviewers.length > 0 || teamReviewers.length > 0) {
          await octokit.rest.pulls.requestReviewers({
            ...context.repo,
            reviewers,
            team_reviewers: teamReviewers,
            pull_number: payload.number,
          })
        }
      }

      if (inputs.addAssignees) {
        const assignees: string[] = []
        const candidates = util.chooseAssignees(owner, inputs)
        for (let i = 0; i < candidates.length; i++) {
          const username = candidates[i]
          // eslint-disable-next-line no-await-in-loop
          const valid = await util.isValidUser(octokit, username)
          if (valid) {
            assignees.push(username)
          } else {
            core.info(`Ignored unknown assignee "${username}"`)
          }
        }

        core.info(`Assignees: ${JSON.stringify(assignees, null, 2)}`)
        if (assignees.length > 0) {
          await octokit.rest.issues.addAssignees({
            ...context.repo,
            assignees,
            issue_number: payload.number,
          })
        }
      }
    }
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}

run()
