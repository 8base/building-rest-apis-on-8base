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
    // Run mutation with supplied data
    const { userDelete } = await ctx.api.gqlRequest(MUTATION, { id })
    // Success response
    return responseBuilder(200, { result: userDelete })
  } catch ({ response: { errors } }) {
    // Failure response
    return responseBuilder(400, { errors })
  }
}
