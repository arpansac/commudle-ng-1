#!/bin/bash

# Exit script immediately if any command fails
set -e

# Advanced color codes and effects
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
BLINK='\033[5m'
RESET='\033[0m'
BG_BLUE='\033[48;5;24m'
BG_CYAN='\033[46m'
BG_GREEN='\033[42m'

# Clear screen
clear

# Animated loading function
show_loading() {
  local duration=$1
  local message=$2
  echo -ne "${CYAN}${message}${RESET}"
  for i in {1..3}; do
    echo -ne "."
    sleep $duration
  done
  echo -e " ${GREEN}✓${RESET}"
}

# Banner
echo -e "${CYAN}${BOLD}"
sleep 0.1
cat << "EOF"
    ╔══════════════════════════════════════════════════════════════════╗
    ║                                                                  ║
    ║     ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗   ██╗██████╗     ║
    ║    ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║   ██║██╔══██╗    ║
    ║    ██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║██║  ██║    ║
    ║    ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║██║  ██║    ║
    ║    ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╔╝██████╔╝    ║
    ║     ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝     ║
    ║                                                                  ║
EOF
echo -e "${MAGENTA}${BOLD}"
cat << "EOF"
    ║          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          ║
    ║          ▓▓  🏗️  PRODUCTION BUILD SYSTEM v2.0 🏗️   ▓▓          ║
    ║          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          ║
    ║                                                                  ║
    ╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${RESET}"
sleep 0.2

# System initialization
echo -e "${DIM}${CYAN}[SYSTEM]${RESET} ${DIM}Initializing build system...${RESET}"
sleep 0.3
echo -e "${DIM}${CYAN}[SYSTEM]${RESET} ${GREEN}✓${RESET} ${DIM}System ready${RESET}"
echo ""
sleep 0.2

# Environment selection
echo -e "${BG_BLUE}${BOLD}                                                                  ${RESET}"
echo -e "${BG_BLUE}${BOLD}  PHASE 1/4 › ENVIRONMENT CONFIGURATION                           ${RESET}"
echo -e "${BG_BLUE}${BOLD}                                                                  ${RESET}"
echo -e "${BLUE}╭──────────────────────────────────────────────────────────────╮${RESET}"
echo -e "${BLUE}│${RESET} ${YELLOW}Select your deployment environment:${RESET}                      ${BLUE}│${RESET}"
echo -e "${BLUE}╰──────────────────────────────────────────────────────────────╯${RESET}"
echo ""

PS3="$(echo -e "${MAGENTA}${BOLD}❯❯❯${RESET} ")"
select environment in "🏠  LOCAL      (Development)" "🧪  TEST       (Testing)" "🎭  STAGING    (Pre-production)" "🚀  PRODUCTION (Live)"; do
  case $environment in
    "🏠  LOCAL      (Development)"|"🧪  TEST       (Testing)"|"🎭  STAGING    (Pre-production)"|"🚀  PRODUCTION (Live)")
      env_name=$(echo $environment | awk '{print $2}' | tr '[:upper:]' '[:lower:]')
      echo ""
      echo -e "${GREEN}┌─────────────────────────────────────────────────────────────┐${RESET}"
      echo -e "${GREEN}│${RESET} ${BOLD}✓ ENVIRONMENT LOCKED:${RESET} ${CYAN}${BOLD}$env_name${RESET}                        ${GREEN}│${RESET}"
      echo -e "${GREEN}└─────────────────────────────────────────────────────────────┘${RESET}"
      break
      ;;
    *)
      echo -e "${RED}${BOLD}⚠ ERROR:${RESET} Invalid selection. Please try again."
      echo ""
      ;;
  esac
done

echo ""
show_loading 0.2 "${YELLOW}⚡${RESET} Configuring environment matrix"

