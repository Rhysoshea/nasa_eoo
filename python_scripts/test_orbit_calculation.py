 #!/usr/bin/env python3
'''
script for unit testing orbit_calculation.py
'''

import unittest 
from orbit_calculation import *

EARTH_R = 6.371*10**6


class TestOrbitValues(unittest.TestCase):

    def setUp(self):
        name, inclination, e, perigee, n = fetch_sql(SAT_NUM)
        self.sat = Satellite(name, inclination, e, perigee, n)

    def tearDown(self):
        self.sat = None

    def testCheckName(self):
        # check if name is a string
        self.assertIsInstance(self.sat.name, str)

    def testEccentricity(self): 
        #test eccentricity is not negative
        self.assertGreaterEqual(self.sat.e, 0)

    def testPerigeeApogee(self): 
        #test apogee and perigee larger than earth radius 
        #test apogee equal to or greater than perigee
        self.assertGreater(self.sat.r_a, EARTH_R)
        self.assertGreater(self.sat.r_p, EARTH_R)
        self.assertGreaterEqual(self.sat.r_a, self.sat.r_p) 

    def testInclination(self):
        # test inclination between 0 and 180 degrees
        self.assertTrue(self.sat.inclination>= 0 and self.sat.inclination <= 180)

    


if __name__== "__main__":
    unittest.main()
