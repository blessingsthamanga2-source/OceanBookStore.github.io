// Author Upload JavaScript for BookStore

console.log('Author script loaded');

let currentStep = 1;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as author
    const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
    
    if (!currentUser) {
        alert('Please login to upload books');
        window.location.href = 'login.html';
        return;
    }
    
    if (currentUser.type !== 'author' && currentUser.role !== 'admin') {
        alert('This page is for authors only');
        window.location.href = 'index.html';
        return;
    }
    
    // Auto-fill author name
    const authorNameInput = document.getElementById('authorName');
    if (authorNameInput && !authorNameInput.value) {
        authorNameInput.value = currentUser.name;
    }
    
    // Initialize step system
    initializeSteps();
    
    // Setup file upload previews
    setupFilePreviews();
    
    // Initialize royalty calculator
    initializeRoyaltyCalculator();
    
    // Setup publish button
    setupPublishButton();
});

// Initialize step system
function initializeSteps() {
    // Show first step
    showStep(1);
    
    // Update step indicators
    updateStepIndicators();
}

// Show specific step
function showStep(stepNumber) {
    currentStep = stepNumber;
    
    // Hide all steps
    document.querySelectorAll('.upload-step').forEach(step => {
        step.style.display = 'none';
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step${stepNumber}Content`);
    if (currentStepElement) {
        currentStepElement.style.display = 'block';
    }
    
    // Update step indicators
    updateStepIndicators();
    
    // If step 4, update review
    if (stepNumber === 4) {
        updateReview();
    }
}

// Next step
function nextStep(nextStepNumber) {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
        return;
    }
    
    showStep(nextStepNumber);
}

// Previous step
function prevStep(prevStepNumber) {
    showStep(prevStepNumber);
}

// Update step indicators
function updateStepIndicators() {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
}

// Validate current step
function validateCurrentStep() {
    switch(currentStep) {
        case 1: // Book details
            return validateBookDetails();
        case 2: // Upload files
            return validateFiles();
        case 3: // Set price
            return validatePrice();
        default:
            return true;
    }
}

// Validate book details
function validateBookDetails() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('authorName').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    
    if (!title) {
        alert('Please enter a book title');
        return false;
    }
    
    if (!author) {
        alert('Please enter author name');
        return false;
    }
    
    if (!description) {
        alert('Please enter a book description');
        return false;
    }
    
    if (!category) {
        alert('Please select a category');
        return false;
    }
    
    return true;
}

// Validate files
function validateFiles() {
    const coverFile = document.getElementById('coverImage').files[0];
    const bookFile = document.getElementById('bookFile').files[0];
    
    if (!coverFile) {
        alert('Please upload a cover image');
        return false;
    }
    
    if (!bookFile) {
        alert('Please upload a book file');
        return false;
    }
    
    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validBookTypes = ['.pdf', '.epub'];
    
    if (!validImageTypes.includes(coverFile.type)) {
        alert('Cover must be JPEG, PNG, or WebP image');
        return false;
    }
    
    const bookExtension = bookFile.name.split('.').pop().toLowerCase();
    if (!validBookTypes.includes('.' + bookExtension)) {
        alert('Book file must be PDF or EPUB');
        return false;
    }
    
    // Validate file sizes (max 50MB for books, 5MB for covers)
    if (coverFile.size > 5 * 1024 * 1024) {
        alert('Cover image must be less than 5MB');
        return false;
    }
    
    if (bookFile.size > 50 * 1024 * 1024) {
        alert('Book file must be less than 50MB');
        return false;
    }
    
    return true;
}

// Validate price
function validatePrice() {
    const price = parseFloat(document.getElementById('price').value);
    
    if (!price || price < 0.99 || price > 99.99) {
        alert('Please enter a valid price between $0.99 and $99.99');
        return false;
    }
    
    return true;
}

// Setup file previews
function setupFilePreviews() {
    // Cover image preview
    const coverInput = document.getElementById('coverImage');
    if (coverInput) {
        coverInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('coverPreview');
                    preview.innerHTML = `
                        <img src="${e.target.result}" class="preview-image" alt="Cover preview">
                        <p>${file.name} (${(file.size/1024/1024).toFixed(2)} MB)</p>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Book file info
    const bookInput = document.getElementById('bookFile');
    if (bookInput) {
        bookInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const info = document.getElementById('fileInfo');
                info.innerHTML = `
                    <p><strong>${file.name}</strong></p>
                    <p>Type: ${file.type || 'Unknown'}</p>
                    <p>Size: ${(file.size/1024/1024).toFixed(2)} MB</p>
                `;
            }
        });
    }
    
    // Sample file info
    const sampleInput = document.getElementById('sampleFile');
    if (sampleInput) {
        sampleInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const info = document.getElementById('sampleInfo');
                info.innerHTML = `
                    <p><strong>Sample: ${file.name}</strong></p>
                    <p>Size: ${(file.size/1024).toFixed(2)} KB</p>
                `;
            }
        });
    }
}

