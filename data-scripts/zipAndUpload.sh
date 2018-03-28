#!/usr/bin/env bash

# a script which copies import scripts to the json dir, zips the json directory and then scp's it 
# to dest_url
# The following variables should be set by editing this script before running it:
# The json dir
json_dir="./json"
# The install scripts
import_scripts="import*.sh"
unzip_script="unzip-import.sh"
# The destination. if not just a machine name then stirng as per scp e.g.
#user@machine:/target/dir  where user@ & /target/dir are optional as the user running the script
# will be used & that user's home dir is the default.
# Make sure in advance that you can ssh to desturl as destuser.
# destuser - if left blank then as current user
destuser=""
desturl=""
destdir="~/"

scpvar=$destuser@$desturl:$destdir

zip_fn="json.tgz"

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
	copyscripts
        targzip
        scptgz
	exit 0
}

check_arguments() {

	if [ "x$json_dir" = "x" ]; then
		error_exit "Please set the variable json_dir before running this script. Exiting with error."
	fi

	if [ "x$desturl" = "x" ]; then
		error_exit "Please set the variable desturl before running this script. Exiting with error."
	fi

}

copyscripts(){
echo "copying scripts to = "$json_dir;
cp -vf $import_scripts $json_dir
}

targzip() { 
echo "Tar and zipping json folder"
tar zcvf $zip_fn $json_dir
}

scptgz() { 
echo "Transferring to new machine using $scpvar"
scp $zip_fn $scpvar
scp $unzip_script $scpvar
}

# Ensures that only a single instance is running at any time
LOCKFILE="./instance.lock"

(
        flock -n 200 || error_exit "Another backup script is already running. Exiting with error."
        trap "rm $LOCKFILE" EXIT
        main
) 200> $LOCKFILE
