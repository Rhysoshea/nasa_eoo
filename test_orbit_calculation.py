 #!/usr/bin/env python3
'''
script for unit testing orbit_calculation.py
'''

import unittest 
from orbit_calculation import *

class TestSQLResponse(unittest.TestCase):

    def setUp(self):
        self.x = fetch_sql(SAT_NUM)

    def tearDown(self):
        self.x = None 

    def checkLength(self): # check that 5 values are returned from SQL database
        self.assertEquals(len(self.x) == 5)

    def checkName(self): # check if name is a string
        self.assertTrue(isinstance(self.x[0], basestring))



class TestOrbitValues(unittest.TestCase):

    def setUp(self):
        pass 

    def tearDown(self):
        pass 

    def testEccentricity(self):
        pass 

    def testPerigeeApogee(self):
        pass 

    def testPeriod(self):
        pass

    def 


if __name__=="__main__":
    unittest.main()