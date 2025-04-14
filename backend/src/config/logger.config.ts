import { config } from 'dotenv';
import path from 'path';

// Načtení proměnných prostředí
config({ path: path.join(__dirname, '../../.env') });

export const loggerConfig = {
  // Úroveň logování podle prostředí
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // Cesty k logovacím souborům
  errorLogPath: path.join(__dirname, '../../logs/error.log'),
  combinedLogPath: path.join(__dirname, '../../logs/combined.log'),
  
  // Maximální velikost logovacího souboru (10MB)
  maxSize: 10 * 1024 * 1024,
  
  // Maximální počet logovacích souborů
  maxFiles: 5,
  
  // Formátování data v logu
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
}; 