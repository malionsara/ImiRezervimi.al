#!/usr/bin/env bash
# Local, throwaway Supabase-compatible dev database for filming the showcase.
# Writes scripts/showcase/devdb/.env.showcase with URL + keys for the app and seed script.
set -euo pipefail
cd "$(dirname "$0")"
REPO=$(cd ../../.. && pwd)
JWT_SECRET=${JWT_SECRET:-showcase-local-dev-jwt-secret-not-for-production-0001}
PG_PORT=54329 REST_PORT=54330

docker rm -f showcase-pg showcase-rest >/dev/null 2>&1 || true
docker run -d --name showcase-pg -e POSTGRES_PASSWORD=postgres -p $PG_PORT:5432 postgres:15 >/dev/null
until docker exec showcase-pg pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
sleep 2

psql_run() { docker exec -i showcase-pg psql -U postgres -v ON_ERROR_STOP=0 -q "$@"; }
psql_run < 00_supabase_shim.sql
psql_run < "$REPO/database/schema.sql" 2>&1 | grep -i error || true
for f in "$REPO"/database/00[1-8]_*.sql "$REPO"/database/add-reminder-column.sql "$REPO"/database/fix-priority-function.sql; do
  psql_run < "$f" 2>&1 | grep -i error | sed "s|^|$(basename "$f"): |" || true
done
psql_run < local_overrides.sql
psql_run -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
             GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
             GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;"

docker run -d --name showcase-rest --network host \
  -e PGRST_DB_URI="postgres://authenticator:authenticator@127.0.0.1:$PG_PORT/postgres" \
  -e PGRST_DB_SCHEMAS=public -e PGRST_DB_ANON_ROLE=anon \
  -e PGRST_JWT_SECRET="$JWT_SECRET" -e PGRST_SERVER_PORT=$REST_PORT \
  postgrest/postgrest:v12.2.3 >/dev/null

mint() { node -e '
  const c=require("crypto"),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
  const h=b({alg:"HS256",typ:"JWT"}),p=b({role:process.argv[1],iss:"supabase",iat:1700000000,exp:2000000000});
  console.log(h+"."+p+"."+c.createHmac("sha256",process.argv[2]).update(h+"."+p).digest("base64url"))' "$1" "$JWT_SECRET"; }

cat > .env.showcase <<EOF
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(mint anon)
SUPABASE_SERVICE_ROLE_KEY=$(mint service_role)
SUPABASE_SERVICE_KEY=$(mint service_role)
SHOWCASE_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:$PG_PORT/postgres
EOF
echo "dev db up; env written to scripts/showcase/devdb/.env.showcase"
