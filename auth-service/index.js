const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Auth Service Running');
});

app.listen(3001, () => console.log('Auth running'));