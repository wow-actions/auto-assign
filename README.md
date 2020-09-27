# Auto Assign

Github Action to add reviewers/assignees to pull requests when pull requests are opened.

## Features

- When the pull request is opened, automatically add reviewers/assignees to the pull request.
- If the number of reviewers/assignees is specified, randomly add reviewers/assignees to the pull request.
- If the title of the pull request contains a specific keyword, do not add reviewers/assignees to the pull request.

## Usage

Create `.github/workflows/auto-assign.yml` in the default branch:

```yaml
name: Label Actions
on:
  pull_request:
    types: [opened]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: bubkoo/auto-assign@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CONFIG_FILE: config-file-path
```

### Options

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
# Set to true to add reviewers to PRs
addReviewers: true

# Set to true to add assignees to PRs
addAssignees: true

# Set to 'author' to add PR's author as a assignee
# addAssignees: author

# A list of reviewers to be added to PRs (GitHub user name)
reviewers:
  - reviewerA
  - reviewerB
  - reviewerC

# A number of reviewers added to the PR
# Set 0 to add all the reviewers (default: 0)
numberOfReviewers: 0
# A list of assignees, overrides reviewers if set
# assignees:
#   - assigneeA

# A number of assignees to add to the PRs
# Set to 0 to add all of the assignees.
# Uses numberOfReviewers if unset.
# numberOfAssignees: 2

# A list of keywords to be skipped the process if PR's title include it
# skipKeywords:
#   - wip
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
