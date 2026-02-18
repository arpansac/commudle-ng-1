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
BG_BLUE='\033[44m'
BG_CYAN='\033[46m'

# Clear screen for immersive experience
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

# Futuristic banner with glitch effect
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
    ║          ▓▓  🚀 DEVELOPMENT SERVER LAUNCHER v2.0 🚀  ▓▓          ║
    ║          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          ║
    ║                                                                  ║
    ╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${RESET}"
sleep 0.2

# System initialization
echo -e "${DIM}${CYAN}[SYSTEM]${RESET} ${DIM}Initializing quantum core...${RESET}"
sleep 0.3
echo -e "${DIM}${CYAN}[SYSTEM]${RESET} ${DIM}Loading neural pathways...${RESET}"
sleep 0.3
echo -e "${DIM}${CYAN}[SYSTEM]${RESET} ${GREEN}✓${RESET} ${DIM}System ready${RESET}"
echo ""
sleep 0.2

# Environment selection with enhanced UI
echo -e "${BG_BLUE}${BOLD}                                                                  ${RESET}"
echo -e "${BG_BLUE}${BOLD}  PHASE 1/2 › ENVIRONMENT CONFIGURATION                           ${RESET}"
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

# Update environment with animation
echo ""
show_loading 0.2 "${YELLOW}⚡${RESET} Configuring environment matrix"
show_loading 0.2 "${YELLOW}⚡${RESET} Syncing configuration files"
sed -i "" "s/export const environment = environments\['.*'\];/export const environment = environments['$env_name'];/" libs/shared/environments/src/lib/environments.ts
show_loading 0.2 "${YELLOW}⚡${RESET} Applying quantum settings"
echo -e "${GREEN}${BOLD}✓ CONFIGURATION COMPLETE${RESET}"
echo ""
sleep 0.3

# Server configuration
echo -e "${BG_CYAN}${BOLD}                                                                  ${RESET}"
echo -e "${BG_CYAN}${BOLD}  PHASE 2/2 › SERVER CONFIGURATION                                ${RESET}"
echo -e "${BG_CYAN}${BOLD}                                                                  ${RESET}"
echo -e "${CYAN}╭──────────────────────────────────────────────────────────────╮${RESET}"
echo -e "${CYAN}│${RESET} ${YELLOW}Choose your server deployment mode:${RESET}                      ${CYAN}│${RESET}"
echo -e "${CYAN}╰──────────────────────────────────────────────────────────────╯${RESET}"
echo ""

PS3="$(echo -e "${MAGENTA}${BOLD}❯❯❯${RESET} ")"
select serve_option in "💻  STANDARD   (localhost:4200)" "🌐  NETWORK    (0.0.0.0:4200)" "⚙️   CUSTOM     (Your port)"; do
  case $serve_option in
    "💻  STANDARD   (localhost:4200)")
      echo ""
      echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${RESET}"
      echo -e "${PURPLE}║${RESET}  ${BLINK}${GREEN}●${RESET} ${BOLD}INITIATING LAUNCH SEQUENCE${RESET}                              ${PURPLE}║${RESET}"
      echo -e "${PURPLE}╠══════════════════════════════════════════════════════════════╣${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}📡 MODE:${RESET}        ${BOLD}Standard Development${RESET}                    ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}🌍 ENVIRONMENT:${RESET} ${CYAN}${BOLD}$env_name${RESET}                                   ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}🔗 URL:${RESET}         ${BOLD}${GREEN}http://localhost:4200${RESET}                  ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}⚡ STATUS:${RESET}      ${GREEN}${BOLD}READY TO LAUNCH${RESET}                         ${PURPLE}║${RESET}"
      echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${RESET}"
      echo ""
      sleep 0.5
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 3...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 2...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 1...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LIFTOFF! 🚀${RESET}"
      echo ""
      npx nx run commudle-admin:serve
      break
      ;;
    "🌐  NETWORK    (0.0.0.0:4200)")
      echo ""
      echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${RESET}"
      echo -e "${PURPLE}║${RESET}  ${BLINK}${GREEN}●${RESET} ${BOLD}INITIATING LAUNCH SEQUENCE${RESET}                              ${PURPLE}║${RESET}"
      echo -e "${PURPLE}╠══════════════════════════════════════════════════════════════╣${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}📡 MODE:${RESET}        ${BOLD}Network Development${RESET}                     ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}🌍 ENVIRONMENT:${RESET} ${CYAN}${BOLD}$env_name${RESET}                                   ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}🔗 URL:${RESET}         ${BOLD}${GREEN}http://0.0.0.0:4200${RESET}                    ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}💡 TIP:${RESET}         ${DIM}Access from any device on your network${RESET}  ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}⚡ STATUS:${RESET}      ${GREEN}${BOLD}READY TO LAUNCH${RESET}                         ${PURPLE}║${RESET}"
      echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${RESET}"
      echo ""
      sleep 0.5
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 3...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 2...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 1...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LIFTOFF! 🚀${RESET}"
      echo ""
      npx nx run commudle-admin:serve --host 0.0.0.0
      break
      ;;
    "⚙️   CUSTOM     (Your port)")
      echo ""
      read -p "$(echo -e "${YELLOW}⚙️  Enter custom port ${DIM}(default: 4200)${RESET}: ")" port
      port=${port:-4200}
      echo ""
      echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${RESET}"
      echo -e "${PURPLE}║${RESET}  ${BLINK}${GREEN}●${RESET} ${BOLD}INITIATING LAUNCH SEQUENCE${RESET}                              ${PURPLE}║${RESET}"
      echo -e "${PURPLE}╠══════════════════════════════════════════════════════════════╣${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}📡 MODE:${RESET}        ${BOLD}Custom Port Development${RESET}                 ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}🌍 ENVIRONMENT:${RESET} ${CYAN}${BOLD}$env_name${RESET}                                   ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}🔗 URL:${RESET}         ${BOLD}${GREEN}http://localhost:$port${RESET}                     ${PURPLE}║${RESET}"
      echo -e "${PURPLE}║${RESET}  ${YELLOW}⚡ STATUS:${RESET}      ${GREEN}${BOLD}READY TO LAUNCH${RESET}                         ${PURPLE}║${RESET}"
      echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${RESET}"
      echo ""
      sleep 0.5
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 3...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 2...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LAUNCHING IN 1...${RESET}"
      sleep 0.8
      echo -e "${GREEN}${BOLD}🚀 LIFTOFF! 🚀${RESET}"
      echo ""
      npx nx run commudle-admin:serve --port $port
      break
      ;;
    *)
      echo -e "${RED}${BOLD}⚠ ERROR:${RESET} Invalid selection. Please try again."
      echo ""
      ;;
  esac
done