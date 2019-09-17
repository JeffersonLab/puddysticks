# puddysticks
Control panels made easy

A pure web control system display manager with a What You See Is What You Get (WYSIWYG) display builder. Create displays and export them as simple JSON files.  Wire up displays to datasources using a pluggable interface. Built-in datasources include a random number generator and [epics2web](https://github.com/JeffersonLab/epics2web).  This project is the sequel to [WEDM](https://github.com/JeffersonLab/wedm).  

![Figure 1](/doc/img/Figure1.png?raw=true "Figure 1")

## Install
```bash
npm i puddysticks
```
**Note**: This application runs on the Node.js JavaScript runtime, which can be downloaded [here](https://nodejs.org/en/download/).
## Config
Create _.env_ file in project directory with the following environment variable (substituting desired value):
```bash
EPICS2WEB_HOST=localhost 
```
**Note**: epics2web uses Web Sockets, which are not subject to the Same Origin Policy, and therefore can easily be hosted somewhere other than the host for Puddysticks.
## Build
```bash
cd node_modules/puddysticks
npm i
npm run build
```
## Run
```bash
npm start
```
