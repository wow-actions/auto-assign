import * as core from '@actions/core'
import * as github from '@actions/github'
import sampleSize from 'lodash.samplesize'
import { Inputs } from './inputs'

export function getOctokit() {
  const token = core.getInput('GITHUB_TOKEN', { required: true })
  return github.getOctokit(token)
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

export async function isValidUser(
  octokit: ReturnType<typeof getOctokit>,
  username: string,
) {
  try {
    const res = await octokit.rest.users.getByUsername({ username })
    return res.status === 200 && res.data.id > 0
  } catch (error) {
    return false
  }
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

export function chooseAssignees(owner: string, inputs: Inputs): string[] {
  const {
    addAssignees,
    assignees,
    reviewers,
    numberOfAssignees,
    numberOfReviewers,
  } = inputs
  if (typeof addAssignees === 'string') {
    if (addAssignees !== 'author') {
      throw new Error(
        "Error in configuration file to do with using `addAssignees`. Expected `addAssignees` variable to be either boolean or 'author'",
      )
    }
    return [owner]
  }

  const count = numberOfAssignees || numberOfReviewers || 0
  const candidates = assignees || reviewers || []
  return chooseUsers(candidates, count, owner).users
}

export function skip(msg: string) {
  const { context } = github
  const type = context.payload.pull_request ? 'PR' : 'issue'
  core.info(`Skip to run since the ${type} ${msg}`)
}
