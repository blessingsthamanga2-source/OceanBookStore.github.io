document.addEventListener('DOMContentLoaded', function() {
    console.log('Author upload page loaded');
    
    // Elements
    const form = document.getElementById('bookUploadForm');
    const priceInput = document.getElementById('price');
    const step1Section = document.querySelector('.form-step[data-step="1"]');
    const step2Section = document.querySelector('.form-step[data-step="2"]');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const prevStepBtn = document.getElementById('prevStepBtn');
    
    let currentStep = 1;
    
    // Show step function
    function showStep(step) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show current step
        const currentStepSection = document.querySelector(`.form-step[data-step="${step}"]`);
        if (currentStepSection) {
            currentStepSection.style.display = 'block';
        }
        
        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach(indicator => {
            indicator.classList.remove('active');
        });
        document.querySelector(`.step-indicator[data-step="${step}"]`).classList.add('active');
        
        currentStep = step;
        
        // Update button visibility
        if (step === 1) {
            prevStepBtn.style.display = 'none';
            nextStepBtn.style.display = 'block';
            nextStepBtn.textContent = 'Next: Upload File';
        } else if (step === 2) {
            prevStepBtn.style.display = 'block';
            nextStepBtn.style.display = 'block';
            nextStepBtn.textContent = 'Publish Book';
        }
    }
    
    // Initialize first step
    showStep(1);
    
    // Next step button
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (currentStep === 1) {
                // Validate step 1
                const title = document.getElementById('bookTitle').value;
                const author = document.getElementById('authorName').value;
                const price = document.getElementById('price').value;
                const description = document.getElementById('description').value;
                const category = document.getElementById('category').value;
                
                if (!title || !author || !price || !description || !category) {
                    alert('Please fill in all required fields in Step 1.');
                    return;
                }
                
                showStep(2);
            } else if (currentStep === 2) {
                // This will trigger the form submission
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Previous step button
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showStep(1);
        });
    }
    
    // Royalty Calculator
    function updateRoyaltyCalculator() {
        const price = parseFloat(priceInput.value) || 0;
        
        const authorShare = price * 0.70; // 70%
        const platformShare = price * 0.30; // 30%
        const paymentFee = (price * 0.029) + 0.30;
        const netAuthorEarn = authorShare - paymentFee;
        
        // Update display
        document.getElementById('priceDisplay').textContent = price.toFixed(2);
        document.getElementById('authorEarn').textContent = authorShare.toFixed(2);
        document.getElementById('platformFee').textContent = platformShare.toFixed(2);
        document.getElementById('processingFee').textContent = paymentFee.toFixed(2);
        document.getElementById('netEarn').textContent = netAuthorEarn.toFixed(2);
    }
    
    priceInput.addEventListener('input', updateRoyaltyCalculator);
    updateRoyaltyCalculator();
    
    // File previews
    const coverImage = document.getElementById('coverImage');
    const coverPreview = document.getElementById('coverPreview');
    const bookFile = document.getElementById('bookFile');
    const fileInfo = document.getElementById('fileInfo');
    
    if (coverImage) {
        coverImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    coverPreview.innerHTML = `
                        <img src="${e.target.result}" style="max-width: 200px; border-radius: 5px; margin-top: 10px;">
                        <p>${file.name} (${(file.size/1024/1024).toFixed(2)} MB)</p>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (bookFile) {
        bookFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const isValid = file.type === 'application/pdf' || 
                               file.name.endsWith('.epub') || 
                               file.name.endsWith('.mobi');
                
                if (isValid && file.size <= 50 * 1024 * 1024) {
                    fileInfo.innerHTML = `
                        <div style="margin-top: 10px; padding: 10px; background: #e8f5e9; border-radius: 5px;">
                            ✅ ${file.name}<br>
                            Size: ${(file.size/1024/1024).toFixed(2)} MB
                        </div>
                    `;
                } else {
                    fileInfo.innerHTML = `
                        <div style="margin-top: 10px; padding: 10px; background: #ffebee; border-radius: 5px; color: #c62828;">
                            ❌ Invalid file. Must be PDF/EPUB under 50MB
                        </div>
                    `;
                    bookFile.value = '';
                }
            }
        });
    }
    
    // REAL UPLOAD - Form Submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('authorName').value;
        const price = parseFloat(document.getElementById('price').value);
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;
        const coverFile = document.getElementById('coverImage').files[0];
        const bookFileInput = document.getElementById('bookFile').files[0];
        
        // Final validation
        if (!title || !author || !price || !description || !category || !coverFile || !bookFileInput) {
            alert('Please fill all fields and upload files.');
            showStep(2); // Go back to step 2 if files missing
            return;
        }
        
        // Show loading
        const submitBtn = nextStepBtn;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;
        
        try {
            // Step 1: Upload cover image
            console.log('Uploading cover image...');
            const coverFormData = new FormData();
            coverFormData.append('file', coverFile);
            
            const coverResponse = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: coverFormData
            });
            
            const coverData = await coverResponse.json();
            if (!coverData.success) throw new Error('Cover upload failed');
            
            console.log('Cover uploaded:', coverData.url);
            
            // Step 2: Upload book file
            console.log('Uploading book file...');
            const bookFormData = new FormData();
            bookFormData.append('file', bookFileInput);
            
            const bookResponse = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: bookFormData
            });
            
            const bookData = await bookResponse.json();
            if (!bookData.success) throw new Error('Book file upload failed');
            
            console.log('Book file uploaded:', bookData.url);
            
            // Step 3: Save book to database
            console.log('Saving book to database...');
            const bookPayload = {
                title,
                author,
                price,
                description,
                category,
                bookFile: {
                    url: bookData.url,
                    public_id: bookData.public_id,
                    format: bookData.format
                },
                coverImage: {
                    url: coverData.url,
                    public_id: coverData.public_id
                }
            };
            
            const saveResponse = await fetch('http://localhost:5000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookPayload)
            });
            
            const saveData = await saveResponse.json();
            
            if (saveData.success) {
                alert(`🎉 SUCCESS!\n\n"${title}" uploaded successfully!\n\nCover: ✅\nBook File: ✅\nDatabase: ✅\n\nBook is now live in the store!`);
                
                // Reset form
                form.reset();
                if (coverPreview) coverPreview.innerHTML = '';
                if (fileInfo) fileInfo.innerHTML = '';
                updateRoyaltyCalculator();
                showStep(1); // Go back to step 1
                
                // Redirect after 3 seconds
                setTimeout(() => {
                    window.location.href = 'reader-browse.html';
                }, 3000);
                
            } else {
                throw new Error('Failed to save book to database');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message}\n\nPlease try again.`);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});
