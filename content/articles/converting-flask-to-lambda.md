+++
title = 'Converting Flask to Lambda'
date = 2024-08-25T11:27:05-07:00
draft = false
tags = ['other']
+++

I’ve worked out how to convert a local Flask app to AWS Lambda without having to involve extra modules, vendors, or middleware.
## Introduction
Moving products from a prototype to a deployment can be tricky. In particular, I find myself writing small Flask apps for every little problem, and trying to deploy them to Lambda involves putting an entire layer of abstraction on top of them.

Surveying the landscape, there seems to be one model of providing a developer a CLI tool that builds and deploys the entire project:
- https://www.serverless.com/blog/flask-serverless-api-in-aws-lambda-the-easy-way
- https://hacksaw.co.za/blog/flask-on-aws-serverless-a-learning-journey-part-1/
- https://dev.to/divporter/deploying-a-flask-app-to-aws-lambda-5em0

There’s another model of rewriting the web layer of your app:
- https://pypi.org/project/flask-lambda/
- https://www.cloudtechsimplified.com/run-python-flask-in-aws-lambda/

And there’s a final model of a magic middleware layer that you can throw in with a bit of Terraform:
- https://github.com/awslabs/aws-lambda-web-adapter

I don’t really like any of these options. For enterprise deployment, the products like Serverless and Zappa cost money. Alternative Python modules that require a web layer rewrite cease to function for local development unless you run the containerized Lambda simulator, which then requires additional software (namely Docker) on the desktop. And the magic middleware layer is a really nice option, but because it’s an AWS Labs product instead of a GA product, enterprise deployment with it is difficult.

## AWS Lambda Architecture

A basic Lambda app has a few different components. Requests come in via an API Gateway or an Application Load Balancer. They’re then processed by the Lambda. Depending on the app, there might be backend calls to a database.

The reason there’s a couple layers to this architecture is because Lambda doesn’t natively use HTTP. Lambda is designed to ingest JSON, so we need to add something in front of it to convert the HTTP to a pure JSON payload.

## JSON Payload Model

The key to this conversion is understanding how an HTTP request flows from the API Gateway to the Lambda.

A Lambda requires a handler function that ingests two variables, `event` and `context`. In the Python context, `event` is a dictionary that contains all the keys we would normally use Flask to scrape from the web request:

```
event.keys()

requestContext
httpMethod
path
queryStringParameters
headers
body
isBase64Encoded
```

## Using event to route traffic

Using the `path` key along with `match`, a newer Python feature, we can easily route traffic:

```
def lambda_handler(event, context):

	request_path = event[path]
	response = ‘’ # initializing the variable

	match request_path.lower(): # make sure the string is normalized
		case ‘/‘:
			response = index()
		case ‘/some_other_web_page’:
			Response = some_other_function()
		case _: # underscore is the catch-all default case
			return {‘statusCode’: 404}

	return {
		‘statusCode’: 200,
		‘body’: json.dumps(response)
	}
```

But wait! This is just rewriting the web layer, isn’t it?

## Integrating with an existing Flask app

It might be, except for the fact that there’s a good way to *abstract* the old Flask app in a way that preserves all the excellent templating built into it.

Let’s take a basic Flask app:

```
from flask import (
	blueprint,
	render_template,
	jsonify,
	response,
	request
)

web_app = Blueprint(‘web_app’, __name__)

@web_app.route(“/“)
def index() -> Response:
	return render_template(
		‘index.html’,
		title=“My Web App”,
	)

@web_app.route(“/some_other_route”)
def some_other_route() -> Response:
	input = request.args.get(‘param_name’)
	# TODO: Logic generating some output

	return jsonify(output)
```

We have 2 endpoints. There’s a basic index page attached to `/`, and a more complex `/some_other_route` that does some logic and returns a pure JSON response.

For the conversion, I want to move from this file to 3 separate files:

### web_functions.py
```
from flask import (
	render_template,
	jsonify,
	response
)

def index() -> Response:
	return render_template(
		‘index.html’,
		title=“My Web App”,
	)

def some_other_route(input_data) -> Response:
	# TODO: Logic generating some output

	return jsonify(output)
```

### flask_routes.py
```
import web_functions

from flask import (
	blueprint,
	response,
	request
)

web_app = blueprint(‘web_app’, __name__)

@web_app.route(“/“)
def index() -> Response:
	return web_functions.index()

@web_app.route(“/some_other_route”)
def some_other_route() -> Response:
	input = request.args.get(‘param_name’)
	return web_functions.some_other_route(input)
```

All we’re doing here is separating the Flask web functions (defining routes, dealing with input arguments, defining the web app) from the actual logic of the functions.

### lambda_routes.py
```
import json
import web_functions

from Flask import Response

def lambda_handler(event, context) -> Response:

	request_path = event[path]
	

	match request_path.lower():
		case “/“:
			return web_functions.index()

		case “/some_other_route”:
			input = event[‘queryStringParameters’][’param_name’]
			return web_functions.some_other_route(input)

		case _:
			return {‘statusCode’: 404}
```

Let's examine how this works for a minute.

If we want to develop this application locally, we just need to run it like a normal Flask app. Requests come through `flask_routes.py` and then get sent to `web_functions.py`. 

And if we then deploy this code to AWS, the request will come through an Application Load Balancer or API Gateway to `lambda_routes.py`. The code in `lambda_routes.py` will then call `web_functions.py`.

## Conclusion

So what did we do here? 

We took a standard Flask app and abstracted it just a little bit. We separated the code the parses inputs and sends outputs from the code that does the request processing. This small change means that we can do our local web development in mostly native Flask. And we can also deploy this code directly to AWS Lambda and have it work natively.

We've created two doors that lead to the same room with minimal extra complexity, allowing us to have the best of both worlds for developing and deploying Flask apps.