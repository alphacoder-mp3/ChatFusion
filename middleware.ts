import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
}

export function middleware(request: NextRequest) {
  console.log('test');
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { error: 'Missing authentication token' },
      { status: 401 }
    );
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    const response = NextResponse.next();
    response.headers.set('X-USER-ID', (decoded as DecodedToken).userId);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/chat/:path*'],
};
