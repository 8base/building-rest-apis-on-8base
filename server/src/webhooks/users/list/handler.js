import gql from 'graphql-tag'
import { responseBuilder } from '../../utils'

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
