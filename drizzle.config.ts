import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DB_URL;

if (!connectionString || connectionString === "") {
    throw new Error("Connection string env variable is not set")
}

export default defineConfig({
    schema: "src/db/schema.ts",
    out: "src/db/",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionString
    },
});



