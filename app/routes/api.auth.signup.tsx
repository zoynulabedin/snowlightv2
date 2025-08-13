import { json, type ActionFunctionArgs } from '@remix-run/node';
import { createUser, createSession } from '~/lib/auth';
import { db } from '~/lib/db';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (!email || !username || !password) {
      return json({ error: 'Email, username, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      }, { status: 409 });
    }

    const user = await createUser({
      email,
      username,
      password,
      name: name || undefined,
    });

    const token = await createSession(user.id);

    return json(
      { 
        success: true, 
        user,
        message: 'Account created successfully' 
      },
      {
        headers: {
          'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
        },
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

