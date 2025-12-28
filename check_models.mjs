const key = 'AIzaSyAts3RJInUBgazj8Sy0BRmcvtpNC5OEwYo';
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
    .then(r => r.json())
    .then(d => {
        if (d.models) {
            console.log(JSON.stringify(d.models.map(m => m.name), null, 2));
        } else {
            console.log("No models found or error:", JSON.stringify(d));
        }
    })
    .catch(e => console.error(e));
