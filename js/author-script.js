document.addEventListener('DOMContentLoaded', function() {
    console.log('Author upload page loaded');
    
    // Elements
    const form = document.getElementById('bookUploadForm');
    const priceInput = document.getElementById('price');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const prevStepBtn = document.getElementById('prevStepBtn');
    
    // Step management
    let currentStep = 1;
    
    function showStep(step) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show current step
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.style.display = 'block';
        }
        
        // Update buttons
        if (step === 1) {
            prevStepBtn.style.display = 'none';
            nextStepBtn.textContent = 'Next: Upload File';
        } else {
            prevStepBtn.style.display = 'inline-block';
            nextStepBtn.textContent = 'Publish Book';
        }
        
        currentStep = step;
    }
    
    // Initialize
    showStep(1);
    
    // Next button click
    nextStepBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (currentStep === 1) {
            // Validate step 1
            const title = document.getElementById('bookTitle').value.trim();
            const author = document.getElementById('authorName').value.trim();
            const price = document.getElementById('price').value;
            const description = document.getElementById('description').value.trim();
            const category = document.getElementById('category').value;
            
            if (!title || !author || !price || !description || !category) {
                alert('Please fill in all required fields.');
                return;
            }
            
            showStep(2);
            
        } else if (currentStep === 2) {
            // Upload files and save book
            await uploadBook();
        }
    });
    
    // Previous button
    prevStepBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showStep(1);
    });
    
    // Royalty calculator
    function updateRoyaltyCalculator() {
        const price = parseFloat(priceInput.value) || 0;
        
        const authorShare = price * 0.70;
        const platformShare = price * 0.30;
        const paymentFee = (price * 0.029) + 0.30;
        const netAuthorEarn = authorShare - paymentFee;
        
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
                        <div style="margin-top: 10px;">
                            <img src="${e.target.result}" style="max-width: 200px; border-radius: 5px;">
                            <p>${file.name} (${(file.size/1024/1024).toFixed(2)} MB)</p>
                        </div>
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
                               file.name.toLowerCase().endsWith('.epub');
                
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
                            ❌ Invalid file. Must be PDF or EPUB under 50MB
                        </div>
                    `;
                    bookFile.value = '';
                }
            }
        });
    }
    
    // UPLOAD FUNCTION
    async function uploadBook() {
        // Get form data
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('authorName').value.trim();
        const price = parseFloat(document.getElementById('price').value);
        const description = document.getElementById('description').value.trim();
        const category = document.getElementById('category').value;
        const coverFile = document.getElementById('coverImage').files[0];
        const bookFileInput = document.getElementById('bookFile').files[0];
        
        // Validate files
        if (!coverFile || !bookFileInput) {
            alert('Please upload both cover image and book file.');
            return;
        }
        
        // Change button to loading
        nextStepBtn.disabled = true;
        nextStepBtn.textContent = 'Uploading...';
        
        try {
            console.log('Starting upload process...');
            
            // Step 1: Upload cover image
            console.log('Uploading cover image...');
            const coverFormData = new FormData();
            coverFormData.append('file', coverFile);
            
            const coverResponse = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: coverFormData
            });
            
            const coverData = await coverResponse.json();
            console.log('Cover response:', coverData);
            
            if (!coverData.success) {
                throw new Error('Cover upload failed: ' + (coverData.error || 'Unknown error'));
            }
            
            // Step 2: Upload book file
            console.log('Uploading book file...');
            const bookFormData = new FormData();
            bookFormData.append('file', bookFileInput);
            
            const bookResponse = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: bookFormData
            });
            
            const bookData = await bookResponse.json();
            console.log('Book response:', bookData);
            
            if (!bookData.success) {
                throw new Error('Book upload failed: ' + (bookData.error || 'Unknown error'));
            }
            
            // Step 3: Save book to database
            console.log('Saving book to database...');
            const bookPayload = {
                title,
                author,
                price,
                description,
                category,
                bookFile: {
                    url: 'http://localhost:5000' + bookData.file.url,
                    filename: bookData.file.filename
                },
                coverImage: {
                    url: 'http://localhost:5000' + coverData.file.url,
                    filename: coverData.file.filename
                }
            };
            
            console.log('Sending book data:', bookPayload);
            
            const saveResponse = await fetch('http://localhost:5000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookPayload)
            });
            
            const saveData = await saveResponse.json();
            console.log('Save response:', saveData);
            
            if (saveData.success) {
                // SUCCESS!
                alert(`🎉 SUCCESS!\n\n"${title}" has been uploaded successfully!\n\nThe book is now available in the store.\n\nYou will earn 70% of each sale.`);
                
                // Reset form and go back to step 1
                form.reset();
                coverPreview.innerHTML = '';
                fileInfo.innerHTML = '';
                updateRoyaltyCalculator();
                showStep(1);
                
                // Redirect to browse page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'reader-browse.html';
                }, 2000);
                
            } else {
                throw new Error('Database save failed: ' + (saveData.error || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Upload error:', error);
            alert(`Upload failed: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. MongoDB is running\n3. Check browser console for details`);
        } finally {
            // Reset button
            nextStepBtn.disabled = false;
            nextStepBtn.textContent = 'Publish Book';
        }
    }
});
