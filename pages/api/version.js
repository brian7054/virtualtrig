// pages/api/version.js
export default function handler(_req, res) {
  res.status(200).json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    repo: process.env.VERCEL_GIT_REPO_SLUG || null,
    projectId: process.env.VERCEL_PROJECT_ID || null,
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    builtAt: new Date().toISOString(),
  });
}
