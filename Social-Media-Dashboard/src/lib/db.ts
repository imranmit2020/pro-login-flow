import { Pool } from 'pg'

// Create a connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Database helper functions
export const db = {
  async query(text: string, params?: any[]) {
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  },

  // User operations
  async findUserByEmail(email: string) {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0] || null
  },

  async createUser(name: string, email: string, hashedPassword: string) {
    const result = await this.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    )
    return result.rows[0]
  },

  async updateLastLogin(userId: string) {
    await this.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    )
  },

  // Message operations
  async getFacebookMessages(limit: number = 50) {
    const result = await this.query(
      'SELECT * FROM facebook_messages ORDER BY timestamp DESC LIMIT $1',
      [limit]
    )
    return result.rows
  },

  async getInstagramMessages(limit: number = 50) {
    const result = await this.query(
      'SELECT * FROM instagram_messages ORDER BY timestamp DESC LIMIT $1',
      [limit]
    )
    return result.rows
  },

  // Appointments operations
  async getAppointments() {
    const result = await this.query(
      'SELECT * FROM appointments ORDER BY created_at DESC'
    )
    return result.rows
  },

  async createAppointment(data: {
    full_name: string
    phone_number: string
    gender: string
    location: string
    service: string
    preferred_time?: string
  }) {
    const result = await this.query(
      'INSERT INTO appointments (full_name, phone_number, gender, location, service, preferred_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.full_name, data.phone_number, data.gender, data.location, data.service, data.preferred_time]
    )
    return result.rows[0]
  },

  // Tasks operations
  async getTasks() {
    const result = await this.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    )
    return result.rows
  },

  async updateTaskStatus(id: string, status: string) {
    const result = await this.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    return result.rows[0]
  }
}

export default db