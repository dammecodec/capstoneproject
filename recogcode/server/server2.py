from flask import Flask, request, Response,jsonify
import jsonpickle
import numpy as np
import cv2
from PIL import Image as im
host = '10.72.33.62'
port = 2402
app = Flask(__name__)
@app.route('/post', methods = ['POST'])
def receive():
	r = request
	nparr = np.frombuffer(r.data,np.uint8)
	img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
	im1 = im.fromarray(img)
	im1.save(r'D:\MiAI_FaceRecog_2\server\tung1.jpg')
	response = {'message': 'image received. size={}x{}'.format(img.shape[1], img.shape[0])}
	response_pickled = jsonpickle.encode(response)
	"""tmp = True
	"""
	return Response(response=response_pickled, status=200, mimetype="application/json")
@app.route('/abc', methods= ['GET'])
def abc():
	a = 'ok'
	return jsonify(a)
app.run(host,port,debug= True)