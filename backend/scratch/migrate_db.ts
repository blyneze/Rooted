import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const DUMP_FILE_PATH = path.join(__dirname, 'rooted_data_dump.json');

// Ordered from independent to dependent tables
const TABLES_IN_ORDER = [
  { name: 'User', clientKey: 'user' },
  { name: 'Series', clientKey: 'series' },
  { name: 'Topic', clientKey: 'topic' },
  { name: 'AudioMessage', clientKey: 'audioMessage' },
  { name: 'VideoMessage', clientKey: 'videoMessage' },
  { name: 'Book', clientKey: 'book' },
  { name: 'FeaturedSection', clientKey: 'featuredSection' },
  { name: 'SeriesMessage', clientKey: 'seriesMessage' },
  { name: 'FeaturedSectionItem', clientKey: 'featuredSectionItem' },
  { name: 'MessageTopic', clientKey: 'messageTopic' },
  { name: 'Playlist', clientKey: 'playlist' },
  { name: 'PlaylistItem', clientKey: 'playlistItem' },
  { name: 'SavedItem', clientKey: 'savedItem' },
  { name: 'PlaybackProgress', clientKey: 'playbackProgress' },
  { name: 'PlaybackRecord', clientKey: 'playbackRecord' },
  { name: 'Download', clientKey: 'download' },
  { name: 'UserPreference', clientKey: 'userPreference' },
  { name: 'BibleNote', clientKey: 'bibleNote' },
  { name: 'BibleHighlight', clientKey: 'bibleHighlight' },
  { name: 'BibleBookmark', clientKey: 'bibleBookmark' },
  { name: 'Notification', clientKey: 'notification' },
] as const;

async function runExport() {
  const localUrl = process.env.DATABASE_URL || "postgresql://postgres:Blossomthedev@localhost:5432/rooted?schema=public";
  console.log(`\n=== STEP 1: EXPORTING DATA FROM LOCAL DATABASE ===`);
  console.log(`Connecting to local database: ${localUrl.replace(/:[^:@]+@/, ':****@')}`);
  
  const prisma = new PrismaClient({
    datasources: { db: { url: localUrl } }
  });

  try {
    const dumpData: Record<string, any[]> = {};
    let totalRecords = 0;

    for (const table of TABLES_IN_ORDER) {
      console.log(`Reading table: ${table.name}...`);
      const client = prisma[table.clientKey] as any;
      const records = await client.findMany();
      dumpData[table.clientKey] = records;
      console.log(`  Found ${records.length} records.`);
      totalRecords += records.length;
    }

    fs.writeFileSync(DUMP_FILE_PATH, JSON.stringify(dumpData, null, 2), 'utf-8');
    console.log(`\nSUCCESS: Export completed successfully!`);
    console.log(`Saved ${totalRecords} total records in ${DUMP_FILE_PATH}`);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function runImport(targetUrl: string) {
  console.log(`\n=== STEP 2: IMPORTING DATA TO REMOTE DATABASE ===`);
  if (!targetUrl) {
    console.error('ERROR: You must provide the target Render database URL.');
    console.log('Usage: npx ts-node scratch/migrate_db.ts import <TARGET_DATABASE_URL>');
    process.exit(1);
  }
  
  console.log(`Connecting to remote database: ${targetUrl.replace(/:[^:@]+@/, ':****@')}`);

  if (!fs.existsSync(DUMP_FILE_PATH)) {
    console.error(`ERROR: Dump file not found at ${DUMP_FILE_PATH}. Run 'export' first!`);
    process.exit(1);
  }

  // Sync schema first using Prisma db push
  try {
    console.log('Synchronizing remote database schema with local schema.prisma...');
    execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: targetUrl },
      stdio: 'inherit'
    });
    console.log('Remote database schema updated successfully.');
  } catch (pushError) {
    console.error('Failed to sync remote database schema:', pushError);
    process.exit(1);
  }

  const dumpData = JSON.parse(fs.readFileSync(DUMP_FILE_PATH, 'utf-8'));
  const prisma = new PrismaClient({
    datasources: { db: { url: targetUrl } }
  });

  try {
    // 1. Clean existing records in reverse dependency order to prevent foreign key errors
    console.log('\nClearing existing remote data in reverse dependency order...');
    const reversedTables = [...TABLES_IN_ORDER].reverse();
    for (const table of reversedTables) {
      const client = prisma[table.clientKey] as any;
      console.log(`  Clearing table: ${table.name}...`);
      await client.deleteMany({});
    }
    console.log('Remote database cleared successfully.');

    // 2. Import records in forward dependency order to preserve UUIDs and relations
    console.log('\nImporting records in forward dependency order...');
    for (const table of TABLES_IN_ORDER) {
      const records = dumpData[table.clientKey] || [];
      console.log(`  Importing ${records.length} records into table: ${table.name}...`);
      
      if (records.length === 0) continue;

      const client = prisma[table.clientKey] as any;
      
      // We insert records in chunks or one-by-one to ensure graceful error handling and retain specific date parsing
      for (const record of records) {
        // Convert ISO string dates back to Date objects
        const parsedRecord = { ...record };
        for (const [key, value] of Object.entries(parsedRecord)) {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            parsedRecord[key] = new Date(value);
          }
        }
        
        await client.create({ data: parsedRecord });
      }
      console.log(`    Successfully imported ${records.length} records.`);
    }

    console.log(`\nSUCCESS: Migration to Render database completed successfully! 🎉`);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'export') {
    await runExport();
  } else if (command === 'import') {
    const targetUrl = args[1];
    await runImport(targetUrl);
  } else {
    console.log('Rooted Data Migration Tool');
    console.log('==========================');
    console.log('Usage:');
    console.log('  Export local data:  npx ts-node scratch/migrate_db.ts export');
    console.log('  Import to remote:   npx ts-node scratch/migrate_db.ts import <TARGET_DATABASE_URL>');
  }
}

main();
