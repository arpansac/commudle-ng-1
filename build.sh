#!/bin/bash

# Exit script immediately if any command fails
set -e

# Start message
echo "Starting the build process..."
echo "Please provide the following information:"

# Prompt for environment
echo "Select environment (use arrow keys):"
PS3="Choose environment: "
select environment in "local" "test" "staging" "production"; do
  case $environment in
    local|test|staging|production)
      break
      ;;
    *)
      echo "Invalid selection. Please try again."
      ;;
  esac
done

echo "Selected environment: $environment"
echo ""

# Update environment in environments.ts
echo "Updating environment configuration..."
sed -i "" "s/export const environment = environments\['.*'\];/export const environment = environments['$environment'];/" libs/shared/environments/src/lib/environments.ts

# Prompt for version
read -p "Enter version (current: $(jq -r '.appData.version' apps/commudle-admin/ngsw-config.json)): " version
if [ -z "$version" ]; then
  version=$(jq -r '.appData.version' apps/commudle-admin/ngsw-config.json)
fi

# Prompt for release notes
read -p "Enter release notes: " releaseNotes

# Prompt for critical flag
read -p "Is this a critical update? (y/N): " critical_input
if [[ "$critical_input" =~ ^[Yy]$ ]]; then
  critical="true"
else
  critical="false"
fi

# Update ngsw-config.json
echo "Updating service worker configuration..."
jq --arg version "$version" --arg releaseNotes "$releaseNotes" --argjson critical "$critical" \
  '.appData.version = $version | .appData.releaseNotes = $releaseNotes | .appData.critical = $critical' \
  apps/commudle-admin/ngsw-config.json > apps/commudle-admin/ngsw-config.json.tmp && \
  mv apps/commudle-admin/ngsw-config.json.tmp apps/commudle-admin/ngsw-config.json

echo "Configuration updated:"
echo "  Version: $version"
echo "  Release Notes: $releaseNotes"
echo "  Critical: $critical"
echo ""

# Run npx nx reset
echo "Resetting Nx cache..."
npx nx reset && echo "Reset complete."

# Run npx nx run prerender:release
echo "Running prerender build..."
npx nx run prerender:release && echo "Prerender build complete."

# Final message
echo "Build complete! You can now upload 'prod-server.zip' to the AWS server for deployment."