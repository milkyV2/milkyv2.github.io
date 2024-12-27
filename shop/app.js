// app.js
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // Generate a random number of stars
    const starCount = 100;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Assign a random size to the star
        const sizeClass = Math.random() > 0.5 ? 'star-small' : (Math.random() > 0.5 ? 'star-medium' : 'star-large');
        star.classList.add(sizeClass);

        // Randomize the position of the star
        star.style.top = `${Math.random() * 100}vh`;
        star.style.left = `${Math.random() * 100}vw`;

        // Append the star to the body
        body.appendChild(star);
    }
});
