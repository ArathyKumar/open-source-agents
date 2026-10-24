import { AxeResults, Result } from 'axe-core';

export function formatAxeResultsAsJson(results: AxeResults): string {
  return JSON.stringify(results, null, 2);
}

export function formatAxeResultsAsGitHubPRMarkdown(results: AxeResults): string {
  let markdown = `# Accessibility Audit Report\n\n`;

  if (results.violations.length > 0) {
    markdown += `## Violations\n\n`;
    results.violations.forEach((violation: Result) => {
      markdown += `### [${violation.id}] ${violation.help}\n`;
      markdown += `**Impact**: ${violation.impact || 'N/A'}\n`;
      markdown += `**Description**: ${violation.description}\n`;
      markdown += `**Help URL**: ${violation.helpUrl}\n`;
      markdown += `**Nodes**:\n`;
      violation.nodes.forEach(node => {
        markdown += `-   **HTML**: \`\`\`html\\n${node.html}\\n\`\`\`\n`;
        markdown += `    **Target**: \`${node.target.join(', ')}\`\n`;
        if (node.failureSummary) {
          markdown += `    **Failure Summary**: ${node.failureSummary}\n`;
        }
      });
      markdown += `\n`;
    });
  } else {
    markdown += `## No Accessibility Violations Found! 🎉\n\n`;
  }

  if (results.passes.length > 0) {
    markdown += `## Passes\n\n`;
    results.passes.forEach((pass: Result) => {
      markdown += `-   [${pass.id}] ${pass.help}\n`;
    });
    markdown += `\n`;
  }

  if (results.incomplete.length > 0) {
    markdown += `## Incomplete\n\n`;
    results.incomplete.forEach((incomplete: Result) => {
      markdown += `-   [${incomplete.id}] ${incomplete.help}\n`;
    });
    markdown += `\n`;
  }

  if (results.inapplicable.length > 0) {
    markdown += `## Inapplicable\n\n`;
    results.inapplicable.forEach((inapplicable: Result) => {
      markdown += `-   [${inapplicable.id}] ${inapplicable.help}\n`;
    });
    markdown += `\n`;
  }

  return markdown;
}