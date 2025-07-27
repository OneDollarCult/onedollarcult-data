fetch('https://YOUR_USERNAME.github.io/players.json')
  .then(res => res.json())
  .then(data => {
    const count = data.players.length;
    document.getElementById('playersCount').innerText = count;
  });
