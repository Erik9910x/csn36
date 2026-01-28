
async function testRegister() {
    const username = 'testuser_' + Date.now();
    const password = 'password123';

    console.log('Registering user:', username);

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Registration Response:', JSON.stringify(data, null, 2));

        if (data.userId) {
            // Now log in to check balance
            const loginResp = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const loginData = await loginResp.json();
            console.log('Login Response Balance:', loginData.user?.balance);

            if (loginData.user?.balance === 10000000) {
                console.log('SUCCESS: New user has 10M balance.');
            } else {
                console.log('FAILURE: New user has ' + loginData.user?.balance);
            }
        }
    } catch (e) {
        console.log('Connection failed - likely server not running at localhost:3000');
    }
}

testRegister();