// Initialize royalty calculator
function initializeRoyaltyCalculator() {
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', updateRoyaltyCalculator);
        updateRoyaltyCalculator(); // Initial calculation
    }
}

// Update royalty calculator
function updateRoyaltyCalculator() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    
    // Update display price
    document.getElementById('displayPrice').textContent = price.toFixed(2);
    
    // Calculate fees and earnings
    const processingFee = (price * 0.029) + 0.30;
    const authorEarning = price * 0.70;
    const platformEarning = price * 0.30;
    const netEarning = authorEarning - processingFee;
    
    // Update display
    document.getElementById('processingFee').textContent = processingFee.toFixed(2);
    document.getElementById('authorEarning').textContent = authorEarning.toFixed(2);
    document.getElementById('platformEarning').textContent = platformEarning.toFixed(2);
    document.getElementById('netEarning').textContent = netEarning.toFixed(2);
}

// Update review section
function updateReview() {
    // Get all values
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('authorName').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    
    // Update review elements
    document.getElementById('reviewTitle').textContent = title;
    document.getElementById('reviewAuthor').textContent = `by ${author}`;
    document.getElementById('reviewPrice').textContent = `Price: $${parseFloat(price).toFixed(2)}`;
    document.getElementById('reviewCategory').textContent = `Category: ${category}`;
    document.getElementById('reviewDescription').textContent = description;
}

// Setup publish button
function setupPublishButton() {
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', publishBook);
    }
}

// Publish book
function publishBook() {
    // Validate all steps
    if (!validateCurrentStep()) {
        alert('Please complete all required fields');
        return;
    }
    
    // Check terms agreement
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms || !agreeTerms.checked) {
        alert('Please agree to the Terms of Service');
        return;
    }
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('bookstore_current_user'));
    
    // Get book data
    const bookData = {
        id: Date.now(),
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('authorName').value.trim(),
        authorEmail: currentUser.email,
        price: parseFloat(document.getElementById('price').value),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        rating: 0,
        pages: 250, // Default value
        uploadDate: new Date().toISOString(),
        sales: 0,
        authorEarnings: 0
    };
    
    // Get file info
    const coverFile = document.getElementById('coverImage').files[0];
    const bookFile = document.getElementById('bookFile').files[0];
    const sampleFile = document.getElementById('sampleFile').files[0];
    
    // Save book to localStorage (in real app, this would go to backend)
    const books = JSON.parse(localStorage.getItem('bookstore_books')) || [];
    books.push(bookData);
    localStorage.setItem('bookstore_books', JSON.stringify(books));
    
    // Simulate file upload (in real app, upload to server)
    console.log('Simulating file upload...');
    console.log('Cover:', coverFile ? coverFile.name : 'No cover');
    console.log('Book:', bookFile ? bookFile.name : 'No book file');
    console.log('Sample:', sampleFile ? sampleFile.name : 'No sample');
    
    // Show success message
    alert(`🎉 Book "${bookData.title}" published successfully!\n\nYou will earn 70% of every sale ($${(bookData.price * 0.7).toFixed(2)} per sale).\n\nYour book is now available in the store!`);
    
    // Redirect to author dashboard
    setTimeout(() => {
        window.location.href = 'author-dashboard.html';
    }, 2000);
}

// Export functions for use in other files
window.AuthorUpload = {
    nextStep,
    prevStep,
    updateRoyaltyCalculator,
    publishBook
};

// Helper functions for HTML onclick handlers
window.nextStep = nextStep;
window.prevStep = prevStep;
window.previewCover = function(input) {
    // This function is called from HTML onclick
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('coverPreview');
            if (preview) {
                preview.innerHTML = `
                    <img src="${e.target.result}" class="preview-image" alt="Cover preview">
                    <p>${input.files[0].name}</p>
                `;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.showFileInfo = function(input) {
    if (input.files && input.files[0]) {
        const info = document.getElementById('fileInfo');
        if (info) {
            info.innerHTML = `
                <p><strong>${input.files[0].name}</strong></p>
                <p>Size: ${(input.files[0].size/1024/1024).toFixed(2)} MB</p>
            `;
        }
    }
};

window.showSampleInfo = function(input) {
    if (input.files && input.files[0]) {
        const info = document.getElementById('sampleInfo');
        if (info) {
            info.innerHTML = `
                <p><strong>Sample: ${input.files[0].name}</strong></p>
                <p>Size: ${(input.files[0].size/1024).toFixed(2)} KB</p>
            `;
        }
    }
};