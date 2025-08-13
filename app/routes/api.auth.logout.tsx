import { json, type ActionFunctionArgs } from '@remix-run/node';
import { deleteSession } from '~/lib/auth';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const cookieHeader = request.headers.get('Cookie');
    const token = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (token) {
      await deleteSession(token);
    }

    return json(
      { success: true, message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
        },
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

