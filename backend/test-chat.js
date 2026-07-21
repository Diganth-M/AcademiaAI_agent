async function testChat() {
    try {
        const username = 'testchat' + Date.now();
        await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: username + '@example.com',
                password: 'password123'
            })
        });

        const loginRes = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Logged in");

        const res = await fetch('http://localhost:8080/api/chat', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'java'
            })
        });
        const data = await res.json();
        console.log("Chat response:", data);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testChat();
