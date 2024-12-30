const express = require("express");
const { Client } = require("basic-ftp");
const app = express();
app.use(express.json());

app.get('/', (req, res) => {  res.send('Hello World!') });

app.post("/ftp/download", async (req, res) => {
    const { host, user, password, filePath, port, secure } = req.body;

    // Validation for required parameters
    if (!host || !user || !password || !filePath) {
        return res.status(400).json({
            error: "Missing required parameters: 'host', 'user', 'password', 'filePath'."
        });
    }

    const client = new Client();
    client.ftp.verbose = true; // Enable detailed logging for debugging

    try {
        await client.access({
            host,
            user,
            password,
            secure: secure || false, // Default to false if not provided
            port: port || 21, // Default FTP port is 21
            secureOptions: {
                rejectUnauthorized: false
            }
        });

        console.log("Connected to the FTP server!");

        const files = await client.list();
        const fileExists = files.some(file => file.name === filePath);

        if (!fileExists) {
            return res.status(404).json({
                error: `File '${filePath}' not found on the server.`
            });
        }

        const writable = [];
        await client.downloadTo(Buffer.concat(writable), filePath);

        const fileData = Buffer.concat(writable).toString();

        return res.status(200).json({
            message: "File downloaded successfully.",
            data: fileData
        });
    } catch (err) {
        console.error("FTP Connection Error:", err);
        return res.status(500).json({
            error: "An error occurred while connecting to the FTP server.",
            details: err.message
        });
    } finally {
        client.close();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
