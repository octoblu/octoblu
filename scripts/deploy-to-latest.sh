#!/bin/bash

SCRIPT_NAME='deploy-to-latest'

if [ -z "$PROJECT_DIR" ]; then
  PROJECT_DIR="$HOME/Projects/Octoblu"
fi

assert_required_params() {
  local codefresh_template="$1"

  if [ -n "$codefresh_template" ] && [ -f "$codefresh_template" ]; then
    return 0
  fi

  usage

  if [ -z "$codefresh_template" ]; then
    err_echo "Missing codefresh template argument"
  fi

  if [ -f "$codefresh_template" ]; then
    err_echo "Codefresh template must be a file"
  fi

  exit 1
}

debug() {
  local cyan='\033[0;36m'
  local no_color='\033[0;0m'
  local message="$@"
  matches_debug || return 0
  (>&2 echo -e "[${cyan}${SCRIPT_NAME}${no_color}]: $message")
}

err_echo() {
  echo "$@" 1>&2
}

fatal() {
  err_echo "$@"
  exit 1
}

matches_debug() {
  if [ -z "$DEBUG" ]; then
    return 1
  fi
  # shellcheck disable=2053
  if [[ $SCRIPT_NAME == $DEBUG ]]; then
    return 0
  fi
  return 1
}

script_directory(){
  local source="${BASH_SOURCE[0]}"
  local dir=""

  while [ -h "$source" ]; do # resolve $source until the file is no longer a symlink
    dir="$( cd -P "$( dirname "$source" )" && pwd )"
    source="$(readlink "$source")"
    [[ $source != /* ]] && source="$dir/$source" # if $source was a relative symlink, we need to resolve it relative to the path where the symlink file was located
  done

  dir="$( cd -P "$( dirname "$source" )" && pwd )"

  echo "$dir"
}

usage(){
  echo "USAGE: ${SCRIPT_NAME} --codefresh-template ./codefresh.yml --services meshblu-core-dispatcher"
  echo ''
  echo 'Description: add codefresh.yml to a list of services'
  echo ''
  echo 'Arguments:'
  echo '  -h, --help       print this help text'
  echo '  -v, --version    print the version'
  echo '  -c, --codefresh-template  codefresh.yml template to copy to each project'
  echo '  -s, --services  a list of services'
  echo ''
  echo 'Environment:'
  echo '  DEBUG            print debug output'
  echo '  PROJECT_DIR      project directory'
  echo ''
}

version(){
  local directory
  directory="$(script_directory)"

  if [ -f "$directory/VERSION" ]; then
    cat "$directory/VERSION"
  else
    echo "unknown-version"
  fi
}

copy_template() {
  local service_name="$1"
  local codefresh_template="$2"
  cp "$codefresh_template" "$PROJECT_DIR/$service_name/codefresh.yml"
  err_echo "copied codefresh.yml to $service_name"
}

push_changes() {
  local service_name="$1"
  pushd "$PROJECT_DIR/$service_name" > /dev/null
    err_echo "committing codefresh.yml to $service_name"
    git add ./codefresh.yml
    git commit -m "added codefresh.yml to deploy to latest"
    git push origin master
  popd > /dev/null
}

main() {
  local codefresh_template
  local services=()
  while [ "$1" != "" ]; do
    local param value
    param="$1"
    # shellcheck disable=2034
    value="$2"

    case "$param" in
      -h | --help)
        usage
        exit 0
        ;;
      -v | --version)
        version
        exit 0
        ;;
      -c | --codefresh-template)
        codefresh_template="$value"
        shift
        ;;
      -s | --services)
        shift
        while [ "$1" != "" ]; do
          local param="$1"
          if [ "${param::1}" == '-' ]; then
            break
          fi
          services+=("$param")
          shift
        done
        ;;
      *)
        if [ "${param::1}" == '-' ]; then
          echo "ERROR: unknown parameter \"$param\""
          usage
          exit 1
        fi
        ;;
    esac
    shift
  done

  assert_required_params "$codefresh_template"
  for service_name in "${services[@]}"; do
    echo "$service_name"
    ensure-project "$service_name" || continue
    if [ ! -f "$PROJECT_DIR/$service_name/codefresh.yml" ]; then
      copy_template "$service_name" "$codefresh_template"
      push_changes "$service_name"
    else
      err_echo "$service_name already has a codefresh.yml"
    fi
  done
}

main "$@"
