docker build -t pgshard .
docker run --name pgshard1 -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 pgshard
docker run --name pgshard2 -d -e POSTGRES_PASSWORD=postgres -p 5433:5432 pgshard
docker run --name pgshard3 -d -e POSTGRES_PASSWORD=postgres -p 5434:5432 pgshard