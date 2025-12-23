import sqlite3
import os

# Define the path for the database file
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app.db")

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Allows accessing columns by name
    return conn

def init_db():
    """Initializes the database with necessary tables."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Geocode Cache Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS geocode_cache (
            address TEXT PRIMARY KEY,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized at: {DB_PATH}")

# Run initialization when this file is imported (or called explicitly)
if __name__ == "__main__":
    init_db()