#!/bin/bash

# =============================================================================
# BACKUP SCRIPT FOR SUPABASE LOCAL DATABASE
# =============================================================================

# Colors
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}🔄 Starting database backup...${NC}"

# Backup the database
docker exec supabase_db_membership-cards pg_dump -U postgres -d postgres > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup successful!${NC}"
    echo -e "${GREEN}📁 File: $BACKUP_FILE${NC}"
    
    # Show backup size
    SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo -e "${GREEN}📦 Size: $SIZE${NC}"
    
    # Keep only last 7 backups
    echo -e "${YELLOW}🧹 Cleaning old backups...${NC}"
    ls -t "$BACKUP_DIR"/backup_*.sql | tail -n +8 | xargs -r rm
    echo -e "${GREEN}✅ Kept last 7 backups${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi
