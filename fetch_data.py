 #!/usr/bin/env python3

import requests
import json
import MySQLdb as sql
import pandas as pd
from sql_info import sql_credentials

host, user, password, db = sql_credentials

SAT_DICT = pd.read_csv("./satellites.csv")


def updatesql(sat):

    conn = sql.connect(host = host,
                        user = user,
                        password = password,
                        database = db)
    
    c = conn.cursor()

    sql_insert = """INSERT INTO latest_data 
                    (name, sat_num, international_des, epoch, ballistic, drag_term, inclination, ascending_node, eccentricity, perigree, anomaly, motion, rev_num, description) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
    
    vals = [sat.name, sat.sat_num, sat.international_des, sat.epoch, sat.ballistic, sat.drag, sat.inclination, sat.ascending, sat.eccentricity, sat.perigee, sat.anomaly, sat.motion, sat.rev_num, sat.description]

    c.execute(sql_insert, vals)
    conn.commit()
    conn.close()

    print("Updated")

class Satellite:
    def __init__(self, snum, desc):
        self.sat_num = snum #satellite number
        self.description = desc #description of satellite purpose/objective
        self.name = None  # common name of satellite
        self.international_des = None #international designator  (launch year, nth launch of year, object of launch) 
        self.epoch = None #epoch date and julian date fraction
        self.ballistic = None #1st derivative of mean motion / ballistic coefficient
        self.drag = None #drag term / radiation pressure coefficient
        self.inclination = None #inclination between equator and orbit plane (degrees)
        self.ascending = None #right ascension of ascending node (degrees)
        self.eccentricity = None #shape of orbit (0=circular, <1 = elliptical), add leading decimal to provided value
        self.perigee = None #angle between ascending node and orbit's closest approache to earth (perigee aka periapsis) (degrees)
        self.anomaly = None #angle measured from perigee, of the satellite location in the orbit referenced to a circular orbit with radius equal to semi-major axis
        self.motion = None #mean number of orbits per day (provided as xx.dddddddd)
        self.rev_num = None #orbit number at epoch time

    def print_attributes(self):
        print (f"Sat num:  {self.sat_num}")
        print (f"Name: {self.name}")
        print (f"International designator: {self.international_des}")
        print (f"Epoch: {self.epoch}")
        print (f"Ballistic: {self.epoch}")
        print (f"Drag: {self.drag}")
        print (f"Inclination: {self.inclination}")
        print (f"Ascending: {self.ascending}")
        print (f"Eccentricity: {self.eccentricity}")
        print (f"Perigee: {self.perigee}")
        print (f"Anomaly: {self.anomaly}")
        print (f"Motion: {self.motion}")
        print (f"Revolutions: {self.rev_num}")

def convert_drag(num):
    negative = False 
    if num[0] == "-":
        negative = True 
        num = num[1:]
    output = float(f"0.{num.split('-')[0]}")
    output = output/(10**(int(num.split('-')[1])))
    if negative:
        output *= -1
    return output

def fetchall(sat_num, desc):
    
    url = f"https://data.ivanstanojevic.me/api/tle/{sat_num}"
    headers = {"user-agent": "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
    response = requests.get( url, headers=headers)
    sat = Satellite(str(sat_num), desc)
    for line in (response.text.split(",")):
        if line.split(":")[0] == '"name"':
            sat.name = line.split(":")[1]
        elif line.split(":")[0] == '"line1"': 

            tle = [x for x in line.split(":")[1].split(' ') if x != ""]
            for i, num in enumerate(tle):

                if i == 2: sat.international_des = str(num) 
                elif i == 3: sat.epoch = str(num) 
                elif i == 4: sat.ballistic = float(num) 
                elif i == 6: sat.drag = convert_drag(num)


        elif line.split(":")[0] == '"line2"':

            tle=[x for x in line.split(":")[1].split(' ') if x != ""]

            for i, num in enumerate(tle):

                if i ==2 : sat.inclination = float(num) 
                elif i == 3: sat.ascending = float(num) 
                elif i == 4: sat.eccentricity =  float(f"0.{num}")
                elif i == 5: sat.perigee = float(num) 
                elif i == 6: sat.anomaly = float(num) 
                elif i == 7: 
                    sat.motion = float(num[:11]) 
                    sat.rev_num = int(num[10:15])

    # sat.print_attributes()

    return sat 

def sat_fetch():
    
    for s in range(len(SAT_DICT)):
        sat = fetchall(SAT_DICT["sat_num"][s], SAT_DICT["description"][s])
        updatesql(sat)
    
if __name__ == "__main__":
    sat_fetch()
    
