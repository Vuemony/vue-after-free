// logger.ts - Structured logging system for Vue-After-Free
// Provides log levels, log history buffer, and log export

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface LogEntry {
  timestamp: number
  level: LogLevel
  message: string
}

// Log history buffer (max 500 entries)
var logger_history: LogEntry[] = []
var logger_maxHistory = 500
var logger_level: LogLevel = 'INFO'

// Level priority for filtering
var logger_levelPriority: Record<string, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

function logger_setLevel (level: LogLevel): void {
  logger_level = level
  log('[LOGGER] Level set to: ' + level)
}

function logger_getLevel (): LogLevel {
  return logger_level
}

function logger_shouldLog (level: LogLevel): boolean {
  return (logger_levelPriority[level] || 0) >= (logger_levelPriority[logger_level] || 0)
}

function logger_addEntry (level: LogLevel, message: string): void {
  const entry: LogEntry = {
    timestamp: Date.now(),
    level: level,
    message: message
  }

  logger_history.push(entry)

  // Trim old entries if over max
  if (logger_history.length > logger_maxHistory) {
    logger_history = logger_history.slice(logger_history.length - logger_maxHistory)
  }

  // Also send to the original log function
  if (logger_shouldLog(level)) {
    const prefix = '[' + level + '] '
    log(prefix + message)
  }
}

function logger_debug (message: string): void {
  logger_addEntry('DEBUG', message)
}

function logger_info (message: string): void {
  logger_addEntry('INFO', message)
}

function logger_warn (message: string): void {
  logger_addEntry('WARN', message)
}

function logger_error (message: string): void {
  logger_addEntry('ERROR', message)
}

function logger_getHistory (): LogEntry[] {
  return logger_history.slice()
}

function logger_getHistoryFiltered (level: LogLevel): LogEntry[] {
  const minPriority = logger_levelPriority[level] || 0
  return logger_history.filter(function (entry) {
    return (logger_levelPriority[entry.level] || 0) >= minPriority
  })
}

function logger_clear (): void {
  logger_history = []
  log('[LOGGER] History cleared')
}

function logger_formatEntry (entry: LogEntry): string {
  const date = new Date(entry.timestamp)
  const time = date.getHours().toString().padStart(2, '0') + ':' +
    date.getMinutes().toString().padStart(2, '0') + ':' +
    date.getSeconds().toString().padStart(2, '0')
  return '[' + time + '] [' + entry.level + '] ' + entry.message
}

function logger_getFormattedHistory (count?: number): string[] {
  const history = logger_history.slice(-(count || 50))
  return history.map(logger_formatEntry)
}

export {
  logger_history,
  logger_setLevel,
  logger_getLevel,
  logger_debug,
  logger_info,
  logger_warn,
  logger_error,
  logger_getHistory,
  logger_getHistoryFiltered,
  logger_clear,
  logger_formatEntry,
  logger_getFormattedHistory
}

