import { json, type ActionFunctionArgs } from '@remix-run/node';
import { authenticateUser, createSession } from '~/lib/auth';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createSession(user.id);

    return json(
      { 
        success: true, 
        user,
        message: 'Login successful' 
      },
      {
        headers: {
          'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

