import { NextRequest, NextResponse } from 'next/server';

// PostgreSQL 클라이언트 설정
async function connectToDatabase() {
  try {
    // 서버 사이드에서만 pg 모듈 동적 import
    const { Pool } = await import('pg');
    
    // Vercel 배포 시에는 POSTGRES_URL 사용, 로컬에서는 개별 환경 변수 사용
    const pool = process.env.POSTGRES_URL 
      ? new Pool({
          connectionString: process.env.POSTGRES_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        })
      : new Pool({
          host: process.env.POSTGRES_HOST || 'postgres',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          database: process.env.POSTGRES_DATABASE || 'studio_dev',
          user: process.env.POSTGRES_USER || 'studio_user',
          password: process.env.POSTGRES_PASSWORD || 'studio_password',
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
      SELECT id, name, icon, color, description, created_at, updated_at 
      FROM tasks 
      ORDER BY created_at DESC
    `);
    
    await pool.end();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, color, description } = body;
    
    if (!name || !icon || !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const pool = await connectToDatabase();
    
    const result = await pool.query(`
      INSERT INTO tasks (name, icon, color, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, icon, color, description, created_at, updated_at
    `, [name, icon, color, description || null]);
    
    await pool.end();
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, icon, color, description } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    const pool = await connectToDatabase();
    
    // 업데이트할 필드만 동적으로 구성
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (icon !== undefined) {
      updateFields.push(`icon = $${paramIndex++}`);
      values.push(icon);
    }
    if (color !== undefined) {
      updateFields.push(`color = $${paramIndex++}`);
      values.push(color);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    
    updateFields.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, icon, color, description, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    await pool.end();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
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
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    const pool = await connectToDatabase();
    
    // 먼저 관련된 posts 삭제
    await pool.query('DELETE FROM posts WHERE task_id = $1', [id]);
    
    // 그 다음 task 삭제
    const result = await pool.query(`
      DELETE FROM tasks 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    await pool.end();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}