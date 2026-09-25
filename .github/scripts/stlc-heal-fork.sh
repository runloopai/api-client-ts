#!/usr/bin/env bash
# Heals a staging/production trunk fork with a merge commit, only when the
# trunks merge cleanly and staging CI passes on that merge; otherwise explains
# the fork and fails.
# Expects origin/main = staging main and production/main = production main,
# plus GITHUB_REPOSITORY (staging), PRODUCTION_REPO, PRODUCTION_REPO_TOKEN, and
# GH_TOKEN able to read staging's Actions runs.
set -euo pipefail

HINT="$(dirname "$0")/stlc-fork-hint.sh"
HEAL_BRANCH=stlc-fork-heal
CI_WORKFLOW=.github/workflows/ci.yml
CI_TIMEOUT=${STLC_HEAL_CI_TIMEOUT:-1800}
POLL=${STLC_HEAL_POLL:-15}

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
push() { git -c "http.https://github.com/.extraheader=" push "$@"; }

# Nothing reaches main until staging CI passes on this exact merge: a clean text
# merge can still fail to build. CI runs on any staging branch push; the branch
# only triggers it.
push --force origin "$MERGE:refs/heads/$HEAL_BRANCH"
trap 'push -q origin --delete "$HEAL_BRANCH" || true' EXIT

blocked() {
  {
    echo "### Staging and production main have forked; heal blocked by CI"
    echo
    echo "They merge cleanly as text, but $1, so nothing was pushed to main. Fix the combination on either trunk (or push a fixed merge by hand); the next back-sync poll retries the heal."
    echo
    echo "CI run: ${CI_URL:-none found}"
    echo
    echo "**Only on staging:**"
    echo '```'
    echo "$STAGING_ONLY"
    echo '```'
    echo "**Only on production:**"
    echo '```'
    echo "$PRODUCTION_ONLY"
    echo '```'
  } >> "${GITHUB_STEP_SUMMARY:-/dev/stdout}"
  echo "::error title=Fork heal blocked::$1 on clean merge commit ${MERGE}; nothing was pushed to main. CI run: ${CI_URL:-none found}"
  exit 1
}

deadline=$((SECONDS + CI_TIMEOUT))
STATUS="" CONCLUSION="" CI_URL=""
while :; do
  # A failed lookup reads as "not finished yet" and is retried until the deadline.
  read -r STATUS CONCLUSION CI_URL < <(
    gh api "repos/${GITHUB_REPOSITORY}/actions/runs?head_sha=${MERGE}&event=push" \
      --jq "[.workflow_runs[] | select(.path | startswith(\"${CI_WORKFLOW}\"))][0] | \"\(.status) \(.conclusion) \(.html_url)\""
  ) || true
  [ "$CI_URL" = null ] && CI_URL=""
  [ "$STATUS" = completed ] && break
  [ "$SECONDS" -ge "$deadline" ] && blocked "staging CI did not finish within ${CI_TIMEOUT}s"
  sleep "$POLL"
done

[ "$CONCLUSION" = success ] || blocked "staging CI concluded ${CONCLUSION}"

# Both pushes are fast-forwards (MERGE descends from each tip), so a trunk that
# moved since the fetch rejects the push and the next scheduled run retries.
# Production first: if staging then moves, the next run sees a fresh fork and heals it.
push production "$MERGE:refs/heads/main"
push origin "$MERGE:refs/heads/main"

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
  echo "Staging CI passed on this exact commit before it was pushed: ${CI_URL}"
} >> "${GITHUB_STEP_SUMMARY:-/dev/stdout}"
echo "::warning title=Trunk fork healed::pushed clean merge commit ${SHORT} to staging and production main. See the job summary for the commits it joined."
