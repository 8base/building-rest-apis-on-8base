import gql from 'graphql-tag'
import { responseBuilder } from '../../utils'

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
  let { user } = await ctx.api.gqlRequest(QUERY, {
    id: event.pathParameters.id
  })

  if (!user) {
    return responseBuilder(404, { message: `No record found.`, errors: [] })
  }

  return responseBuilder(200, { result: user })
}
