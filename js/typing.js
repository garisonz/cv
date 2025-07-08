const words = ['Innovative', 'Creative', 'Obsessive Learner'];
        let currentWordIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        const typewriter = document.getElementById('typewriter');
        
        function typeEffect() {
            const currentWord = words[currentWordIndex];
            
            if (isDeleting) {
                // Remove characters
                typewriter.textContent = currentWord.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                
                if (currentCharIndex === 0) {
                    isDeleting = false;
                    currentWordIndex = (currentWordIndex + 1) % words.length;
                    setTimeout(typeEffect, 500); // Pause before typing next word
                } else {
                    setTimeout(typeEffect, 50); // Deleting speed
                }
            } else {
                // Add characters
                typewriter.textContent = currentWord.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                
                if (currentCharIndex === currentWord.length) {
                    // Word complete, pause then start deleting
                    setTimeout(() => {
                        isDeleting = true;
                        typeEffect();
                    }, 2000); // Pause before deleting
                } else {
                    setTimeout(typeEffect, 100); // Typing speed
                }
            }
            
            // Add typing class during animation
            typewriter.classList.add('typing');
            setTimeout(() => {
                typewriter.classList.remove('typing');
            }, 50);
        }
        
        // Start the animation
        typeEffect();