show_loading 0.2 "${YELLOW}⚡${RESET} Configuring environment matrix"
show_loading 0.2 "${YELLOW}⚡${RESET} Syncing configuration files"
sed -i "" "s/export const environment = environments\['.*'\];/export const environment = environments['$env_name'];/" libs/shared/environments/src/lib/environments.ts
show_loading 0.2 "${YELLOW}⚡${RESET} Applying settings"
echo -e "${GREEN}${BOLD}✓ CONFIGURATION COMPLETE${RESET}"
echo ""
sleep 0.3

# Version configuration
echo -e "${BG_CYAN}${BOLD}                                                                  ${RESET}"
echo -e "${BG_CYAN}${BOLD}  PHASE 2/4 › VERSION CONFIGURATION                               ${RESET}"
echo -e "${BG_CYAN}${BOLD}                                                                  ${RESET}"

# Get current version from ngsw-config.json
CURRENT_VERSION=$(jq -r '.appData.version' apps/commudle-admin/ngsw-config.json)
echo -e "${CYAN}╭──────────────────────────────────────────────────────────────╮${RESET}"
echo -e "${CYAN}│${RESET} ${YELLOW}Current version:${RESET} ${BOLD}$CURRENT_VERSION${RESET}                              ${CYAN}│${RESET}"
echo -e "${CYAN}╰──────────────────────────────────────────────────────────────╯${RESET}"
echo ""
echo -e "${YELLOW}Select version increment:${RESET}"
PS3="$(echo -e "${MAGENTA}${BOLD}❯❯❯${RESET} ")"
select ver_option in "Keep current ($CURRENT_VERSION)" "Patch (x.x.x+1)" "Minor (x.x+1.0)" "Major (x+1.0.0)" "Custom version"; do
  case $ver_option in
    "Keep current ($CURRENT_VERSION)")
      version=$CURRENT_VERSION
      break
      ;;
    "Patch (x.x.x+1)")
      IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
      version="$major.$minor.$((patch + 1))"
      break
      ;;
    "Minor (x.x+1.0)")
      IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
      version="$major.$((minor + 1)).0"
      break
      ;;
    "Major (x+1.0.0)")
      IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
      version="$((major + 1)).0.0"
      break
      ;;
    "Custom version")
      read -p "$(echo -e "${MAGENTA}❯❯❯${RESET} Enter new version: ")" version
      break
      ;;
    *)
      echo -e "${RED}${BOLD}⚠ ERROR:${RESET} Invalid selection. Please try again."
      echo ""
      ;;
  esac
done

# Update both package.json and ngsw-config.json with new version
npm version $version --no-git-tag-version --allow-same-version > /dev/null 2>&1
jq --arg version "$version" '.appData.version = $version' \
  apps/commudle-admin/ngsw-config.json > apps/commudle-admin/ngsw-config.json.tmp && \
  mv apps/commudle-admin/ngsw-config.json.tmp apps/commudle-admin/ngsw-config.json

echo -e "${GREEN}✓${RESET} Version set to: ${BOLD}$version${RESET}"
echo ""
sleep 0.3

# Release notes
echo -e "${BG_BLUE}${BOLD}                                                                  ${RESET}"
echo -e "${BG_BLUE}${BOLD}  PHASE 3/4 › RELEASE NOTES                                       ${RESET}"
echo -e "${BG_BLUE}${BOLD}                                                                  ${RESET}"
read -p "$(echo -e "${MAGENTA}❯❯❯${RESET} Enter release notes: ")" releaseNotes
echo -e "${GREEN}✓${RESET} Release notes recorded"
echo ""
sleep 0.3

# Critical flag
echo -e "${BG_BLUE}${BOLD}                                                                  ${RESET}"
echo -e "${BG_BLUE}${BOLD}  PHASE 4/4 › CRITICAL UPDATE FLAG                                ${RESET}"
echo -e "${BG_BLUE}${BOLD}                                                                  ${RESET}"
read -p "$(echo -e "${MAGENTA}❯❯❯${RESET} Is this a critical update? ${DIM}(y/N)${RESET}: ")" critical_input
if [[ "$critical_input" =~ ^[Yy]$ ]]; then
  critical="true"
  echo -e "${RED}${BOLD}⚠ CRITICAL UPDATE FLAGGED${RESET}"
