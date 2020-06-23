#!/usr/bin/env python3

import MySQLdb as sql
import pandas as pd
from sgp4.api import Satrec
from sgp4.api import SGP4_ERRORS
import math


# a, semi major axis
# mm, mean motion revolutions / day

mu = 3.986004418*10**14 #standard gravitational parameter for earth
mm = 15.49453790
e = 0.0002606

# convert mean motion to rad/s
# calculate semi-major axis in m
a = mu**(1/3) / (mm*2*math.pi / 86400)**(2/3) 


print (a)

r_p = a*(1-e) # perigee radius
r_a = a*(1+e) #apogee radius

print (f"Perigee {r_p} Apogee {r_a}")
