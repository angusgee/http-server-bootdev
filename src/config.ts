process.loadEnvFile();

type APIConfig = {
	fileserverHits: number;
    dbURL: string
}

const config:APIConfig = {
    fileserverHits: 0, 
    dbURL: process.env.DB_URL || ""
};

export default config;