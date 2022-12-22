import * as core from '@actions/core'
import * as github from '@actions/github'
import sampleSize from 'lodash.samplesize'
import { Inputs } from './inputs'

export function skip(msg: string) {
  const { context } = github
  const type = context.payload.pull_request ? 'PR' : 'issue'
  core.info(`Skip to run since the ${type} ${msg}`)
}

export function isValidEvent(event: string, action?: string | string[]) {
  const { context } = github
  const { payload } = context
  if (event === context.eventName) {
    return (
      action == null ||
      (payload.action &&
        (action === payload.action || action.includes(payload.action)))
    )
  }
  return false
}

export function getOctokit() {
  const token = core.getInput('GITHUB_TOKEN', { required: true })
  return github.getOctokit(token)
}

type Octokit = ReturnType<typeof getOctokit>

export async function isValidUser(octokit: Octokit, username: string) {
  try {
    const res = await octokit.rest.users.getByUsername({ username })
    return res.status === 200 && res.data.id > 0
  } catch (error) {
    return false
  }
}

export async function getIssueLabels(octokit: Octokit, issueNumber: number) {
  const { context } = github
  const res = await octokit.rest.issues.listLabelsOnIssue({
    ...context.repo,
    issue_number: issueNumber,
    per_page: 100,
  })
  return res.data.map((item) => item.name)
}

export function hasSkipKeywords(title: string, keywords: string[]): boolean {
  const titleLowerCase = title.toLowerCase()
  // eslint-disable-next-line no-restricted-syntax
  for (const word of keywords) {
    if (titleLowerCase.includes(word.toLowerCase())) {
      return true
    }
  }

  return false
}

function chooseUsers(candidates: string[], count: number, filterUser: string) {
  const { teams, users } = candidates.reduce<{
    teams: string[]
    users: string[]
  }>(
    (memo, reviewer: string) => {
      const separator = '/'
      const isTeam = reviewer.includes(separator)
      if (isTeam) {
        const team = reviewer.split(separator)[1]
        memo.teams.push(team)
      } else if (reviewer.toLowerCase() !== filterUser.toLowerCase()) {
        memo.users.push(reviewer)
      }
      return memo
    },
    {
      teams: [],
      users: [],
    },
  )

  // all-assign
  if (count === 0) {
    return {
      teams,
      users,
    }
  }

  return {
    teams: sampleSize(teams, count),
    users: sampleSize(users, count),
  }
}

export function chooseReviewers(
  owner: string,
  inputs: Inputs,
): {
  reviewers: string[]
  teamReviewers: string[]
} {
  const { numberOfReviewers, reviewers } = inputs
  const chosen = chooseUsers(reviewers || [], numberOfReviewers || 0, owner)
  return {
    reviewers: chosen.users,
    teamReviewers: chosen.teams,
  }
}

export async function addReviewers(octokit: Octokit, inputs: Inputs) {
  const pr = github.context.payload.pull_request
  if (!inputs.addAssignees || !pr) {
    return
  }

  core.info('')
  core.info(`Adding reviewers for pr #[${pr.number}]`)
  const owner = pr.user.login
  const { reviewers: candidates, teamReviewers } = chooseReviewers(
    owner,
    inputs,
  )
  const reviewers: string[] = []
  for (let i = 0; i < candidates.length; i++) {
    const username = candidates[i]
    // eslint-disable-next-line no-await-in-loop
    const valid = await isValidUser(octokit, username)
    if (valid) {
      reviewers.push(username)
    } else {
      core.info(`  ignored unknown reviewer: "${username}"`)
    }
  }

  core.info(`  add reviewers: [${reviewers.join(', ')}]`)
  core.info(`  add team_reviewers: [${teamReviewers.join(', ')}]`)

  if (reviewers.length > 0 || teamReviewers.length > 0) {
    await octokit.rest.pulls.requestReviewers({
      ...github.context.repo,
      reviewers,
      team_reviewers: teamReviewers,
      pull_number: pr.number,
    })
  }
}

async function getTeamMembers(octokit: Octokit, team: string) {
  const { context } = github
  const parts = team.split('/')
  const org = parts[0] || context.repo.owner
  const slug = parts[1]!
  const res = await octokit.rest.teams.listMembersInOrg({
    org,
    team_slug: slug,
    per_page: 100,
  })
  return res.data.map((item) => item.login)
}

export async function chooseAssignees(
  octokit: Octokit,
  owner: string,
  inputs: Inputs,
) {
  const { assignees, reviewers, numberOfAssignees, numberOfReviewers } = inputs
  const count = numberOfAssignees || numberOfReviewers || 0
  const candidates = assignees || reviewers || []
  const users: string[] = []
  const teams: string[] = []

  candidates.forEach((item) => {
    if (item.includes('/')) {
      teams.push(item)
    } else {
      users.push(item)
    }
  })

  try {
    for (let i = 0; i < teams.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const members = await getTeamMembers(octokit, teams[i])
      users.push(...members)
    }
  } catch (error) {
    core.info('failed to get team members')
  }

  return chooseUsers(users, count, owner).users
}

export async function addAssignees(octokit: Octokit, inputs: Inputs) {
  if (!inputs.addAssignees) {
    return
  }

  const { context } = github
  const pr = context.payload.pull_request
  const issue = context.payload.issue
  const payload = (pr || issue)!

  core.info('')
  core.info(`Adding assignees for ${pr ? 'pr' : 'issue'} #[${payload.number}]`)

  const owner = payload.user.login
  const assignees: string[] = []
  const candidates = await chooseAssignees(octokit, owner, inputs)
  for (let i = 0; i < candidates.length; i++) {
    const username = candidates[i]
    // eslint-disable-next-line no-await-in-loop
    const valid = await isValidUser(octokit, username)
    if (valid) {
      assignees.push(username)
    } else {
      core.info(`  ignored unknown assignee: "${username}"`)
    }
  }

  core.info(`  add assignees: [${assignees.join(', ')}]`)

  if (assignees.length > 0) {
    await octokit.rest.issues.addAssignees({
      ...context.repo,
      assignees,
      issue_number: payload.number,
    })
  }
}
