        function setupEarthBuffers() {
            // splits Earth into 60 lat and long bands, can increase for greater detail
            var latitudeBands = 60; 
            var longitudeBands = 60;
            var radius = 5;
            var vertexPositionData = [];
            var normalData = [];
            var textureCoordData = [];

            for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                var theta = latNumber*Math.PI / latitudeBands;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);
                for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                    var phi = longNumber*2*Math.PI / longitudeBands;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);
                    var x = cosPhi * sinTheta;
                    var y = cosTheta;
                    var z = sinPhi * sinTheta;
                    var u = 1 - (longNumber / longitudeBands);
                    var v = 1 - (latNumber / latitudeBands);
                    normalData.push(x);
                    normalData.push(y);
                    normalData.push(z);
                    textureCoordData.push(u);
                    textureCoordData.push(v);
                    vertexPositionData.push(radius * x);
                    vertexPositionData.push(radius * y);
                    vertexPositionData.push(radius * z);
                }
            }

        }