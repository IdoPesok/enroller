To run, first install docker and Visual Studio Code. Add the docker plugin to visual studio code. 

Using the docker plugin, right click ont he docker-compose.yml file and perform a "Compose Up".
Then in the docker tab, attach a shell. 
log in to the database "mysql -uroot -p" enter "password"
run the following command: "create database test;"
exit out of the shell. 
Navigate to api directory
npm install
copy the ormconfig.json.example to ormconfig.json
npm run serve
In another terminal navigate to the webapp directory
npm install
npm run serve
Navigate to localhost:8080 see if the application is running. 
