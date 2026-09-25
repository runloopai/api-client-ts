#!/usr/bin/env bash
# Explains a staging/production trunk fork and prints the heal command.
# Expects origin/main = staging main and production/main = production main,
# plus GITHUB_REPOSITORY (staging) and PRODUCTION_REPO (production).
set -uo pipefail

STAGING_REPO="$GITHUB_REPOSITORY"
MERGE_MSG="chore: merge staging main into production to heal trunk fork"
# A squash PR cannot heal the fork: only a real merge commit makes staging an
# ancestor of production again, so this pushes past production's PR rule.
HEAL="git clone -q https://github.com/${STAGING_REPO}.git heal-fork && cd heal-fork && git remote add production https://github.com/${PRODUCTION_REPO}.git && git fetch -q production main && git checkout -B heal-fork production/main && git merge --no-ff origin/main -m \"${MERGE_MSG}\" && git push production heal-fork:main"
RESYNC="gh workflow run stlc-sync.yml -R ${STAGING_REPO}"

if git merge-tree --write-tree origin/main production/main >/dev/null 2>&1; then
  CLEAN=true
else
  CLEAN=false
fi

{
  echo "### Staging and production main have forked"
  echo
  echo "Each trunk has commits the other lacks, so neither back-sync nor promote can fast-forward. Every run of both fails until the fork is healed."
  echo
  echo "**Only on staging** (\`${STAGING_REPO}\`):"
  echo '```'
  git log --format='%h %an %s' production/main..origin/main
  echo '```'
  echo "**Only on production** (\`${PRODUCTION_REPO}\`):"
  echo '```'
  git log --format='%h %an %s' origin/main..production/main
  echo '```'
  if [ "$CLEAN" = true ]; then
    echo "They merge cleanly. Heal by pushing a merge commit to production main, with an identity that can bypass its pull-request rule (a squash-merged PR does not restore ancestry):"
    echo '```'
    echo "$HEAL"
    echo '```'
    echo "Then back-sync fast-forwards staging onto it:"
    echo '```'
    echo "$RESYNC"
    echo '```'
  else
    echo "They **conflict**, so the heal needs a hand-resolved merge: run the command below without the final \`git push\`, resolve and commit, then push \`heal-fork\` to production main and run \`${RESYNC}\`."
    echo '```'
    echo "$HEAL"
    echo '```'
  fi
} >> "${GITHUB_STEP_SUMMARY:-/dev/stdout}"

if [ "$CLEAN" = true ]; then
  echo "::error title=Trunks forked (clean merge)::staging and production main have diverged. Heal: push a merge commit to production main, then re-run back-sync. See the job summary for the commits involved.%0A%0A${HEAL}%0A%0A${RESYNC}"
else
  echo "::error title=Trunks forked (conflicting)::staging and production main have diverged and do not merge cleanly. Hand-resolve a merge of staging main into production main, push it, then run: ${RESYNC}. See the job summary."
fi
