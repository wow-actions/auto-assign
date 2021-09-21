import * as github from '@actions/github'
import yaml from 'js-yaml'
import merge from 'lodash.merge'
import { Util } from './util'

export namespace Config {
  export interface Definition {
    addReviewers?: boolean | string
    addAssignees?: boolean
    reviewers?: string[]
    assignees?: string[]
    numberOfAssignees: number
    numberOfReviewers: number
    skipKeywords?: string[]
    reviewGroups?: { [key: string]: string[] }
    assigneeGroups?: { [key: string]: string[] }
  }

  export const defaults: Definition = {
    addReviewers: true,
    addAssignees: true,
    numberOfAssignees: 0,
    numberOfReviewers: 0,
  }

  export async function get(
    octokit: ReturnType<typeof github.getOctokit>,
    path?: string,
  ): Promise<Definition> {
    try {
      if (path) {
        const content = await Util.getFileContent(octokit, path)
        if (content) {
          const config = yaml.load(content) as Definition
          return merge({}, defaults, config)
        }
      }

      return defaults
    } catch (error) {
      if (error.status === 404) {
        return defaults
      }

      throw error
    }
  }
}
