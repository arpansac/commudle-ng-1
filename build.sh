#!/bin/bash

# ─────────────────────────────────────────────────────────────────────────────
# Commudle Production Build System v3.0
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── Colors & Styles ──
R='\033[0m'
B='\033[1m'
D='\033[2m'
CY='\033[0;36m'
GR='\033[0;32m'
YL='\033[1;33m'
RD='\033[0;31m'
MG='\033[0;35m'
WH='\033[1;37m'
BG_BL='\033[44m'
BG_GR='\033[42m'
BG_MG='\033[45m'

# ── Build Timer ──
BUILD_START=$(date +%s)

# ── Utility Functions ──
line() { echo -e "${D}${CY}$(printf '%.0s─' {1..70})${R}"; }
step() { echo -e "  ${CY}${B}[$1/${TOTAL_STEPS}]${R} ${WH}$2${R}"; }
ok() { echo -e "       ${GR}✔${R} $1"; }
warn() { echo -e "       ${YL}⚠${R} $1"; }
fail() { echo -e "       ${RD}✘${R} $1"; exit 1; }
info() { echo -e "       ${D}$1${R}"; }
spacer() { echo ""; }

elapsed() {
  local end=$(date +%s)
  local diff=$((end - BUILD_START))
  local min=$((diff / 60))
  local sec=$((diff % 60))
  echo "${min}m ${sec}s"
}

# ── Arrow Key Menu ──
# Usage: arrow_select option1 option2 option3 ...
# Returns selected option via: ARROW_RESULT
ARROW_RESULT=""
arrow_select() {
  local options=("$@")
  local selected=0
  local count=${#options[@]}

  tput civis 2>/dev/null || true

  while true; do
    for i in "${!options[@]}"; do
      if [ $i -eq $selected ]; then
        echo -e "       ${CY}${B}▸ ${options[$i]}${R}"
      else
        echo -e "       ${D}  ${options[$i]}${R}"
      fi
    done

    read -rsn1 key
    if [[ "$key" == $'\x1b' ]]; then
      read -rsn2 key
      case "$key" in
        '[A') ((selected > 0)) && ((selected--)) ;;          # Up
        '[B') ((selected < count - 1)) && ((selected++)) ;;  # Down
      esac
    elif [[ "$key" == "" ]]; then
      break
    fi

    tput cuu "$count" 2>/dev/null || echo -ne "\033[${count}A"
  done

  tput cnorm 2>/dev/null || true

  ARROW_RESULT="${options[$selected]}"
}

TOTAL_STEPS=6
ENV_FILE="libs/shared/environments/src/lib/environments.ts"
NGSW_FILE="apps/commudle-admin/ngsw-config.json"

# ── Clear & Banner ──
clear
echo ""
echo -e "${CY}${B}"
cat << 'BANNER'
     ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗   ██╗██████╗ ██╗     ███████╗
    ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║   ██║██╔══██╗██║     ██╔════╝
    ██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║██║  ██║██║     █████╗
    ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║██║  ██║██║     ██╔══╝
    ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗
     ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝╚══════╝╚══════╝
BANNER
echo -e "${R}"
echo -e "    ${BG_MG}${WH}  BUILD SYSTEM v3.0  ${R}  ${D}Production Release Pipeline${R}"
echo ""
line

# ── System Info ──
spacer
echo -e "  ${D}${CY}SYSTEM${R}"
info "Node     : $(node -v 2>/dev/null || echo 'not found')"
info "npm      : $(npm -v 2>/dev/null || echo 'not found')"
info "OS       : $(uname -s) $(uname -m)"
info "Date     : $(date '+%b %d, %Y  %H:%M:%S')"
info "User     : $(whoami)"
spacer
line

# ── STEP 1: Pre-flight Checks ──
spacer
step 1 "PRE-FLIGHT CHECKS"
spacer

command -v node &> /dev/null && ok "Node.js $(node -v)" || fail "Node.js not found"
command -v npm &> /dev/null && ok "npm $(npm -v)" || fail "npm not found"
command -v jq &> /dev/null && ok "jq available" || fail "jq not found. Install: brew install jq"
npx nx --version &> /dev/null && ok "Nx workspace detected" || fail "Nx not found. Run npm ci"
[ -f "$ENV_FILE" ] && ok "Environment config" || fail "Missing: $ENV_FILE"
[ -f "$NGSW_FILE" ] && ok "Service worker config" || fail "Missing: $NGSW_FILE"

spacer
line

# ── STEP 2: Git Pull ──
spacer
step 2 "GIT PULL"
spacer

