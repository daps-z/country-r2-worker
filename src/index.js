const ALLOW_LIST = ['sg.jpg'];

// Check requests for a pre-shared secret
const hasValidHeader = (request, env) => {
  return request.headers.get('X-Custom-Auth-Key') === env.AUTH_KEY_SECRET;
};

function authorizeRequest(request, env, key) {
  switch (request.method) {
    case 'PUT':
    case 'DELETE':
      return hasValidHeader(request, env);
    case 'GET':
      return ALLOW_LIST.includes(key);
    default:
      return false;
  }
}


export default {
	async fetch(request, env) {
	  const url = new URL(request.url);
	  const key = url.pathname.slice(1);
	  const tes = "sg.jpg"
      if (!authorizeRequest(request, env, tes)) {
		return new Response('Forbidden', { status: 403 });
	  }

	  switch (request.method) {
		case 'PUT':
		  await env.MY_BUCKET.put(key, request.body);
		  return new Response(`Put ${key} successfully!`);
		case 'GET':
		  const object = await env.MY_BUCKET.get(tes);
  
		  if (object === null) {
			return new Response('Object Not Found', { status: 404 });
		  }
  
		  const headers = new Headers();
		  object.writeHttpMetadata(headers);
		  headers.set('etag', object.httpEtag);
  
		  return new Response(object.body, {
			headers,
		  });
		case 'DELETE':
		  await env.MY_BUCKET.delete(key);
		  return new Response('Deleted!');
  
		default:
		  return new Response('Method Not Allowed', {
			status: 405,
			headers: {
			  Allow: 'PUT, GET, DELETE',
			},
		  });
	  }
	},
  };