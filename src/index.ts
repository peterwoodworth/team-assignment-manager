import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  const token = core.getInput('github-token');
  const team = core.getInput('team');
  const exemptTeam = core.getInput('exempt-team', { required: false });
  const octokit = github.getOctokit(token);

  // set issue type to count
  const thisIssueData = await octokit.rest.issues.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
  });
  let target = '';
  if (thisIssueData.data.pull_request) {
    target = 'pull_requests';
  } else {
    target = 'issues';
  }

  // Check if issue was submitted by exempt team member
  if (exemptTeam) {
    const exemptMemberData = await octokit.rest.teams.listMembersInOrg({
      org: github.context.repo.owner,
      team_slug: exemptTeam,
    });
    for (const exemptMember of exemptMemberData.data) {
      if (github.context.actor === exemptMember.login) {
        core.info('Issue was submitted by exempt team member. Exiting successfully.');
        return;
      }
    }
  }

  // get list of members on team
  const memberData = await octokit.rest.teams.listMembersInOrg({
    org: github.context.repo.owner,
    team_slug: team,
  });
  const members = new Map<string, number>([]);
  for (const member of memberData.data) {
    members.set(member.login, 0);
  }

  // get number of issues/PRs assigned per team member
  members.forEach(async (value: number, key: string) => {
    const { data } = await octokit.rest.issues.listForRepo({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      assignee: key
    });
    let count: number = 0;
    for (const issue of data) {
      if (validateIssue(issue, target)) ++count;
    }
    members.set(key, count);
  });

  // determine team member with fewest assigned issues/PRs
  let winner = '';
  let low: number;
  members.forEach((value: number, key: string) => {
    if (winner === '') {
      low = value;
      winner = key;
    } else {
      if (value < low) {
        low = value;
        winner = key;
      }
    }
  });

  if (winner !== '') {
    core.info('Assignee: ' + winner);
    await octokit.rest.issues.addAssignees({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      assignees: [winner],
    });
  }
}

function validateIssue(issue, target: string): boolean {
  // check issue state, issue must be 'open'
  if (issue.state !== 'open') {
    return false;
  }

  // check issue type
  if (issue.pull_request && target.toLowerCase() === 'pull_requests') {
    return true;
  } else if (!issue.pull_request && target.toLowerCase() === 'issues') {
    return true;
  } else {
    return false;
  }
}

run().catch((error) => {
  core.setFailed(error.message);
});
