const http = require('http');

const postData = JSON.stringify({
    type: 'textToUI',
    platform: 'web',
    style: 'modern',
    prompt: 'Simple login form with username and password'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-ui',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing UI Generation API...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('Success:', response.success);
            console.log('Demo Mode:', response.isDemoMode);
            if (response.data) {
                console.log('Image length:', response.data.image.length);
                console.log('Code length:', response.data.code.length);
                console.log('First 200 chars of code:', response.data.code.substring(0, 200));
            }
            if (response.error) {
                console.log('Error:', response.error);
            }
        } catch (e) {
            console.log('Response parsing error:', e.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.write(postData);
req.end();