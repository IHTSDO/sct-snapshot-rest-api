#!/usr/bin/env bash

# a script which copies import scripts to the json dir, zips the json directory and then scp's it 
# to dest_url
# The following variables should be set by editing this script before running it:
# The json dir
json_dir="./json"
# The import script
import_script="import.sh"
# The tgz file name
zip_fn="json.tgz"
# The edition e.g. au-edition
edition=""
#The import date e.g. 20150531
importDate=""

# Prints a message to stdout with the current date and time.
echo_date() {
	echo -e "[`date +\"%Y-%m-%d %H:%M:%S\"`] $@"
}

# Prints an error message to stderr and exits the script with a non-zero status.
error_exit() {
	echo -e "[`date +\"%Y-%m-%d %H:%M:%S\"`] $@" >&2
	exit 1
}

# Main script starts here.
main() {
	echo_date "----------------------------"
        check_arguments
	untargzip
        importmongo
	exit 0
}

check_arguments() {

	if [ "x$edition" = "x" ]; then
		error_exit "Please set the variable edition before running this script. Exiting with error."
	fi

	if [ "x$importDate" = "x" ]; then
		error_exit "Please set the variable importDate before running this script. Exiting with error."
	fi

}

untargzip() { 
echo "untar and unzipping json folder"
tar -zxvf $zip_fn
}

importmongo() { 
echo "Importing into mongo with  $scpvar"
$json_dir/$import_script $edition $importDate
}

# Ensures that only a single instance is running at any time
LOCKFILE="./instance.lock"

(
        flock -n 200 || error_exit "Another backup script is already running. Exiting with error."
        trap "rm $LOCKFILE" EXIT
        main
) 200> $LOCKFILE
