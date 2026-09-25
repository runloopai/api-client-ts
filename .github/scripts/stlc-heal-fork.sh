#!/usr/bin/env bash
# Heals a staging/production trunk fork with a merge commit, only when the
# trunks merge cleanly; otherwise explains the fork and fails.
# Expects origin/main = staging main and production/main = production main,
# plus GITHUB_REPOSITORY (staging), PRODUCTION_REPO and PRODUCTION_REPO_TOKEN.
set -euo pipefail

HINT="$(dirname "$0")/stlc-fork-hint.sh"

# One trunk ahead of the other is a fast-forward, not a fork.
if git merge-base --is-ancestor origin/main production/main ||
   git merge-base --is-ancestor production/main origin/main; then
  echo "::error title=Fork heal refused::staging and production main have not forked."
  exit 1
fi

if [ -z "${PRODUCTION_REPO_TOKEN:-}" ]; then
  bash "$HINT"
  echo "::error title=Fork heal blocked::PRODUCTION_REPO_TOKEN is required to heal the fork."
  exit 1
fi

if ! TREE=$(git merge-tree --write-tree origin/main production/main 2>/dev/null); then
  bash "$HINT"
  exit 1
fi

STAGING_ONLY=$(git log --format='%h %an %s' production/main..origin/main)
PRODUCTION_ONLY=$(git log --format='%h %an %s' origin/main..production/main)

# Not stlc-bot: seal-dispatch must still re-seal the production custom code
# this merge brings onto staging.
MERGE=$(
  GIT_AUTHOR_NAME="stlc-fork-heal" GIT_AUTHOR_EMAIL="41898282+github-actions[bot]@users.noreply.github.com" \
  GIT_COMMITTER_NAME="stlc-fork-heal" GIT_COMMITTER_EMAIL="41898282+github-actions[bot]@users.noreply.github.com" \
  git commit-tree "$TREE" -p production/main -p origin/main \
    -m "chore: merge staging main into production to heal trunk fork"
)

git remote set-url production "https://x-access-token:${PRODUCTION_REPO_TOKEN}@github.com/${PRODUCTION_REPO}.git"
git remote set-url origin "https://x-access-token:${PRODUCTION_REPO_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

# Both pushes are fast-forwards (MERGE descends from each tip), so a trunk that
# moved since the fetch rejects the push and the next scheduled run retries.
# Production first: if staging then moves, the next run sees a fresh fork and heals it.
git -c "http.https://github.com/.extraheader=" push production "$MERGE:refs/heads/main"
git -c "http.https://github.com/.extraheader=" push origin "$MERGE:refs/heads/main"

SHORT=$(git rev-parse --short "$MERGE")
{
  echo "### Healed a staging/production trunk fork"
  echo
  echo "The trunks had diverged but merged cleanly, so merge commit \`${SHORT}\` was pushed to both \`${PRODUCTION_REPO}\` main and \`${GITHUB_REPOSITORY}\` main by ${GITHUB_WORKFLOW:-stlc} run ${GITHUB_RUN_ID:-local}."
  echo
  echo "**Was only on staging:**"
  echo '```'
  echo "$STAGING_ONLY"
  echo '```'
  echo "**Was only on production:**"
  echo '```'
  echo "$PRODUCTION_ONLY"
  echo '```'
  echo "The combination was not tested before it reached production; staging CI runs on the push."
} >> "${GITHUB_STEP_SUMMARY:-/dev/stdout}"
echo "::warning title=Trunk fork healed::pushed clean merge commit ${SHORT} to staging and production main. See the job summary for the commits it joined."
