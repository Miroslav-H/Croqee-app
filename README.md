# Croqee-app
A very cool app that helps drawing/illustration artists to achieve great skills
bla bla

- For Local development: Start the app, cd to server folder and run "npm run dev".
it should start both client and express server.

- For development using Docker containers: on a docker installed machine, run "docker-compose up" on root folder.


-To run Docker Production image: Run "docker-compose -f docker-compose.prod.yml up".

Note: if you wanna switch back from docker development to local development, you have to change the proxy in client/package.json from "http://server:8080" to "http://localhost:8080" and run the local development step.

## Python integration
 - Installing the dependencies:<br/>
     $ sudo apt-get install python2.7<br/>
     $ sudo apt-get install python-opencv<br/>
     $ sudo apt-get install python-pip<br/>
     $ sudo pip install numpy scipy<br/>
     $ sudo pip install Pillow<br/>
     $ sudo pip install zerorpc<br/>
     $ sudo python -m pip install -U pip<br/>
     $ sudo python -m pip install -U matplotlib<br/>
 - After you've install the required dependencies run the following code in the "server_python" directory (Note that it should run before running the node server, as in our node is instantly sending request to the python as the client-side renders):
    $ python server.py<br/>

 