import * as core from '@actions/core'
import * as github from '@actions/github'
import { Util } from './util'
import { Config } from './config'

export namespace Action {
  export async function run() {
    try {
      const context = github.context
      const payload = context.payload.pull_request || context.payload.issue
      if (
        payload &&
        (Util.isValidEvent('pull_request', 'opened') ||
          Util.isValidEvent('issues', 'opened'))
      ) {
        if (context.payload.pull_request) {
          if (payload.draft) {
            core.debug('Ignore draft PR')
            return
          }
        }

        const configPath = core.getInput('CONFIG_FILE')
        const octokit = Util.getOctokit()
        const config = await Config.get(octokit, configPath)

        if (configPath) {
          core.debug(
            `Load config from "${configPath}": \n${JSON.stringify(
              config,
              null,
              2,
            )}`,
          )
        }

        const title = payload.title
        const owner = payload.user.login

        if (
          config.skipKeywords &&
          Util.hasSkipKeywords(title, config.skipKeywords)
        ) {
          core.debug('Skips adding reviewers')
          return
        }

        if (config.addReviewers && context.payload.pull_request) {
          const { reviewers, team_reviewers } = Util.chooseReviewers(
            owner,
            config,
          )

          core.debug(`Reviewers: ${JSON.stringify(reviewers, null, 2)}`)
          core.debug(
            `Team Reviewers: ${JSON.stringify(team_reviewers, null, 2)}`,
          )

          if (reviewers.length > 0 || team_reviewers.length > 0) {
            await octokit.pulls.requestReviewers({
              ...context.repo,
              reviewers,
              team_reviewers,
              pull_number: payload.number,
            })
          }
        }

        if (config.addAssignees) {
          const assignees = Util.chooseAssignees(owner, config)
          core.debug(`Assignees: ${JSON.stringify(assignees, null, 2)}`)
          if (assignees.length > 0) {
            await octokit.issues.addAssignees({
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
}
