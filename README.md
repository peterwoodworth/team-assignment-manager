# team-assignment-manager
Automatically assigns a member from a Github team to issues / PRs

Whoever from the given Github team has the fewest number of currently assigned issues / PRs from the team will be assigned to the issue when this action is ran

# Inputs

## team
  The team to assign to issues / PRs

  *Required*

## exempt-team
  If the issue / PR was submitted by someone from this team, do not assign anyone to the issue

  *default: does not check submitter*

## github-token
  The token must have read:org permission, so the default github token for the repo will not work.

  *Required*

# Example

```yaml
name: "Assigns members from team repo-dev to PRs"
on:
 pull_request_target:
    types: [opened]

jobs:
  team-assignment-manager:
    runs-on: ubuntu-latest
    steps:
      - uses: peterwoodworth/team-assignment-manager@main
        with:
          github-token: "${{ secrets.MY_PAT }}"
          team: "repo-dev"
          exempt-team: "repo-team"
```
