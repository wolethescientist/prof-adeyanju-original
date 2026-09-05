# Postgres image for the CMS.
#
# Pinned to 17 to match the major version Neon runs, so a dump taken from the
# Neon preview restores into this container without a version jump.
FROM postgres:17-alpine

# pgcrypto gives us gen_random_uuid() for primary keys.
COPY init/ /docker-entrypoint-initdb.d/

# Uploaded images are stored as bytea rows, so allow a larger-than-default
# working memory for the media queries.
CMD ["postgres", "-c", "max_wal_size=2GB", "-c", "work_mem=16MB"]
