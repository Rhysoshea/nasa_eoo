#!/usr/bin/env python3

import MySQLdb as sql
import pandas as pd
from sgp4.api import Satrec
from sgp4.api import SGP4_ERRORS
import math
from sql_info import sql_credentials

STD_GRV_PARAM = 3.986004418*10**14 # standard gravitational parameter for earth (mu)
DAY_SECONDS = 24*3600 #seconds in a day
PI = math.pi 

host, user, password, db = sql_credentials


class Satellite:

    def __init__(self, n, e):
        self.n = n # mean motion (revolutions per day)
        self.e = e # eccentricity
        self.a = None # semi major axis length
        self.r_a = None # apogee length from centre of Earth
        self.r_p = None # perigee length from centre of Earth
        self.p = None # period of satellite
        self.__calc_a__()
        self.__calc_apsis__()
        self.__calc_p__()

    def __calc_a__(self):
        self.a = (STD_GRV_PARAM/(self.n*2*PI/(DAY_SECONDS)) ** 2) ** (1/3)

    def __calc_apsis__(self):
        self.r_p = self.a*(1-self.e)  # perigee radius
        self.r_a = self.a*(1+self.e)  # apogee radius

    def __calc_p__(self):
        self.p = 1440/self.n

    def __print__(self):
        print (f"Mean motion {self.n} revs/day")
        print (f"Eccentricity {self.e}")
        print (f"Semi major axis {self.a/1000} km")
        print (f"Apogee {self.r_a/1000} km")
        print (f"Perigee {self.r_p/1000} km")
        print (f"Period {self.p} minutes")


def fetch_sql(sat_num):

    conn = sql.connect(host=host,
                       user=user,
                       password=password,
                       database=db)

    c = conn.cursor()

    sql_fetch = """SELECT name, inclination, eccentricity, perigree, motion 
                    FROM latest_data
                    WHERE sat_num = %s 
                    ORDER BY epoch DESC
                    LIMIT 1
                    """

    vals = [sat_num]

    response = c.execute(sql_fetch, vals)
    conn.commit()
    conn.close()

    print (response)



n = 15.49453790
e = 0.0002606

sat = Satellite(n, e)
sat.__print__()

if __name__ == "__main__":
    
    sat_num = 25544
    n, e = fetch_sql(sat_num)
    # sat = Satellite(n, e)
