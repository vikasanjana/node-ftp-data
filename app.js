const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const { Client } = require("basic-ftp");
const app = express();
app.use(express.json());

app.get('/', (req, res) => { res.send('Hello World!') });

app.post("/ftp/download", async (req, res) => {
    const { host, user, password, filePath, port, secure } = req.body;

    // Validation for required parameters
    if (!host || !user || !password || !filePath) {
        return res.status(400).json({
            error: "Missing required parameters: 'host', 'user', 'password', 'filePath'."
        });
    }
    const client = new Client();
    client.ftp.verbose = true; // Enables detailed logging
    try {
        await client.access({
            host: host, // Same host as in FileZilla
            user: user,          // Your username
            password: password,       // Your password
            secure: secure ? "implicit" : "explicit",            // Use implicit FTP over TLS
            secureOptions: {
                rejectUnauthorized: false  // Ignore self-signed certificates
            },
            port: port
        });


        await client.downloadTo('temfile.csv', filePath);

        const jsonData = await convertCsvToJson('temfile.csv');
        res.status(200).json(jsonData);

    } catch (err) {
        console.error("FTP Connection Error:", err);
    } finally {
        client.close();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Function to convert CSV to JSON
const convertCsvToJson = async (filePath = 'temfile.csv') => {
    return new Promise((resolve, reject) => {
        const jsonData = [];

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return reject(new Error("File not found."));
        }

        // Read and parse the CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                jsonData.push(row);
            })
            .on("end", () => {
                resolve(jsonData);
            })
            .on("error", (err) => {
                reject(err);
            });
    });
};
