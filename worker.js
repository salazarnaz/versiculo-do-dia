fetch('https://ourmanna.com')
  .then(response => response.json())
  .then(data => {
    const verse = data.value;
    console.log(`"${verse.text}" - ${verse.citation}`);
    // You can then inject this into your HTML
    // document.getElementById('verse-content').textContent = verse.text;
    // document.getElementById('verse-ref').textContent = verse.citation;
  })
  .catch(error => console.error('Error fetching the daily verse:', error));
