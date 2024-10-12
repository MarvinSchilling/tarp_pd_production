import React, { useRef, useEffect } from 'react';

const Stars = () => {
  const canvasRef = useRef(null);
  const starsArray = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Setze die Größe des Canvas auf den gesamten Bildschirm
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Sternen-Objekt
    class Star {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * canvas.width; // Z-Achse für "Tiefeneffekt"
        this.radius = Math.random() * 1.2; // Kleinere Sterne
        this.speed = Math.random() * 2 + 0.1; // Geschwindigkeit
      }

      update() {
        // Bewegung entlang der Z-Achse
        this.z -= this.speed;

        // Wenn der Stern "vorbei" ist, setze ihn nach hinten
        if (this.z <= 0) {
          this.z = canvas.width;
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.speed = Math.random() * 2 + 0.1;
        }
      }

      draw() {
        // 2D-Koordinaten für den 3D-Effekt
        const x2D = (this.x - canvas.width / 2) * (canvas.width / this.z);
        const y2D = (this.y - canvas.height / 2) * (canvas.width / this.z);

        // Stern zeichnen (mit konstantem Radius)
        ctx.beginPath();
        ctx.arc(x2D + canvas.width / 2, y2D + canvas.height / 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(200, 200, 200)'; // Leicht gräuliche Farbe
        ctx.fill();
      }
    }

    // Initialisiere die Sterne
    const initStars = (numStars) => {
      for (let i = 0; i < numStars; i++) {
        starsArray.push(new Star());
      }
    };

    // Animations-Update für die Sterne
    const animateStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update und zeichne alle Sterne
      starsArray.forEach((star) => {
        star.update();
        star.draw();
      });

      requestAnimationFrame(animateStars);
    };

    // Anzahl der Sterne initialisieren (erhöht auf 1000 für mehr Sterne)
    initStars(1000);

    // Starte die Animation
    animateStars();

    // Bei Fenstergröße ändern, das Canvas anpassen
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="stars-canvas"></canvas>;
};

export default Stars;
