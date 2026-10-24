import * as core from '@actions/core';
import * as github from '@actions/github';
import { auditPage } from '../core/audit';
import { formatAxeResultsAsGitHubPRMarkdown } from '../core/reporter';
import { suggestA11yFix, applyA11yFix } from '../agent/ai-fixer';

interface PullRequestContext {
  owner: string;
  repo: string;
  pull_number: number;
}

async function getPullRequestContext(): Promise<PullRequestContext | null> {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    core.error('This action can only be run on pull_request events.');
    return null;
  }

  return {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: pullRequest.number,
  };
}

async function postComment(context: PullRequestContext, commentBody: string) {
  const token = core.getInput('github-token', { required: true });
  const octokit = github.getOctokit(token);

  await octokit.rest.issues.createComment({
    owner: context.owner,
    repo: context.repo,
    issue_number: context.pull_number,
    body: commentBody,
  });
}

async function runAudit(context: PullRequestContext, targetUrl: string) {
  core.info(`Running accessibility audit on ${targetUrl}`);
  const auditResults = await auditPage(targetUrl);
  const markdownReport = formatAxeResultsAsGitHubPRMarkdown(auditResults);

  await postComment(context, markdownReport);
}

async function handleFixCommand(context: PullRequestContext, commentBody: string) {
  const fixCommandRegex = /^\/fix-a11y\s+(\S+)\s+(\d+)\s+(.*)/;
  const match = commentBody.match(fixCommandRegex);

  if (match) {
    const [, filePath, lineNumberStr, issueDescription] = match;
    const lineNumber = parseInt(lineNumberStr, 10);

    core.info(`Attempting to fix issue in ${filePath} at line ${lineNumber}: ${issueDescription}`);

    // In a real scenario, you'd read the file content to get the snippet
    const dummyCodeSnippet = '<img src=\"old.png\" alt=\"\"><br/>'; // Placeholder

    const suggestion = await suggestA11yFix(dummyCodeSnippet, issueDescription);
    const applied = await applyA11yFix(filePath, lineNumber, dummyCodeSnippet, suggestion);

    if (applied) {
      await postComment(context, `✅ Applied fix to ${filePath} line ${lineNumber}. Suggested change: \n\`\`\`html\n${suggestion}\n\`\`\``);
    } else {
      await postComment(context, `❌ Failed to apply fix to ${filePath} line ${lineNumber}. Suggested change: \n\`\`\`html\n${suggestion}\n\`\`\``);
    }

  } else {
    await postComment(context, 'Invalid /fix-a11y command. Usage: `/fix-a11y <filePath> <lineNumber> <issueDescription>`');
  }
}

async function main() {
  try {
    const context = await getPullRequestContext();
    if (!context) return;

    const eventName = github.context.eventName;
    const payload = github.context.payload;

    if (eventName === 'pull_request') {
      const pr = payload.pull_request;
      if (!pr || !pr.head.ref) {
        core.error('Could not get pull request head ref.');
        return;
      }
      // Assuming a deployment preview URL is available
      const previewUrl = core.getInput('preview-url', { required: false });
      if (previewUrl) {
        await runAudit(context, previewUrl);
      } else {
        core.warning('No preview-url provided. Skipping automatic audit.');
        await postComment(context, 'Accessibility audit skipped: No `preview-url` provided. To run a manual audit, comment `/audit-a11y <url>`.');
      }
    } else if (eventName === 'issue_comment' && payload.action === 'created') {
      const commentBody = payload.comment?.body;
      if (commentBody) {
        if (commentBody.startsWith('/audit-a11y')) {
          const url = commentBody.split(' ')[1];
          if (url) {
            await runAudit(context, url);
          }
          else {
            await postComment(context, 'Invalid /audit-a11y command. Usage: `/audit-a11y <url>`');
          }
        }
        else if (commentBody.startsWith('/fix-a11y')) {
          await handleFixCommand(context, commentBody);
        }
      }
    }
  }
  catch (error: any) {
    core.setFailed(error.message);
  }
}

main();
