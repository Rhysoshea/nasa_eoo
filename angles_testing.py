import math

from matplotlib import pyplot as plt


def earthBuffers():
    latitudeBands = 120
    longitudeBands = 120
    radius = 5
    vertexPositionData = []
    normalData = []
    textureCoordData = []

    for latNumber in range(latitudeBands):
        theta = latNumber*math.pi / latitudeBands
        sinTheta = math.sin(theta)
        cosTheta = math.cos(theta)
        for longNumber in range(longitudeBands):
            phi = longNumber*2*math.pi / longitudeBands
            sinPhi = math.sin(phi)
            cosPhi = math.cos(phi)
            x = cosPhi * sinTheta
            y = cosTheta
            z = sinPhi * sinTheta
            u = 1 - (longNumber / longitudeBands)
            v = 1 - (latNumber / latitudeBands)
            normalData.append(x)
            normalData.append(y)
            normalData.append(z)
            textureCoordData.append(u)
            textureCoordData.append(v)
            vertexPositionData.append(radius * x)
            vertexPositionData.append(radius * y)
            vertexPositionData.append(radius * z)

    print (vertexPositionData)
    print (normalData)
    print (textureCoordData)

    plt.plot(range(len(normalData)//3), [x for i,x in enumerate(normalData) if i%3==0])
    plt.plot(range(len(normalData)//3), [x for i,x in enumerate(normalData) if i%3==1])
    plt.plot(range(len(normalData)//3), [x for i,x in enumerate(normalData) if i%3==2])
    plt.show()

    plt.plot(range(len(textureCoordData)//2), [x for i,x in enumerate(textureCoordData) if i%2==0])
    plt.plot(range(len(textureCoordData)//2), [x for i,x in enumerate(textureCoordData) if i%2==1])
    plt.show()

    plt.plot(range(len(vertexPositionData)//3), [x for i,x in enumerate(vertexPositionData) if i%3==0])
    plt.plot(range(len(vertexPositionData)//3), [x for i,x in enumerate(vertexPositionData) if i%3==1])
    plt.plot(range(len(vertexPositionData)//3), [x for i,x in enumerate(vertexPositionData) if i%3==2])
    plt.show()

earthBuffers()