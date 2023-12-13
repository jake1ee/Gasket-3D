// JavaScript Document
var canvas;
var gl;

var NumTimesToSubdivide = 3, scaleNum = 1.5;
var spdNum = 3, animCount = 1, secCount = 1;
var loop = false, flag1 = false, large = false;

var points = [], colors = [], theta = [0, 0, 0], move = [0, 0, 0], start_but, stop_but;
var baseColors, color1, color2, color3, color4, subdivision_slide, speed_slide, vertices, customize;
var hexadecimal = [255/255, 53/255, 97/255, 0/255, 236/255, 255/255, 55/255, 60/255, 103/255, 0/255, 0/255, 0/255];


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var texture, texCoordLoc, texCoordsArray = [];
var texCoord = 
[
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
	color1 = document.getElementById("color1");
	color2 = document.getElementById("color2");
	color3 = document.getElementById("color3");
	color4 = document.getElementById("color4");
	subdivision_slide = document.getElementById("subdivision");
	speed_slide = document.getElementById("speed");
	start_but = document.getElementById("start");
	stop_but = document.getElementById("stop");
	if(customize){window.cancelAnimationFrame(customize);}


	
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {alert("WebGL isn't available");}

	 //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the vertices of our 3D gasket
    // Four vertices on unit circle
    // Intial tetrahedron with equal length sides

	var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];

    divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
	var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
	
	texCoordLoc = gl.getUniformLocation(program, "texture");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	projectionMatrix = ortho(-6, 6, -3.5, 3.5, 5, -5); // left, right, bottom, top, near, far
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

/*------------------------------------------------------------------------------------------------*/ 
	
	color1.onchange = function()
	{
		hexadecimal[0] = ("0x" + ((color1.value).toString()).substring(1, 3)) / 255;
		hexadecimal[1] = ("0x" + ((color1.value).toString()).substring(3, 5)) / 255;
		hexadecimal[2] = ("0x" + ((color1.value).toString()).substring(5, 7)) / 255;
		colors = []; points = []; init();
		
	};
	
	color2.onchange = function()
	{
		hexadecimal[3] = ("0x" + ((color2.value).toString()).substring(1, 3)) / 255;
		hexadecimal[4] = ("0x" + ((color2.value).toString()).substring(3, 5)) / 255;
		hexadecimal[5] = ("0x" + ((color2.value).toString()).substring(5, 7)) / 255;
		colors = []; points = []; init();
	};
	
	color3.onchange = function()
	{
		hexadecimal[6] = ("0x" + ((color3.value).toString()).substring(1, 3)) / 255;
		hexadecimal[7] = ("0x" + ((color3.value).toString()).substring(3, 5)) / 255;
		hexadecimal[8] = ("0x" + ((color3.value).toString()).substring(5, 7)) / 255;
		colors = []; points = []; init();
	};
	
	color4.onchange = function()
	{
		hexadecimal[9] = ("0x" + ((color4.value).toString()).substring(1, 3)) / 255;
		hexadecimal[10] = ("0x" + ((color4.value).toString()).substring(3, 5)) / 255;
		hexadecimal[11] = ("0x" + ((color4.value).toString()).substring(5, 7)) / 255;
		colors = []; points = []; init();
	};
	
	subdivision_slide.onchange = function(event) 
	{
		NumTimesToSubdivide = event.srcElement.value;
		document.getElementById("subText2").innerHTML = NumTimesToSubdivide;
		colors = []; points = []; init();
    };
	
	speed_slide.onchange = function(event) 
	{
		spdNum = parseFloat(event.srcElement.value);
		document.getElementById("subText3").innerHTML = (spdNum) + "x";
    };
	
	start_but.onclick = function()
	{
		flag1 = true;
		loop = true;
	};

	stop_but.onclick = function()
	{
		theta = [0, 0, 0];
		move = [0, 0, 0];
		scaleNum = 1.5;
		animCount = 1;
		secCount = 1;
		loop = false;
		flag1 = false;
	};
	

    render();
};

function isPowerOf2(value) 
{
  return (value & (value - 1)) == 0;
}

