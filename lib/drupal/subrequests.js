// https://github.com/yann-yinn/d8-subrequests
function parseResponse(responseBody) {
  const boundary = responseBody.split('\n')[0].trim()
  const responses = responseBody.split(boundary).filter(v => v !== "" && v !== '--').map(v => {
    var [headers, content] = v.split('\r\n\r\n');
    headers = headers.split('\r\n').filter(h => !!h).reduce((headers, line) => {
      const [key, value] = line.split(':');
      return { ...headers, [key]: value.trim() };
    }, {});
    return { headers, ...JSON.parse(content) }
  })
  return responses
}

module.exports.interceptor = (response) => {
  if (response.status == 207) {
    try {
      response.data = parseResponse(response.data);
    } catch(err) {
      console.log('Error parsing subrequest', err)
    }
  }
  return response;
}
