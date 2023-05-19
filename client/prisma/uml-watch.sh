#!/bin/sh

input_file="$1"

while true; do
    echo "Watching file $input_file for changes..."
    inotifywait -e modify "$input_file"
    echo "File $input_file has been modified. Generating PlantUML output..."
    # Replace the command below with the actual command to generate PlantUML output
    plantuml -tsvg "$input_file"
done
