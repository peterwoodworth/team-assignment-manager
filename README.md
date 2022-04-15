# team-assignment-manager
Assigns a member from a Github team to issues
Whoever has the fewest number of currently assigned issues/PRs from the team will be assigned to the issue when this action is ran

## Inputs

### team
The team to assign to issues / PRs

**Required**

### core-team
If the issue / PR was submitted by someone from this team, do not assign anyone to the issue

**default: does not check submitter**

### target
Select whether to count assignees from `issues`, `pull_requests`, or `both`

**default: both**

### github-token
The token must have read:org permission, so the default github token for the repo will not work.

**Required**
