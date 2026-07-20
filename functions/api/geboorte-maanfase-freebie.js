const MAILERLITE_API = 'https://connect.mailerlite.com/api/subscribers';

const GROUPS = [
  '191097591840114346', // Moon Phase Freebie
];

function htmlResponse(body, init = {}) {
  return new Response(body, {
    ...init,
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

function errorPage(title, message, status = 400) {
  return htmlResponse(`<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title} | Sterrenzo</title>
  </head>
  <body>
    <main style="font-family: Inter, system-ui, sans-serif; max-width: 38rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.65; color: #202331;">
      <h1>${title}</h1>
      <p>${message}</p>
      <p><a href="/gratis-geboorte-maanfase-gids/">Terug naar het formulier</a></p>
    </main>
  </body>
</html>`, { status });
}

function redirect(request, location) {
  return Response.redirect(new URL(location, request.url), 303);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function wantsJson(request) {
  const accept = request.headers.get('accept') || '';
  const contentType = request.headers.get('content-type') || '';
  return accept.includes('application/json') || contentType.includes('application/json');
}

async function parseSubmission(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    return {
      email: String(body.email || '').trim().toLowerCase(),
      name: String(body.name || '').trim(),
      source: String(body.source || 'geboorte_maanfase_freebie').trim(),
    };
  }

  const form = await request.formData();
  return {
    email: String(form.get('email') || '').trim().toLowerCase(),
    name: String(form.get('name') || '').trim(),
    source: String(form.get('source') || 'geboorte_maanfase_freebie').trim(),
  };
}

export async function onRequestPost(context) {
  const token = context.env.MAILERLITE_API_TOKEN;
  const useJson = wantsJson(context.request);

  if (!token) {
    if (useJson) {
      return jsonResponse({ success: false, message: 'MailerLite is niet geconfigureerd.' }, { status: 500 });
    }
    return errorPage('Er ging iets mis', 'MailerLite is nog niet geconfigureerd.', 500);
  }

  const { email, name, source } = await parseSubmission(context.request);

  if (!isValidEmail(email)) {
    if (useJson) {
      return jsonResponse({ success: false, message: 'Controleer je e-mailadres en probeer het opnieuw.' }, { status: 400 });
    }
    return errorPage('Controleer je e-mailadres', 'Het e-mailadres lijkt niet geldig. Ga terug en probeer het opnieuw.');
  }

  const fields = {
    source,
  };

  if (name) {
    fields.name = name;
  }

  const mailerliteResponse = await fetch(MAILERLITE_API, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email,
      fields,
      groups: GROUPS,
      status: 'active',
    }),
  });

  if (!mailerliteResponse.ok) {
    const message = await mailerliteResponse.text();
    console.error('MailerLite moon phase subscribe failed', mailerliteResponse.status, message);

    if (useJson) {
      return jsonResponse(
        { success: false, message: 'Aanmelden is niet gelukt. Probeer het over een paar minuten opnieuw.' },
        { status: 502 },
      );
    }

    return errorPage(
      'Er ging iets mis',
      'Het formulier kon geen verbinding maken met het e-mailsysteem. Probeer het over een paar minuten opnieuw.',
      502,
    );
  }

  if (useJson) {
    return jsonResponse({ success: true });
  }

  return redirect(context.request, '/gratis-geboorte-maanfase-gids/bedankt/');
}

export function onRequestGet(context) {
  return redirect(context.request, '/gratis-geboorte-maanfase-gids/');
}
