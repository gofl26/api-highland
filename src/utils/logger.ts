import { createLogger, transports, format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}]: ${message}`
    }),
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log', // 로그 파일 이름 형식
      datePattern: 'YYYY-MM-DD', // 로그 파일 분리 기준 (날짜)
      zippedArchive: true, // 오래된 로그를 압축
      maxSize: '20m', // 로그 파일 크기 제한 (20MB)
      maxFiles: '21d', // 로그 보관 기간 (14일)
    }),
  ],
})

export default logger
