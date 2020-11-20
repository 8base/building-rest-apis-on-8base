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