function configureTexture(image) 
{
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	if (isPowerOf2(image.width) && isPowerOf2(image.height)) 
	{
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } 
	
	else 
	{
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}

function animationStart()
{
	var count = (spdNum / 150);	
	switch(animCount)
	{		
		case 1: //Rotate 180 left
			theta[2] += spdNum;
			if(theta[2] > 180)
			{
				theta[2] = 180;
				animCount++;
			}
			break;
				
		case 2: //Rotate 180 right
			theta[2] -= spdNum;
			if(theta[2] < -180)
			{
				theta[2] = -180;
				animCount ++;
			}
			break;

		case 3: //Rotate back to origin
		theta[2] += spdNum;
			if(theta[2] > 0)
			{
				theta[2] = 0;
				animCount = 1;
				flag1 = false; 
			}
			break;
	} // end switch
}

function setColor(hexadecimal)
{
	baseColors = 
	[
        vec3(hexadecimal[0], hexadecimal[1], hexadecimal[2]),
        vec3(hexadecimal[3], hexadecimal[4], hexadecimal[5]),
        vec3(hexadecimal[6], hexadecimal[7], hexadecimal[8]),
        vec3(hexadecimal[9], hexadecimal[10], hexadecimal[11]),
    ];
}

function triangle(a, b, c, color)
{
    // add colors and vertices for one triangle

	setColor(hexadecimal);
    colors.push(baseColors[color]);
    points.push(a);
	texCoordsArray.push(texCoord[0]);
    colors.push(baseColors[color]);
    points.push(b);
	texCoordsArray.push(texCoord[1]);
    colors.push(baseColors[color]);
    points.push(c);
	texCoordsArray.push(texCoord[2]);
}

function tetra(a, b, c, d)
{
    // tetrahedron with each side using a different color

    triangle(a, c, b, 0);
    triangle(a, c, d, 1);
    triangle(a, b, d, 2);
    triangle(b, c, d, 3);
}

function divideTetra(a, b, c, d, count)
{
    // check for end of recursion
    if (count === 0) {tetra(a, b, c, d);}
    
	// find midpoints of sides
    // divide four smaller tetrahedra
	
	else 
	{
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var ad = mix(a, d, 0.5);
        var bc = mix(b, c, 0.5);
        var bd = mix(b, d, 0.5);
        var cd = mix(c, d, 0.5);

        --count;

        divideTetra( a, ab, ac, ad, count);
        divideTetra(ab,  b, bc, bd, count);
        divideTetra(ac, bc,  c, cd, count);
        divideTetra(ad, bd, cd,  d, count);
    }
}

function update()
{
	points = [];
    divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
}

function disableBtn()
{
	color1.disabled = true;
	color2.disabled = true;
	color3.disabled = true;
	color4.disabled = true;
	subdivision_slide.disabled = true;
	start_but.disabled = true;
}

function enableBtn()
{
	color1.disabled = false;
	color2.disabled = false;
	color3.disabled = false;
	color4.disabled = false;
	subdivision_slide.disabled = false;
	start_but.disabled = false;
}

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if(loop)
	{
		disableBtn();
		if(flag1)
		{
			animationStart(); 
		}
		else if(!flag1)
		{
				switch(secCount)
			{
				case 1: 
					if(scaleNum < 4 && !large) {scaleNum += 0.05; move[1] -= 0.015;}
					else{large = true; secCount++;}
					break;
				case 2:
					if(scaleNum > 1.5 && large) {scaleNum -= 0.05; move[1] += 0.015;}
					else{large = false; secCount = 1; flag1 = true}
					break;
			}
		}
	}
	else if(!loop )
	{
		enableBtn();
	}
	
	modelViewMatrix = mat4();
	modelViewMatrix = translate(move[0], move[1], move[2]);
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[0], [1, 0, 0]));		// adjust roation at x-axis
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[1], [0, 1, 0]));		// adjust roation at y-axis
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[2], [0, 0, 1])); 		// adjust roation at z-axis
	modelViewMatrix = mult(modelViewMatrix, scalem(scaleNum, scaleNum, scaleNum)); 	// adjust the scaling
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(texCoordLoc, 0);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
	customize = window.requestAnimationFrame(render);
}