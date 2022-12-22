<h1 align="center">Auto Assign</h1>
<p align="center">Automatically add reviewers/assignees to issues/PRs</p>

## Usage

Create `.github/workflows/auto-assign.yml` in the default branch:

```yaml
name: Auto Assign
on:
  issues:
    types: [opened, edited, labeled, unlabeled]
  pull_request:
    types: [opened, edited, labeled, unlabeled]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: wow-actions/auto-assign@v2
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # using the `org/team_slug` or `/team_slug` syntax to add git team as reviewers
          reviewers: |
            reviewer1
            reviewer2
            reviewer3
            org/teamReviewerA
            org/teamReviewerB
            /teamReviewerC
          assignees: assignee1, assignee2, assignee3
          skipKeywords: wip, draft
```

### Inputs

Various inputs are defined to let you configure the action:

> Note: [Workflow command and parameter names are not case-sensitive](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#about-workflow-commands).

| Name                | Description                                                                                               | Default |
|---------------------|-----------------------------------------------------------------------------------------------------------|---------|
| `GITHUB_TOKEN`      | The GitHub token for authentication                                                                       | N/A     |
| `addReviewers`      | Set to `true` to add reviewers to PRs.                                                                    | `true`  |
| `addAssignees`      | Set to `true` to add assignees to issues/PRs. Set to `'author'` to add issue/PR's author as a assignee.   | `true`  |
| `reviewers`         | A list of reviewers(GitHub user name) to be added to PR.                                                  | `[]`    |
| `assignees`         | A list of assignees(GitHub user name) to be added to issue/PR. Uses `reviewers` if not set.  file         | `[]`    |
| `numberOfReviewers` | Number of reviewers added to the PR. Set `0` to add all the reviewers.                                    | `0`     |
| `numberOfAssignees` | Number of assignees added to the PR. Set `0` to add all the assignees. Uses `numberReviewers` if not set. | `0`     |
| `skipDraft`         | Set to `false` to run on draft PRs.                                                                       | `true`  |
| `skipKeywords`      | A list of keywords to be skipped the process if issue/PR's title include it.                              | `[]`    |
| `includeLabels`     | Only to run when issue/PR has one of the label.                                                           | `[]`    |
| `excludeLabels`     | Not to run when issue/PR has one of the label.                                                            | `[]`    |


## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
