 #!/usr/bin/env python3

import requests
import json
import MySQLdb as sql
import pandas as pd
from sql_info import sql_credentials

host, user, password, db = sql_credentials

def updatesql(sat):

    conn = sql.connect(host = host,
                        user = user,
                        password = password,
                        database = db)
    
    c = conn.cursor()

    for i in [sat.name, sat.sat_num, sat.international_des, sat.epoch, sat.ballistic, sat.drag, sat.inclination, sat.ascending, sat.eccentricity, sat.perigree, sat.anomaly, sat.motion, sat.rev_num]:
        print (i, type(i))

    # exit()
    sql_insert = "INSERT INTO latest_data (name, sat_num, international_des, epoch, ballistic, drag_term, inclination, ascending_node, eccentricity, perigree, anomaly, motion, rev_num) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    
    vals = [sat.name, sat.sat_num, sat.international_des, sat.epoch, sat.ballistic, sat.drag, sat.inclination, sat.ascending, sat.eccentricity, sat.perigree, sat.anomaly, sat.motion, sat.rev_num]

    # vals = ["'sat1'", "'123'", "'as12'", "'323 4343:2323'", 0.002, 0.0004, 12.123, 41.123, 0.01, 123.123, 123.123, 123.123456, 12345]
    
    c.execute(sql_insert, vals)
    conn.commit()
    conn.close()

    print("Updated")

class Satellite:
    def __init__(self, snum):
        self.sat_num = snum #satellite number
        self.name = None  # common name of satellite
        self.international_des = None #international designator  (launch year, nth launch of year, object of launch) 
        self.epoch = None #epoch date and julian date fraction
        self.ballistic = None #1st derivative of mean motion / ballistic coefficient
        self.drag = None #drag term / radiation pressure coefficient
        self.inclination = None #inclination between equator and orbit plane (degrees)
        self.ascending = None #right ascension of ascending node (degrees)
        self.eccentricity = None #shape of orbit (0=circular, <1 = elliptical), add leading decimal to provided value
        self.perigree = None #angle between ascending node and orbit's closest approache to earth (perigree aka periapsis) (degrees)
        self.anomaly = None #angle measured from perigree, of the satellite location in the orbit referenced to a circular orbit with radius equal to semi-major axis
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
        print (f"Perigree: {self.perigree}")
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

def fetchall():
    sat_id = 25544
    url = f"https://data.ivanstanojevic.me/api/tle/{sat_id}"
    headers = {"user-agent": "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
    response = requests.get( url, headers=headers)
    sat = Satellite(str(sat_id))
    for line in (response.text.split(",")):
        print (line)
        if line.split(":")[0] == '"name"':
            sat.name = line.split(":")[1]
        elif line.split(":")[0] == '"line1"': 
            # obj_dict = {1: sat.international_des,
            #             2: sat.epoch,
            #             3: sat.ballistic,
            #             5: sat.drag
            #             }\
            tle = [x for x in line.split(":")[1].split(' ') if x != ""]
            for i, num in enumerate(tle):
                # if i in obj_dict:
                #     obj_dict[i] = num
                #     print (sat.international_des)
                if i == 2: sat.international_des = str(num) 
                elif i == 3: sat.epoch = str(num) 
                elif i == 4: sat.ballistic = float(num) 
                elif i == 6: sat.drag = convert_drag(num)


        elif line.split(":")[0] == '"line2"':
            # obj_dict = {1: sat.inclination,
            #             2: sat.ascending,
            #             3: sat.eccentricity,
            #             4: sat.perigree,
            #             5: sat.anomaly,
            #             6: sat.motion,
            #             7: sat.rev_num
            #             }
            # print(line.split(":")[1].split(' '))
            tle=[x for x in line.split(":")[1].split(' ') if x != ""]

            for i, num in enumerate(tle):
                # if i in obj_dict:
                #     obj_dict[i] = num
                if i ==2 : sat.inclination = float(num) 
                elif i == 3: sat.ascending = float(num) 
                elif i == 4: sat.eccentricity =  float(f"0.{num}")
                elif i == 5: sat.perigree = float(num) 
                elif i == 6: sat.anomaly = float(num) 
                elif i == 7: 
                    sat.motion = float(num[:11]) 
                    sat.rev_num = int(num[10:15])

    # sat.print_attributes()
    # print(sat.motion)
    # print(sat.rev_num)
    # exit()

    updatesql(sat)

# def check():
#     db = sqlite3.connect('aircraft.db')
#     table = pd.read_sql_query("select * from live", db)
#     table.to_csv("live.csv")
    
if __name__ == "__main__":
    fetchall()
    # check()
    
