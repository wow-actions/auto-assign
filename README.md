<h1 align="center">Auto Assign</h1>
<p align="center">Automatically add reviewers/assignees to issues/PRs</p>

- [Randomly](https://lodash.com/docs/#sampleSize) pick assignees and reviewers from candidate list.
- Automatically ignore invalid Github username.
- Automatically skip assigned issues/PRs and reviewer requested PRs.
- **Try-to** pick the member of team as assignee when adding [team](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams) to assignees.

**Note that** the default `${{ secrets.GITHUB_TOKEN }}` does not have the permission to **add teams as reviewers** or to **list members of a team**. As a workaround:

  - First, [create a personal access token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with `repo` and `admin:org` permissions.
  - Then, make the PAT available to our actions by [adding the token as a secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets).
  - Finally, replace the `GITHUB_TOKEN` with the new secret, e.g. `GITHUB_TOKEN: ${{ secrets.NAME_OF_MY_SECRET_CONTAINING_PAT_WITH_REPO_ACCESS }}` instead of `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.

Or with a cool but slightly cumbersome solution: create a private [github app](https://probot.github.io/) for your org with custom permissions and avatar, then [use the app token in out workflow](https://github.com/wow-actions/use-app-token), e.g. [wow-actions-bot](https://github.com/apps/wow-actions-bot).

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
      - uses: wow-actions/auto-assign@v3
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

| Name                | Description                                                                                                     | Default |
|---------------------|-----------------------------------------------------------------------------------------------------------------|---------|
| `GITHUB_TOKEN`      | The GitHub token for authentication                                                                             | N/A     |
| `addReviewers`      | Set to `true` to add reviewers to PRs.                                                                          | `true`  |
| `addAssignees`      | Set to `true` to add assignees to issues/PRs.                                                                   | `true`  |
| `reviewers`         | Candidate list of reviewers(GitHub username) to be added to PR.                                                 | `[]`    |
| `assignees`         | Candidate list of assignees(GitHub user name) to be added to issue/PR. Uses `reviewers` if not set.             | `[]`    |
| `numberOfReviewers` | Number of reviewers added to the PR. Set `0` to add all the reviewers.                                          | `0`     |
| `numberOfAssignees` | Number of assignees added to the issue/PR. Set `0` to add all the assignees. Uses `numberReviewers` if not set. | `0`     |
| `skipDraft`         | Set to `false` to run on draft PRs.                                                                             | `true`  |
| `skipKeywords`      | A list of keywords to be skipped the process if issue/PR's title include it.                                    | `[]`    |
| `includeLabels`     | Only to run when issue/PR has one of the label.                                                                 | `[]`    |
| `excludeLabels`     | Not to run when issue/PR has one of the label.                                                                  | `[]`    |

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
