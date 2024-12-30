const { Client } = require("basic-ftp");

async function example() {
    const client = new Client();
    client.ftp.verbose = true; // Enables detailed logging
    try {
        await client.access({
            host: "ftps.maevnuniforms.com", // Same host as in FileZilla
            user: "SCOE41GA-001",          // Your username
            password: "6w_F163oguC",       // Your password
            secure:"implicit",            // Use implicit FTP over TLS
            secureOptions: {
                rejectUnauthorized: false  // Ignore self-signed certificates
            },
            port:990
        });
        console.log("Connected to the FTP server!");
        console.log(await client.list()); // List files in the directory
    } catch (err) {
        console.error("FTP Connection Error:", err);
    } finally {
        client.close();
    }
}

example();
