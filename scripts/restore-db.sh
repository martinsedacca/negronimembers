#!/bin/bash

# =============================================================================
# RESTORE SCRIPT FOR SUPABASE LOCAL DATABASE
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No backup file specified${NC}"
    echo -e "${YELLOW}Usage: ./restore-db.sh <backup_file>${NC}"
    echo -e "${YELLOW}Example: ./restore-db.sh backups/backup_20241104_142000.sql${NC}"
    echo ""
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh ./backups/backup_*.sql 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${RED}⚠️  WARNING: This will ERASE all current data!${NC}"
echo -e "${YELLOW}Backup file: $BACKUP_FILE${NC}"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    exit 0
fi

echo -e "${YELLOW}🔄 Restoring database from backup...${NC}"

# Restore the database
docker exec -i supabase_db_membership-cards psql -U postgres -d postgres < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
else
    echo -e "${RED}❌ Restore failed!${NC}"
    exit 1
fi
