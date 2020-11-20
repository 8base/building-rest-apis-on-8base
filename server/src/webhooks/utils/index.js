/**
 * Webhook response objects require a statusCode attribute to be specified.
 * A response body can get specified as a stringified JSON object and any
 * custom headers set.
 */
export const responseBuilder = (code = 200, data = {}, headers = {}) => {
  if (code >= 400) {
    // Build the error response
    const err = {
      headers,
      statusCude: code,
      errors: data.errors,
      timestamp: new Date().toJSON()
    }

    // Console out the detailed error message
    console.log(err)

    // Return the err
    return err
  }

  return {
    headers,
    statusCode: code,
    body: JSON.stringify(data)
  }
}
