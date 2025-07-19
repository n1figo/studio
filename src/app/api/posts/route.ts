import { NextRequest, NextResponse } from 'next/server';

// PostgreSQL 클라이언트 설정
async function connectToDatabase() {
  try {
    const { Pool } = await import('pg');
    
    const pool = new Pool({
      host: 'postgres',
      port: 5432,
      database: 'studio_dev',
      user: 'studio_user',
      password: 'studio_password',
    });

    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const pool = await connectToDatabase();
    
    const result = await pool.query(`
      SELECT id, task_id, title, content, created_at 
      FROM posts 
      ORDER BY created_at DESC
    `);
    
    await pool.end();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, title, content } = body;
    
    if (!task_id || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const pool = await connectToDatabase();
    
    const result = await pool.query(`
      INSERT INTO posts (task_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING id, task_id, title, content, created_at
    `, [task_id, title, content]);
    
    await pool.end();
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    const pool = await connectToDatabase();
    
    const result = await pool.query(`
      DELETE FROM posts 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    await pool.end();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}