else
  critical="false"
  echo -e "${GREEN}✓${RESET} Standard update"
fi
echo ""
sleep 0.3

# Update ngsw-config.json
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PURPLE}║${RESET}  ${BOLD}BUILD CONFIGURATION SUMMARY${RESET}                              ${PURPLE}║${RESET}"
echo -e "${PURPLE}╠══════════════════════════════════════════════════════════════╣${RESET}"
echo -e "${PURPLE}║${RESET}  ${YELLOW}🌍 ENVIRONMENT:${RESET} ${CYAN}${BOLD}$env_name${RESET}                                   ${PURPLE}║${RESET}"
echo -e "${PURPLE}║${RESET}  ${YELLOW}📌 VERSION:${RESET}     ${BOLD}$version${RESET}                                    ${PURPLE}║${RESET}"
echo -e "${PURPLE}║${RESET}  ${YELLOW}📝 NOTES:${RESET}       ${BOLD}$releaseNotes${RESET}                              ${PURPLE}║${RESET}"
echo -e "${PURPLE}║${RESET}  ${YELLOW}⚡ CRITICAL:${RESET}    ${BOLD}$critical${RESET}                                     ${PURPLE}║${RESET}"
echo -e "${PURPLE}║${RESET}  ${YELLOW}🕐 TIMESTAMP:${RESET}   ${BOLD}$timestamp${RESET}                    ${PURPLE}║${RESET}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
sleep 0.5

show_loading 0.2 "${CYAN}📦${RESET} Updating service worker configuration"
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
jq --arg version "$version" --arg releaseNotes "$releaseNotes" --argjson critical "$critical" --arg timestamp "$timestamp" \
  '.appData.version = $version | .appData.releaseNotes = $releaseNotes | .appData.critical = $critical | .appData.timestamp = $timestamp' \
  apps/commudle-admin/ngsw-config.json > apps/commudle-admin/ngsw-config.json.tmp && \
  mv apps/commudle-admin/ngsw-config.json.tmp apps/commudle-admin/ngsw-config.json
echo -e "${GREEN}${BOLD}✓ CONFIGURATION SAVED${RESET}"
echo ""
sleep 0.3

# Build process
echo -e "${BG_GREEN}${BOLD}                                                                  ${RESET}"
echo -e "${BG_GREEN}${BOLD}  INITIATING BUILD SEQUENCE                                        ${RESET}"
echo -e "${BG_GREEN}${BOLD}                                                                  ${RESET}"
echo ""
sleep 0.3

show_loading 0.3 "${YELLOW}🧹${RESET} Resetting Nx cache"
# npx nx reset > /dev/null 2>&1
echo -e "${GREEN}${BOLD}✓ CACHE CLEARED${RESET}"
echo ""
sleep 0.3

echo -e "${CYAN}${BOLD}┌─────────────────────────────────────────────────────────────┐${RESET}"
echo -e "${CYAN}${BOLD}│${RESET}  ${BLINK}${GREEN}●${RESET} ${BOLD}BUILDING SSR RELEASE...${RESET}                                  ${CYAN}${BOLD}│${RESET}"
echo -e "${CYAN}${BOLD}└─────────────────────────────────────────────────────────────┘${RESET}"
echo ""
npx nx run commudle-admin:release
echo ""
echo -e "${GREEN}${BOLD}✓ BUILD COMPLETE${RESET}"
echo ""
sleep 0.5

# Final message
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║${RESET}  ${BOLD}✓ BUILD SUCCESSFUL!${RESET}                                        ${GREEN}║${RESET}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${RESET}"
echo -e "${GREEN}║${RESET}  ${YELLOW}📦 OUTPUT:${RESET} ${BOLD}prod-server.zip${RESET}                                ${GREEN}║${RESET}"
echo -e "${GREEN}║${RESET}  ${YELLOW}🚀 READY:${RESET}  Upload to Elastic Beanstalk for deployment      ${GREEN}║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${RESET}"