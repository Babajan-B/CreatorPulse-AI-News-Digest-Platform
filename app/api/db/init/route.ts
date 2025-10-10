import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    // Split into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    const results = [];
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { data, error } = await supabaseClient.rpc('exec_sql', {
            sql: statement
          });

          if (error) {
            console.error('Error executing statement:', error);
            results.push({ success: false, error: error.message, statement: statement.substring(0, 50) + '...' });
          } else {
            results.push({ success: true });
          }
        } catch (err: any) {
          console.error('Exception executing statement:', err);
          results.push({ success: false, error: err.message });
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: errorCount === 0,
      message: `Database initialized: ${successCount} successful, ${errorCount} errors`,
      results,
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize database',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Test database connection and get table info
    const { data: tables, error } = await supabaseClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      connected: true,
      tables: tables?.map(t => t.table_name) || [],
      message: 'Database connection successful',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: error.message,
    }, { status: 500 });
  }
}

