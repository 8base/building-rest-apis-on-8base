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
  try {
    // Run mutation with supplied data
    const { userCreate } = await ctx.api.gqlRequest(MUTATION, {
      data: event.data
    })
    // Success response
    return responseBuilder(200, { result: userCreate })
  } catch ({ response: { errors } }) {
    // Failure response
    return responseBuilder(400, { errors })
  }
}
