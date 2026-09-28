// Step 1 of the GitHub OAuth handshake for the /admin CMS login.
// Decap CMS opens a popup to this function; we bounce it straight to
// GitHub's own authorize screen.
exports.handler = async (event) => {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const host = event.headers['x-forwarded-host'] || event.headers.host;
  const redirectUri = `${proto}://${host}/.netlify/functions/callback`;
  const scope = 'repo,user';

  const authorizeUrl =
    'https://github.com/login/oauth/authorize' +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return {
    statusCode: 302,
    headers: { Location: authorizeUrl },
    body: '',
  };
};
