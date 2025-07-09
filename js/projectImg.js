document.addEventListener('DOMContentLoaded', function() {
    // Find all slideshow containers
    const slideshows = document.querySelectorAll('.slideshow-container');
    
    // Initialize each slideshow
    slideshows.forEach((slideshow, index) => {
        const slides = slideshow.querySelectorAll('.mySlides');
        let currentSlide = 0;
        
        // Hide all slides initially
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Show first slide
        if (slides.length > 0) {
            slides[0].classList.add('active');
        }
        
        // Function to show next slide
        function nextSlide() {
            // Remove active class from current slide
            slides[currentSlide].classList.remove('active');
            
            // Move to next slide (loop back to 0 if at end)
            currentSlide = (currentSlide + 1) % slides.length;
            
            // Add active class to new current slide
            slides[currentSlide].classList.add('active');
        }
        
        // Start automatic slideshow (change slide every 3 seconds)
        setInterval(nextSlide, 3000);
    });
});