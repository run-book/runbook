export const ref = {
  "dev:environment": {
    "ngtest:database": {},
    "leo:service": { "domain": "dev.leo", "port": 80 },
    "npx:service": { "domain": "dev.npx", "port": 80 },
    "gittag": "dev"
  },
  "test:environment": {
    "ngtest:database": {},
    "leo:service": { "domain": "test.leo", "port": 80 },
    "npx:service": { "domain": "test.npx", "port": 80 },
    "gittag": "test"
  },
  "prod:environment": {
    "ngprod:database": {},
    "leo:service": { "domain": "prod.leo", "port": 80 },
    "npx:service": { "domain": "prod.npx", "port": 80 },
    "gittag": "prod"
  },
  "ngprod:database": { "url": "ngprod.url", "type": "oracle" },
  "ngtest:database": { "url": "ngtest.url", "type": "oracle" },
  "leo:service":      {"git": {"url": "leo.git.url"}, "summary": "CRUD for vehicle orders"},
  "npx:service":      {"git": {"url": "npx.git.url"}, "summary": "Invoice generation"}

}


