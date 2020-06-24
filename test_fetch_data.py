#!/usr/bin/env python3
'''
script for unit testing fetch_data.py
'''
import requests
import unittest 
from fetch_data import *


class TestOrbitValues(unittest.TestCase):


        def testURL(self):
            #test url is working for all satellites
            SAT_DICT = pd.read_csv("./satellites.csv")
            for s in range(len(SAT_DICT)):
                sat_num = SAT_DICT["sat_num"][s]
               
                url = f"https://data.ivanstanojevic.me/api/tle/{sat_num}"
                headers = {"user-agent": "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
                response = requests.get( url, headers=headers)
               
                self.assertEquals(response.status_code, 200)

        def testAttributes(self):
            # check types of all attributes
                SAT_DICT = pd.read_csv("./satellites.csv")

                for s in range(len(SAT_DICT)):
                    sat = fetchall(SAT_DICT["sat_num"][s], SAT_DICT["description"][s])
                    self.assertIsInstance(sat.name, str)
                    self.assertIsInstance(sat.sat_num, str)
                    self.assertIsInstance(sat.international_des, str)
                    self.assertIsInstance(sat.epoch, str)
                    self.assertIsInstance(sat.ballistic, float)
                    self.assertIsInstance(sat.drag, float)
                    self.assertIsInstance(sat.inclination, float)
                    self.assertIsInstance(sat.ascending, float)
                    self.assertIsInstance(sat.eccentricity, float)
                    self.assertIsInstance(sat.perigee, float)
                    self.assertIsInstance(sat.anomaly, float)
                    self.assertIsInstance(sat.motion, float)
                    self.assertIsInstance(sat.rev_num, int)

            # attrs = vars(self.sat)
            # print(', '.join("%s: %s" % item for item in attrs.items()))


if __name__ == "__main__":
    unittest.main()
