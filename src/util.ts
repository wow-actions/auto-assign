import * as core from '@actions/core'
import * as github from '@actions/github'
import sampleSize from 'lodash.samplesize'
import { Config } from './config'

export namespace Util {
  export function getOctokit() {
    const token = core.getInput('GITHUB_TOKEN', { required: true })
    return github.getOctokit(token)
  }

  export function isValidEvent(event: string, action?: string) {
    const { context } = github
    const { payload } = context
    if (event === context.eventName) {
      return action == null || action === payload.action
    }
    return false
  }

  export async function getFileContent(
    octokit: ReturnType<typeof getOctokit>,
    path: string,
  ) {
    try {
      const response = await octokit.rest.repos.getContent({
        ...github.context.repo,
        path,
      })

      const { content } = response.data as any
      return Buffer.from(content, 'base64').toString()
    } catch (err) {
      return null
    }
  }

  export function hasSkipKeywords(
    title: string,
    skipKeywords: string[],
  ): boolean {
    // eslint-disable-next-line no-restricted-syntax
    for (const skipKeyword of skipKeywords) {
      if (title.toLowerCase().includes(skipKeyword.toLowerCase())) {
        return true
      }
    }

    return false
  }

  interface ChooseUsersResponse {
    teams: string[]
    users: string[]
  }

  function chooseUsers(
    candidates: string[],
    count: number,
    filterUser = '',
  ): ChooseUsersResponse {
    const { teams, users } = candidates.reduce(
      (acc: ChooseUsersResponse, reviewer: string): ChooseUsersResponse => {
        const separator = '/'
        const isTeam = reviewer.includes(separator)
        if (isTeam) {
          const team = reviewer.split(separator)[1]
          acc.teams = [...acc.teams, team]
        } else if (reviewer !== filterUser) {
          acc.users = [...acc.users, reviewer]
        }
        return acc
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
      teams,
      users: sampleSize(users, count),
    }
  }

  function chooseUsersFromGroups(
    owner: string,
    groups: { [key: string]: string[] } | undefined,
    desiredNumber: number,
  ): string[] {
    const users: string[] = []
    // eslint-disable-next-line
    for (const group in groups) {
      users.push(...chooseUsers(groups[group], desiredNumber, owner).users)
    }
    return users
  }

  export function chooseReviewers(
    owner: string,
    config: Config.Definition,
  ): {
    reviewers: string[]
    // eslint-disable-next-line camelcase
    team_reviewers: string[]
  } {
    const { reviewGroups, numberOfReviewers, reviewers } = config
    if (reviewGroups && Object.keys(reviewGroups).length > 0) {
      const chosenReviewers = chooseUsersFromGroups(
        owner,
        reviewGroups,
        numberOfReviewers,
      )

      return {
        reviewers: chosenReviewers,
        team_reviewers: [],
      }
    }

    const chosenReviewers = chooseUsers(
      reviewers || [],
      numberOfReviewers,
      owner,
    )
    return {
      reviewers: chosenReviewers.users,
      team_reviewers: chosenReviewers.teams,
    }
  }

  export function chooseAssignees(
    owner: string,
    config: Config.Definition,
  ): string[] {
    const {
      addAssignees,
      assigneeGroups,
      assignees,
      reviewers,
      numberOfAssignees,
      numberOfReviewers,
    } = config
    if (typeof addAssignees === 'string') {
      if (addAssignees !== 'author') {
        throw new Error(
          "Error in configuration file to do with using `addAssignees`. Expected `addAssignees` variable to be either boolean or 'author'",
        )
      }
      return [owner]
    }

    if (assigneeGroups && Object.keys(assigneeGroups).length > 0) {
      return chooseUsersFromGroups(
        owner,
        assigneeGroups,
        numberOfAssignees || numberOfReviewers,
      )
    }

    const candidates = assignees || reviewers
    return chooseUsers(
      candidates || [],
      numberOfAssignees || numberOfReviewers,
      owner,
    ).users
  }
}