# Detect remotes
REMOTES=($(git remote 2>/dev/null))
if [ ${#REMOTES[@]} -eq 0 ]; then
  warn "No git remotes found, skipping pull"
else
  info "Current branch: ${B}$(git branch --show-current)${R}"
  spacer
  echo -e "       ${YL}Select remote:${R}"
  spacer
  arrow_select "${REMOTES[@]}" "Skip pull"
  pull_remote="$ARROW_RESULT"

  if [ "$pull_remote" != "Skip pull" ]; then
    spacer
    read -p "$(echo -e "       ${MG}▸${R} Branch name: ")" pull_branch
    [ -z "$pull_branch" ] && pull_branch=$(git branch --show-current)
    spacer
    info "Running: git pull ${pull_remote} ${pull_branch}"
    git pull "$pull_remote" "$pull_branch"
    spacer
    ok "Pulled ${B}${pull_remote}/${pull_branch}${R}"
  else
    spacer
    ok "Skipped git pull"
  fi
fi

spacer
line

# ── STEP 3: Environment ──
spacer
step 3 "ENVIRONMENT"
spacer
echo -e "       ${YL}Use ↑↓ arrows to select, Enter to confirm${R}"
spacer

arrow_select "local" "test" "staging" "production"
env_selected="$ARROW_RESULT"

sed -i "" "s/export const environment = environments\['.*'\];/export const environment = environments['$env_selected'];/" "$ENV_FILE"
spacer
ok "Environment → ${B}${env_selected}${R}"
spacer
line

# ── STEP 4: Version ──
spacer
step 4 "VERSION"
spacer

CURRENT_VERSION=$(jq -r '.appData.version' "$NGSW_FILE")
info "Current: ${B}${CURRENT_VERSION}${R}"
spacer

IFS='.' read -r v_major v_minor v_patch <<< "$CURRENT_VERSION"
patch_v="$v_major.$v_minor.$((v_patch + 1))"
minor_v="$v_major.$((v_minor + 1)).0"
major_v="$((v_major + 1)).0.0"

echo -e "       ${YL}Use ↑↓ arrows to select, Enter to confirm${R}"
spacer

arrow_select "Keep current ($CURRENT_VERSION)" "Patch ($patch_v)" "Minor ($minor_v)" "Major ($major_v)" "Custom"
ver_selected="$ARROW_RESULT"

case "$ver_selected" in
  "Keep current"*) version="$CURRENT_VERSION" ;;
  "Patch"*) version="$patch_v" ;;
  "Minor"*) version="$minor_v" ;;
  "Major"*) version="$major_v" ;;
  "Custom")
    read -p "$(echo -e "       ${MG}▸${R} Version (x.y.z): ")" version
    ;;
esac

jq --arg v "$version" '.appData.version = $v' "$NGSW_FILE" > "${NGSW_FILE}.tmp" && mv "${NGSW_FILE}.tmp" "$NGSW_FILE"
spacer
ok "Version → ${B}${version}${R}"
spacer
line

# ── STEP 5: Release Metadata ──
spacer
step 5 "RELEASE METADATA"
spacer

read -p "$(echo -e "       ${MG}▸${R} Release notes: ")" releaseNotes
[ -z "$releaseNotes" ] && releaseNotes="Release $version"
ok "Notes → ${D}${releaseNotes}${R}"
spacer

echo -e "       ${YL}Critical update?${R}"
spacer
arrow_select "No" "Yes"
crit_selected="$ARROW_RESULT"
[ "$crit_selected" = "Yes" ] && critical="true" || critical="false"
spacer
ok "Critical → ${B}${critical}${R}"

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

jq --arg v "$version" \
   --arg notes "$releaseNotes" \
   --argjson crit "$critical" \
   --arg ts "$timestamp" \
   '.appData.version = $v | .appData.releaseNotes = $notes | .appData.critical = $crit | .appData.timestamp = $ts' \
   "$NGSW_FILE" > "${NGSW_FILE}.tmp" && mv "${NGSW_FILE}.tmp" "$NGSW_FILE"

ok "Config saved"
spacer
line

# ── Build Manifest ──
spacer
echo -e "  ${BG_BL}${WH}  BUILD MANIFEST  ${R}"
spacer
echo -e "       ┌────────────────┬──────────────────────────────────────┐"
printf "       │ ${D}Environment${R}    │ ${B}%-36s${R}│\n" "$env_selected"
printf "       │ ${D}Version${R}        │ ${B}%-36s${R}│\n" "$version"
printf "       │ ${D}Critical${R}       │ ${B}%-36s${R}│\n" "$critical"
printf "       │ ${D}Timestamp${R}      │ ${B}%-36s${R}│\n" "$timestamp"
printf "       │ ${D}Notes${R}          │ ${B}%-36.36s${R}│\n" "$releaseNotes"
echo -e "       └────────────────┴──────────────────────────────────────┘"
spacer
line

# ── STEP 6: SSR Build ──
spacer
step 6 "SSR BUILD"
spacer

echo -e "       ${CY}●${R} ${B}Building commudle-admin SSR release...${R}"
echo -e "       ${D}This may take several minutes.${R}"
spacer

npx nx run commudle-admin:release

spacer
ok "SSR build complete"
spacer
line

# ── Final Report ──
BUILD_TIME=$(elapsed)

spacer
echo -e "  ${BG_GR}${WH}  BUILD SUCCESSFUL  ${R}"
spacer
echo -e "       ┌────────────────┬──────────────────────────────────────┐"
printf "       │ ${D}Output${R}         │ ${B}%-36s${R}│\n" "prod-server.zip"
printf "       │ ${D}Environment${R}    │ ${B}%-36s${R}│\n" "$env_selected"
printf "       │ ${D}Version${R}        │ ${B}%-36s${R}│\n" "$version"
printf "       │ ${D}Build Time${R}     │ ${B}%-36s${R}│\n" "$BUILD_TIME"
echo -e "       └────────────────┴──────────────────────────────────────┘"
spacer
echo -e "       ${GR}→${R} Upload ${B}prod-server.zip${R} to Elastic Beanstalk to deploy."
spacer
line
echo ""
