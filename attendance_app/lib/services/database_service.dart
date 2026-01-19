import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'attendance.db');

    return await openDatabase(
      path,
      version: 3, // Incremented to add check_out_status column
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Create attendance_records table
    await db.execute('''
      CREATE TABLE attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        date TEXT NOT NULL,
        check_in_time TEXT,
        check_out_time TEXT,
        status TEXT NOT NULL,
        check_in_status TEXT,
        check_out_status TEXT,
        synced_to_server INTEGER NOT NULL DEFAULT 0,
        qr_code_data TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT
      )
    ''');

    // Create index on employee_id and date for faster queries
    await db.execute('''
      CREATE INDEX idx_employee_date ON attendance_records(employee_id, date)
    ''');

    // Create index on synced_to_server for sync queries
    await db.execute('''
      CREATE INDEX idx_synced ON attendance_records(synced_to_server)
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle database migrations here
    if (oldVersion < 2) {
      // Add check_in_status column for shift timing feature
      try {
        await db.execute('''
          ALTER TABLE attendance_records 
          ADD COLUMN check_in_status TEXT
        ''');
        print('[DatabaseService] Added check_in_status column');
      } catch (e) {
        // Column might already exist, ignore error
        print('[DatabaseService] check_in_status column may already exist: $e');
      }
    }
    if (oldVersion < 3) {
      // Add check_out_status column for check-out timing feature
      try {
        await db.execute('''
          ALTER TABLE attendance_records 
          ADD COLUMN check_out_status TEXT
        ''');
        print('[DatabaseService] Added check_out_status column');
      } catch (e) {
        // Column might already exist, ignore error
        print('[DatabaseService] check_out_status column may already exist: $e');
      }
    }
  }

  // Close database
  Future<void> close() async {
    final db = await database;
    await db.close();
    _database = null;
  }
}
