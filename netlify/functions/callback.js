// Step 2 of the GitHub OAuth handshake for the /admin CMS login.
// GitHub redirects here with a ?code=... after the user approves access.
// We exchange that code for an access token server-side (so the client
// secret never reaches the browser), then hand the token to the Decap
// CMS popup via the postMessage handshake it expects.
const https = require('https');

function exchangeCodeForToken(code, clientId, clientSecret) {
  const payload = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function renderHandshakePage(message, content) {
  return `<!DOCTYPE html>
<html><body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:${message}:${JSON.stringify(content)}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;
}

exports.handler = async (event) => {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!code) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: renderHandshakePage('error', { message: 'Missing code from GitHub.' }),
    };
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code, clientId, clientSecret);

    if (tokenResponse.error) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'text/html' },
        body: renderHandshakePage('error', tokenResponse),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: renderHandshakePage('success', {
        token: tokenResponse.access_token,
        provider: 'github',
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: renderHandshakePage('error', { message: err.message }),
    };
  }
};
