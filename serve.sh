#!/bin/bash

# Exit script immediately if any command fails
set -e

# Start message
echo "Starting the development server..."
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

# Prompt for serve options
echo "Select serve option (use arrow keys):"
PS3="Choose serve option: "
select serve_option in "Development server" "Host binding (0.0.0.0)" "Custom port"; do
  case $serve_option in
    "Development server")
      echo "Starting development server..."
      npx nx run commudle-admin:serve
      break
      ;;
    "Host binding (0.0.0.0)")
      echo "Starting development server with host binding..."
      npx nx run commudle-admin:serve --host 0.0.0.0
      break
      ;;
    "Custom port")
      read -p "Enter port number (default 4200): " port
      if [ -z "$port" ]; then
        port="4200"
      fi
      echo "Starting development server on port $port..."
      npx nx run commudle-admin:serve --port $port
      break
      ;;
    *)
      echo "Invalid selection. Please try again."
      ;;
  esac
done