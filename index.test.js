import { describe, it } from "node:test";
import assert from "node:assert";

// Extract the function for testing (we'll inline it here since it's not exported)
function extractPullRequestNumber(commit) {
  // Pattern 1: Normal merge commit - "Merge pull request #123 from ..."
  const normalMergeMatch = /^Merge pull request #(\d+) from/.exec(
    commit.subject
  );
  if (normalMergeMatch) {
    return parseInt(normalMergeMatch[1], 10);
  }

  // Pattern 2: Squash merge - "Title (#123)"
  const squashMergeMatch = /\(#(\d+)\)\s*$/.exec(commit.subject);
  if (squashMergeMatch) {
    return parseInt(squashMergeMatch[1], 10);
  }

  return null;
}

describe("extractPullRequestNumber", () => {
  it("extracts PR number from normal merge commit", () => {
    const commit = { subject: "Merge pull request #123 from feature/branch" };
    assert.strictEqual(extractPullRequestNumber(commit), 123);
  });

  it("extracts PR number from squash merge commit", () => {
    const commit = { subject: "feat: add new feature (#456)" };
    assert.strictEqual(extractPullRequestNumber(commit), 456);
  });

  it("extracts PR number from squash merge with complex title", () => {
    const commit = {
      subject: "[#144] Remove v prefix from semantic-release tags (#143)",
    };
    assert.strictEqual(extractPullRequestNumber(commit), 143);
  });

  it("returns null for regular commits without PR reference", () => {
    const commit = { subject: "fix: update dependencies" };
    assert.strictEqual(extractPullRequestNumber(commit), null);
  });

  it("returns null for commits with issue reference in middle", () => {
    const commit = { subject: "fix issue #123 in module" };
    assert.strictEqual(extractPullRequestNumber(commit), null);
  });

  it("handles PR number with trailing whitespace", () => {
    const commit = { subject: "feat: add feature (#789)  " };
    assert.strictEqual(extractPullRequestNumber(commit), 789);
  });
});
