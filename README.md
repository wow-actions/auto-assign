<h1 align="center">Auto Assign</h1>
<p align="center"><strong>Automatically add reviewers/assignees to issues/PRs when issues/PRs are opened</strong></p>

## Features

- When the issues/PRs is opened, automatically add reviewers/assignees to the issues/PRs.
- If the number of reviewers/assignees is specified, randomly add reviewers/assignees to the issues/PRs.
- If the title of the issues/PRs contains a specific keyword, do not add reviewers/assignees to the issues/PRs.

## Usage

Create `.github/workflows/auto-assign.yml` in the default branch:

```yaml
name: Auto Assign
on:
  issues:
    types: [opened]
  pull_request:
    types: [opened]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: wow-actions/auto-assign@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CONFIG_FILE: config-file-path
```

### Inputs

Various inputs are defined to let you configure the action:

> Note: [Workflow command and parameter names are not case-sensitive](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#about-workflow-commands).

- `GITHUB_TOKEN`: Your GitHub token for authentication.
- `CONFIG_FILE`: Path to configuration file. Custom config will [deep merged](https://lodash.com/docs/4.17.15#merge) with the following default config:

```js
{
  addReviewers: true,
  addAssignees: true,
  reviewers: undefined,
  assignees: undefined,
  numberOfAssignees: 0,
  numberOfReviewers: 0,
  skipKeywords: undefined,
  reviewGroups: undefined,
  assigneeGroups: undefined,
}
```

## Config

```yaml
# Set to true to add reviewers to issues/PRs
addReviewers: true

# Set to true to add assignees to issues/PRs
addAssignees: true

# Set to 'author' to add issue's/PR's author as a assignee
# addAssignees: author

# A list of reviewers to be added to issues/PRs (GitHub user name)
reviewers:
  - reviewerA
  - reviewerB
  - reviewerC

# A number of reviewers added to the issues/PRs
# Set 0 to add all the reviewers (default: 0)
numberOfReviewers: 0
# A list of assignees, overrides reviewers if set
# assignees:
#   - assigneeA

# A number of assignees to add to the issues/PRs
# Set to 0 to add all of the assignees.
# Uses numberOfReviewers if unset.
# numberOfAssignees: 2

# A list of keywords to be skipped the process if issue/PR's title include it
# skipKeywords:
#   - wip
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
