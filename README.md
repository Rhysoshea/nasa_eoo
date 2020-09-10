## Purpose of Repository:
Visualise Earth-orbiting objects from NASA TLE (Two Line Element) data


## Functionality
- downloadable Docker container to run on local host
- visualise a 3D Earth and path of orbiting satellite (not necessarily at real-time current position)
- drop-down menu to select which satellite is displayed

## Completed
- create MySQL database in a docker container
- fetch and parse scripts written in Python to update database periodically
- JavaScript with React for user interface and display 3D Earth

## To-do
- get satellite orbit path to display using webgl

## System Structure

Using docker-compose, the application spins up 3 docker containers as microservices. Each container manages the following functionality:
- Application and front-end, using nodeJS container (JavaScript and React)
- Data fetching using NASA API and parsing / calculating required information for plotting correct orbits
- Data storage using SQL relational database, as the data remains structured 

## Additional information and resources

Built on Ubuntu system with Python 3.8 and NodeJS 12
Start application using `docker-compose up` on the command line, with Docker and Docker Compose installed

Celestrak columns for using TLE data
https://celestrak.com/columns/v01n06/
http://www.afahc.ro/ro/afases/2016/MATH&IT/CROITORU_OANCEA.pdf
https://www.math.ubc.ca/~cass/courses/m309-01a/hunter/satelliteOrbits.html#:~:text=The%20semi%2Dmajor%20axis%20has,along%20the%20semi%2Dmajor%20axis.
http://www.dept.aoe.vt.edu/~lutze/AOE2104/9orbitalmechanics.pdf

a = semi-major axis
e = eccentricity (in TLE)
i = inclination (in TLE)
ω = argument of periapsis (in TLE)
Ω = longitude of ascending node
v_o = true anomaly at epoch (in TLE)
t_o = time at epoch (in TLE)
T = time at periapsis passage
Π = longitude at periapsis

Π = Ω + ω 

u_o = argument of latitude at epoch
u_o = ω + v_o

l_o = true longitude at epoch
l_o = Ω + ω + v_o = Π + v_o = Ω + u_o

p = semi-latus rectum

