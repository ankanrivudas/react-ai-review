# React Test

This repository is a minimal scaffold demonstrating:

- A React app (Vite)
- Jest unit test
- Playwright end-to-end test
- A GitHub Actions workflow that runs tests and calls an AI review script
- A Husky pre-commit hook to run lint/tests locally

## How to use

1. Set secrets in GitHub repo:

   - `OPENAI_API_KEY` - API key for OpenAI or compatible LLM provider
   - `GITHUB_TOKEN` - (provided automatically in Actions)

2. Install and prepare:

   ```
   npm ci
   npm run prepare
   ```

3. Commit; Husky will run lint/tests. On PR creation the GitHub Action will run tests and execute `scripts/ai-review.js` to post suggestions as PR comments.

## Notes

- The AI script is a starting point. For inline comments, enhance the script to use `octokit.pulls.createReview` and map patch positions to lines.
- Copilot doesn't currently provide a hosted review API; use OpenAI/Azure OpenAI for automation.
