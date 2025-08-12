import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const {
  GITHUB_REPOSITORY,
  GITHUB_REF,
  OPENAI_API_KEY,
  GITHUB_TOKEN,
  PR_NUMBER,
} = process.env;

if (!GITHUB_REPOSITORY) {
  console.error("GITHUB_REPOSITORY is not set.");
  process.exit(1);
}

async function run() {
  const [owner, repo] = GITHUB_REPOSITORY.split("/");
  const prNumber = PR_NUMBER || (GITHUB_REF && GITHUB_REF.split("/").pop());
  if (!prNumber) {
    console.error(
      "PR number not found in environment. Set PR_NUMBER or run from a PR workflow."
    );
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const filesResp = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  const files = filesResp.data;
  const diffText = files
    .map((f) => `=== FILE: ${f.filename} ===\n${f.patch || ""}`)
    .join("\n\n");

  const prompt = [
    {
      role: "system",
      content:
        "You are a code reviewer focusing on performance, complexity, and test coverage.",
    },
    {
      role: "user",
      content: `Here is the PR diff:\n\n${diffText}\n\nGive performance improvement suggestions and proposed code changes. Use markdown.`,
    },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: prompt,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI API error:", res.status, await res.text());
    process.exit(1);
  }

  const json = await res.json();
  const commentBody =
    json.choices?.[0]?.message?.content || "No suggestions returned.";

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `🤖 **AI Performance Review**\n\n${commentBody}`,
  });

  console.log("Posted AI review comment on PR #" + prNumber);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
