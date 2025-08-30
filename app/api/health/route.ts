import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Check database connection
    let dbStatus = 'unhealthy'
    let dbLatency = 0
    
    try {
      const supabase = await createClient()
      const dbStart = Date.now()
      
      // Simple query to check database
      const { error } = await supabase
        .from('members')
        .select('auth_id')
        .limit(1)
      
      dbLatency = Date.now() - dbStart
      dbStatus = error ? 'unhealthy' : 'healthy'
    } catch (err) {
      console.error('Database health check failed:', err)
      dbStatus = 'unhealthy'
    }
    
    // Calculate total response time
    const totalLatency = Date.now() - startTime
    
    // Determine overall health
    const isHealthy = dbStatus === 'healthy'
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`
        },
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      },
      responseTime: `${totalLatency}ms`
    }
    
    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': isHealthy ? 'pass' : 'fail'
      }
    })
    
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'fail'
        }
      }
    )
  }
}