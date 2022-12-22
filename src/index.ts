import * as core from '@actions/core'
import * as github from '@actions/github'
import * as util from './util'
import { getInputs } from './inputs'

async function run() {
  try {
    const { context } = github

    core.debug(`event: ${context.eventName}`)
    core.debug(`action: ${context.payload.action}`)

    const pr = context.payload.pull_request
    const issue = context.payload.issue
    const payload = pr || issue
    const actions = ['opened', 'edited', 'labeled', 'unlabeled']
    if (
      payload &&
      (util.isValidEvent('issues', actions) ||
        util.isValidEvent('pull_request', actions) ||
        util.isValidEvent('pull_request_target', actions))
    ) {
      const inputs = getInputs()
      core.debug(`inputs: \n${JSON.stringify(inputs, null, 2)}`)

      if (pr && pr.draft && inputs.skipDraft !== false) {
        return util.skip('is draft')
      }

      if (
        inputs.skipKeywords &&
        util.hasSkipKeywords(payload.title, inputs.skipKeywords)
      ) {
        return util.skip('title includes skip-keywords')
      }

      const octokit = util.getOctokit()
      const checkIncludings =
        inputs.includeLabels != null && inputs.includeLabels.length > 0
      const checkExcludings =
        inputs.excludeLabels != null && inputs.excludeLabels.length > 0
      if (checkIncludings || checkExcludings) {
        const labels = await util.getIssueLabels(octokit, payload.number)
        const hasAny = (arr: string[]) => labels.some((l) => arr.includes(l))

        if (checkIncludings) {
          const any = hasAny(inputs.includeLabels!)
          if (!any) {
            return util.skip(`is not labeled with any of the "includeLabels"`)
          }
        }

        if (checkExcludings) {
          const any = hasAny(inputs.excludeLabels!)
          if (any) {
            return util.skip(`is labeled with one of the "excludeLabels"`)
          }
        }
      }

      await util.addReviewers(octokit, inputs)
      await util.addAssignees(octokit, inputs)
    }
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}

run()
