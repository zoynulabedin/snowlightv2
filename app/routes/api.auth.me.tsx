import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { validateSession } from '~/lib/auth';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookieHeader = request.headers.get('Cookie');
    const token = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return json({ user: null }, { status: 401 });
    }

    const user = await validateSession(token);
    
    if (!user) {
      return json({ user: null }, { status: 401 });
    }

    return json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    return json({ user: null }, { status: 500 });
  }
}

