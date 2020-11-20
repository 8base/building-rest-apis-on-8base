# How to Develop a REST API on an 8base Workspace

By default, the 8base platform auto-generates an extremely powerful GraphQL API that gives you immediate API access to your data. Sometimes though, developers are using a 3rd party service or other tool that doesn't easily support the authoring and execution of GraphQL queries. Instead, they require that a REST API (or discrete endpoints) be available.

Developing a REST API in 8base can easily be accomplished using the [Webhook custom function](https://docs.8base.com/docs/8base-console/custom-functions/webhooks/) type. Using Webhooks, a developer can quickly code and deploy serverless functions that become available using traditional HTTP verbs (GET, POST, PUT, DELETE, etc.) and a unique path.

## Getting Started Building a REST API on 8base

To get started building a REST API on top of an 8base workspace, you're going to need to have the following resources created/installed.

1. An 8base Workspace (Free tier or Paid Plan)
2. 8base CLI installed ([Instructions available here](https://docs.8base.com/docs/development-tools/cli/))
3. A Text Editor or IDE (VS Code, Atom, Sublime, or any other way to write code)

Once all those things are ready, go ahead and open the command line and use the following commands to generate a new 8base server-side project.

```sh
# If not authenticated, login via the CLI
$ 8base login

# Generate a new 8base project and select your desired workspace
$ 8base init rest-api-tutorial

# Move into the new directory
$ cd rest-api-tutorial
```

That's it!

## Generating the Serverless Functions for your REST API

Let's go ahead and generate all of our serverless functions. We can do this pretty quickly using the [8base CLI's generator commands](https://docs.8base.com/docs/development-tools/cli/generators). Using the generators, we'll be able to create each one of our functions for each endpoint of our REST API.

```sh
# Our Index records endpoint
8base generate webhook getUsers --method=GET --path='/users' --syntax=js

# Our create record endpoint
8base generate webhook newUser --method=POST --path='/users' --syntax=js

# Our get record endpoint
8base generate webhook getUser --method=GET --path='/users/{id}' --syntax=js

# Our edit record endpoint
8base generate webhook editUser --method=PUT --path='/users/{id}' --syntax=js

# Our delete record endpoint
8base generate webhook deleteUser --method=DELETE --path='/users/{id}' --syntax=js
```

As you've probably noticed at this point, we're building a REST API that gives access to our 8base workspace's Users table. This is because the Users is created with the workspace by default, thus you don't need to create any new tables for the tutorial. That said, the same pattern we'll cover would work for any other database table you choose to use (or multiple).

Additionally – since we are just building this API for the Users table – it's okay that all these functions are grouped together at the top level of the `src/webhooks` director. If you are building a REST API that is going to deal with lots more tables or more custom endpoints, this directory structure might quickly feel busy/un-organized.

There is nothing stopping you from restructing your directory to better suit your organizational needs! All you need to do is make sure that the function declaration in the `8base.yml` file has a valid path to the function's handler file/script. For example, take a look at the following directory structure and `8base.yml` file:

#### Directory Structure
```sh
src
└── webhooks
    ├── users
    │   ├── create
    │   │   ├── handler.js
    │   │   └── mocks
    │   │       ├── failure.json
    │   │       └── success.json
    │   ├── delete
    │   │   ├── handler.js
    │   │   └── mocks
    │   │       ├── failure.json
    │   │       └── success.json
    │   ├── edit
    │   │   ├── handler.js
    │   │   └── mocks
    │   │       ├── failure.json
    │   │       └── success.json
    │   ├── get
    │   │   ├── handler.js
    │   │   └── mocks
    │   │       ├── failure.json
    │   │       └── success.json
    │   └── list
    │       ├── handler.js
    │       └── mocks
    │           ├── failure.json
    │           └── success.json
    └── utils
        └── index.js
```

#### 8base.yml file

```yaml
functions:
  listUsers:
    type: webhook
    handler:
      code: src/webhooks/users/list/handler.js
    path: /users
    method: GET
  getUser:
    type: webhook
    handler:
      code: src/webhooks/users/get/handler.js
    path: '/users/{id}'
    method: GET
  createUser:
    type: webhook
    handler:
      code: src/webhooks/users/create/handler.js
    path: /users
    method: POST
  editUser:
    type: webhook
    handler:
      code: src/webhooks/users/edit/handler.js
    path: '/users/{id}'
    method: PUT
  deleteUser:
    type: webhook
    handler:
      code: src/webhooks/users/delete/handler.js
    path: '/users/{id}'
    method: DELETE
```

For the sake of simplicity, let stick with the directory structure that was generated for us by the CLI! It's only important to know that such reconfiguration is possible.

## Writing our REST APIs Serverless Functions

Now that we have our serverless functions generated, let's go ahead and start adding some code to them. What's important to know about a Webhook function is that two important objects get passed through to the function via the `event` argument. They are `data` and `pathParameters`.

The `data` argument is where any data sent via a POST or PUT request can get accessed. Meanwhile, any query params or URL params sent via the request become accessible in the `pathParameters` object. Therefore, if a GET request was made to the endpoint `/users/{id}?local=en`, the value for `id` and `local` would both be available via `event.pathParameters[KEY]`.

### GET User endpoint

Knowing this, let's set up the GET User (`/users/{id}`) endpoint! In order to help with our GraphQL queries inside the function, add the GraphQL Tag NPM package using `npm install -s graphql-tag`. Then, go ahead and copy the code below into your *getUser* function's handler file.

```js
/* Bring in any required imports for our function */
import gql from 'graphql-tag'
import { responseBuilder } from '../utils'

/* Declare the Query that gets used for the data fetching */
const QUERY = gql`
  query($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      createdAt
      updatedAt
      avatar {
        downloadUrl
      }
      roles {
        items {
          name
        }
      }
    }
  }
`

module.exports = async (event, ctx) => {
  /* Get the customer ID from Path Parameters */
  let { id } = event.pathParameters
  let { user } = await ctx.api.gqlRequest(QUERY, { id })

  if (!user) {
    return responseBuilder(404, { message: `No record found.`, errors: [] })
  }

  return responseBuilder(200, { result: user })
}
```

You'll likely spot a unrecognized import; `responseBuilder`. Webhook's require that the following keys get declared in returned objects - `statusCode`, `body`, and (optionally) `headers`. Instead of writing out and every single response object explicitly, we can start generating them using a handy `responseBuilder` function.

So let's go ahead and create a new directory and file using the following commands and then place our `responseBuilder` function in there.

```sh
$ mkdir src/webhooks/utils
$ touch src/webhooks/utils/index.js
```

Copy in the following script.

```js
/**
 * Webhook response objects require a statusCode attribute to be specified.
 * A response body can get specified as a stringified JSON object and any
 * custom headers set.
 */
export const responseBuilder = (code = 200, data = {}, headers = {}) => {
  /* If the status code is greater than 400, error! */
  if (code >= 400) {
    /* Build the error response */
    const err = {
      headers,
      statusCude: code,
      body: JSON.stringify({
        errors: data.errors,
        timestamp: new Date().toJSON()
      })
    }

    /* Console out the detailed error message */
    console.log(err)

    /* Return the err */
    return err
  }

  return {
    headers,
    statusCode: code,
    body: JSON.stringify(data)
  }
}
```

Awesome! Almost as if we were building a controller method that runs a SQL query and then returns some serialized data, here were exercising the same pattern but using a serverless function that utilizes the GraphQL API.

As you can imagine, the other functions are likely going to be similar. Let's go ahead and set them all up before we move into testing.

### GET Users endpoint

Let's now set up a way to list all Users via our REST API. Go ahead and copy the code below into your _getUsers_ function's handler file.

```js
import gql from 'graphql-tag'
import { responseBuilder } from '../utils'

const QUERY = gql`
  query {
    usersList {
      count
      items {
        id
        firstName
        lastName
        email
        createdAt
        updatedAt
      }
    }
  }
`
module.exports = async (event, ctx) => {
  /* Get the customer ID from Path Parameters */
  let { usersList } = await ctx.api.gqlRequest(QUERY)

  return responseBuilder(200, { result: usersList })
}
```

### POST User endpoint

Let's now set up a way to add new Users via our REST API. Go ahead and copy the code below into your _newUser_ function's handler file.

```js
import gql from 'graphql-tag'
import { responseBuilder } from '../../utils'

const MUTATION = gql`
  mutation($data: UserCreateInput!) {
    userCreate(data: $data) {
      id
      email
      firstName
      lastName
      updatedAt
      createdAt
    }
  }
`

module.exports = async (event, ctx) => {
  /** 
   * Here we're pulling data out of the request to 
   * pass it as the mutation input
   */
  const { data } = event

  try {
    /* Run mutation with supplied data */
    const { userCreate } = await ctx.api.gqlRequest(MUTATION, { data })

    /* Success response */
    return responseBuilder(200, { result: userCreate })
  } catch ({ response: { errors } }) {

    /* Failure response */
    return responseBuilder(400, { errors })
  }
}
```

### PUT User endpoint

Let's now set up a way to edit Users via our REST API. Go ahead and copy the code below into your _editUser_ function's handler file.

```js
import gql from 'graphql-tag'
import { responseBuilder } from '../../utils'

const MUTATION = gql`
  mutation($data: UserUpdateInput!) {
    userUpdate(data: $data) {
      id
      email
      firstName
      lastName
      updatedAt
      createdAt
    }
  }
`

module.exports = async (event, ctx) => {
  const { id } = event.pathParameters

  /* Combine the pathParameters with the event data */
  const data = Object.assign(event.data, { id })

  try {
    /* Run mutation with supplied data */
    const { userUpdate } = await ctx.api.gqlRequest(MUTATION, { data })

    /* Success response */
    return responseBuilder(200, { result: userUpdate })
  } catch ({ response: { errors } }) {
    /* Failure response */
    return responseBuilder(400, { errors })
  }
}
```

### DELETE User endpoint

Let's now set up a way to edit Users via our REST API. Go ahead and copy the code below into your _deleteUser_ function's handler file.

```js
import gql from 'graphql-tag'
import { responseBuilder } from '../../utils'

const MUTATION = gql`
  mutation($id: ID!) {
    userDelete(data: { id: $id }) {
      success
    }
  }
`

module.exports = async (event, ctx) => {
  const { id } = event.pathParameters

  try {
    /* Run mutation with supplied data */
    const { userDelete } = await ctx.api.gqlRequest(MUTATION, { id })

    /* Success response */
    return responseBuilder(200, { result: userDelete })
  } catch ({ response: { errors } }) {
    /* Failure response */
    return responseBuilder(400, { errors })
  }
}
```

## Testing our REST API locally

Nice work so far! Pretty straightforward, right? What's next is an extremely important step; testing. That is, how do we run these functions locally to make sure they are behaving as expected? 

You may have noticed a directory called `mocks` that is in each of the function's directories. Essentially, mocks allow us to structure a JSON payload that get's passed as the `event` argument to our function when testing locally. **The JSON object that get's declared in a mock file will be the exact same argument passed to the function when testing** - nothing more, nothing less.

That said, let's go ahead and run our *getUsers* function since it ignores the `event` argument. We can do this using the `invoke-local` CLI command, as well as expect a response that looks like the following:

```sh
$ 8base invoke-local listUsers

=> Result:
{
  "headers": {},
  "statusCode": 200,
  "body": "{\"result\":{\"count\":1,\"items\":[{\"id\":\"SOME_USER_ID\",\"firstName\":\"Fred\",\"lastName\":\"Scholl\",\"email\":\"freijd@iud.com\",\"createdAt\":\"2020-11-19T19:26:53.922Z\",\"updatedAt\":\"2020-11-19T19:46:59.775Z\"}]}}"
}
```

Copy the `id` of the first returned user in the response. We're going to use it to create a mock for our *getUser* function. So, now add the following JSON in the `src/webhooks/getUser/mocks/request.json` file.

```json
{
  "pathParameters": {
    "id": "[SOME_USER_ID]"
  }
}
```

With this mock set up, let's go ahead and see if we can successfully use our REST API to get a user by their ID set in the URL params.

```sh
$ 8base invoke-local getUser -m request

=> Result:
{
  "headers": {},
  "statusCode": 200,
  "body": "{\"result\":{\"id\":\"SOME_USER_ID\",\"firstName\":\"Fred\",\"lastName\":\"Scholl\",\"email\":\"freijd@iud.com\",\"createdAt\":\"2020-11-19T19:26:53.922Z\",\"updatedAt\":\"2020-11-19T19:46:59.775Z\",\"avatar\":null,\"roles\":{\"items\":[]}}}"
}
```

Now, what if you want to specify data? Like, when you want to test an update? The exact sample principle applies. We add a `data` key to our mock with the data we expect to be sent to our endpoint. Try it yourself be adding the following JSON in the `src/webhooks/editUser/mocks/request.json` file.

```json
{
  "data": {
    "firstName": "Freddy",
    "lastName": "Scholl",
    "email": "my_new_email@123mail.com"
  },
  "pathParameters": {
    "id": "SOME_USER_ID"
  }
}
```

Lastly, not all API requests are always successful... We added error handling to our functions because of this! Additionally, it would be a real pain to continuously be editing your mock file to first test a `success`, then `failure`, etc.

To help with this, you're able to create as many different mock files as you want and reference them by name! The CLI generator will help you here and place the mock in the appropriate directory. For example:

```sh
# Mock for a valid input for the editUser function
8base generate mock editUser --mockName success

# Mock for a invalid input for the editUser function
8base generate mock editUser --mockName failure
```

When running your tests now, you can use the different mocks to insure that both your error handling and successful responses are being properly returned. All you have to do is reference the mock file you wish to use by name via the `-m` flag.

```sh
# Test a unsuccessful response
8base invoke-local editUser -m failure

=> Result:
{
  headers: {},
  statusCude: 400,
  body: "{\"errors\": [\r\n {\r\n \"message\": \"Record for current filter not found.\",\r\n \"locations\": [],\r\n \"path\": [\r\n \"userUpdate\"\r\n ],\r\n \"code\": \"EntityNotFoundError\",\r\n \"details\": {\r\n \"id\": \"Record for current filter not found.\"\r\n }\r\n }\r\n ],\r\n \"timestamp\": \"2020-11-20T01:33:38.468Z\"\r\n}"
}
```

## Deploying our REST API to 8base

Deployment is going to be the easiest part here. Run `8base deploy`... that's it.

However, you may be asking yourself a burning question at this point, "where do I find my endpoints?" Once everything is done being deployed, go ahead and run `8base describe` in the CLI. You should get something like this back:

```sh
Webhooks:
╔════════════╤═════════════╤════════╤═══════════════════════════════════════════════════════════╗
║ Name       │ Description │ Method │ Path                                                      ║
╟────────────┼─────────────┼────────┼───────────────────────────────────────────────────────────╢
║ listUsers  │             │ GET    │ /ckhgm4hli036p07lbeds0es7e/webhook/users                  ║
╟────────────┼─────────────┼────────┼───────────────────────────────────────────────────────────╢
║ getUser    │             │ GET    │ /ckhgm4hli036p07lbeds0es7e/webhook/users/{id}             ║
╟────────────┼─────────────┼────────┼───────────────────────────────────────────────────────────╢
║ createUser │             │ POST   │ /ckhgm4hli036p07lbeds0es7e/webhook/users                  ║
╟────────────┼─────────────┼────────┼───────────────────────────────────────────────────────────╢
║ editUser   │             │ PUT    │ /ckhgm4hli036p07lbeds0es7e/webhook/users/{id}             ║
╟────────────┼─────────────┼────────┼───────────────────────────────────────────────────────────╢
║ deleteUser │             │ DELETE │ /ckhgm4hli036p07lbeds0es7e/webhook/users/{id}             ║
╚════════════╧═════════════╧════════╧═══════════════════════════════════════════════════════════╝
```

All your endpoints are now available at `https://api.8base.com/{PATH_IN_TABLE_ABOVE}`. 

## Wrap Up

8base is a easy to use and scalable application backend that has an auto-generating GraphQL API. That said, for those developers building applications that require REST API interfaces, I hope this tutorial gave you some useful clues on how such can be accomplished using 8base!

Feel free to reach out with any questions!
