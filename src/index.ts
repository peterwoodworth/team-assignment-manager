import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  const token = core.getInput('github-token');
  const team = core.getInput('team');
  const target = core.getInput('target');
  const octokit = github.getOctokit(token);

//   // get list of members on team
//   const memberData = await octokit.rest.teams.listMembersInOrg({
//     org: github.context.repo.owner,
//     team_slug: team,
//   });
  const members = new Map<string, Number>([]);
//   for (const member of memberData.data) {
//     members.set(member.login, 0);
//   }
  members.set('peterwoodworth', 0)

  // get number of issues/PRs assigned per team member
  const issueData = await octokit.rest.issues.list();
  for (const issue of issueData.data) {
    if (!validateIssue(issue, target)) {
      continue;
    }
    if (issue.assignees) {
      for (const assignee of issue.assignees) {
        if (members[assignee.login]) {
          members[assignee.login]++;
        }
      }
    }
  }

  // determine team member with fewest assigned issues/PRs
  let winner = '';
  let low: Number;
  members.forEach((value: Number, key: string) => {
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
  core.info(winner);

  if (winner !== '') {
    core.setOutput('Assignee', winner);
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
  if (target.toLowerCase() === 'both') {
    return true;
  } else if (issue.pull_request && target.toLowerCase() === 'pull_requests') {
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
