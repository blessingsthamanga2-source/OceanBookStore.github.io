document.addEventListener('DOMContentLoaded', function() {
    console.log('Author upload page loaded');
    
    const form = document.getElementById('bookUploadForm');
    const priceInput = document.getElementById('price');
    const coverImage = document.getElementById('coverImage');
    const coverPreview = document.getElementById('coverPreview');
    const bookFile = document.getElementById('bookFile');
    const fileInfo = document.getElementById('fileInfo');
    
    // Royalty Calculator
    function updateRoyaltyCalculator() {
        const price = parseFloat(priceInput.value) || 0;
        const priceDisplay = document.getElementById('priceDisplay');
        const authorEarn = document.getElementById('authorEarn');
        const platformFee = document.getElementById('platformFee');
        const processingFee = document.getElementById('processingFee');
        const netEarn = document.getElementById('netEarn');
        
        if (priceDisplay) {
            priceDisplay.textContent = price.toFixed(2);
            authorEarn.textContent = (price * 0.70).toFixed(2);
            platformFee.textContent = (price * 0.30).toFixed(2);
            processingFee.textContent = ((price * 0.029) + 0.30).toFixed(2);
            netEarn.textContent = ((price * 0.70) - ((price * 0.029) + 0.30)).toFixed(2);
        }
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', updateRoyaltyCalculator);
        updateRoyaltyCalculator();
    }
    
    // Cover Image Preview
    if (coverImage && coverPreview) {
        coverImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        coverPreview.innerHTML = `
                            <div style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                                <img src="${e.target.result}" style="max-width: 200px; max-height: 300px; border-radius: 5px;">
                                <p style="margin-top: 10px; font-size: 0.9rem;">${file.name}</p>
                                <p style="font-size: 0.8rem; color: #666;">${(file.size/1024/1024).toFixed(2)} MB</p>
                            </div>
                        `;
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('Please select an image file (JPG, PNG, etc.)');
                    coverImage.value = '';
                }
            }
        });
    }
    
    // Book File Info Display
    if (bookFile && fileInfo) {
        bookFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const isValidFormat = file.type === 'application/pdf' || 
                                     file.name.toLowerCase().endsWith('.epub') || 
                                     file.name.toLowerCase().endsWith('.mobi');
                const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
                
                if (isValidFormat && isValidSize) {
                    fileInfo.innerHTML = `
                        <div style="margin-top: 15px; padding: 10px; background: #e8f5e9; border-radius: 5px;">
                            <strong>✅ File Selected:</strong><br>
                            Name: ${file.name}<br>
                            Type: ${file.type || 'Unknown'}<br>
                            Size: ${(file.size/1024/1024).toFixed(2)} MB
                        </div>
                    `;
                } else {
                    let errorMsg = '❌ Invalid file: ';
                    if (!isValidFormat) errorMsg += 'Only PDF, EPUB, or MOBI files allowed. ';
                    if (!isValidSize) errorMsg += 'File must be under 50MB.';
                    
                    fileInfo.innerHTML = `
                        <div style="margin-top: 15px; padding: 10px; background: #ffebee; border-radius: 5px; color: #c62828;">
                            ${errorMsg}
                        </div>
                    `;
                    bookFile.value = '';
                }
            }
        });
    }
    
    // REAL UPLOAD - SIMPLE VERSION THAT WORKS
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('Form submitted - starting upload...');
            
            // Get form values
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('authorName').value;
            const price = document.getElementById('price').value;
            const description = document.getElementById('description').value;
            const category = document.getElementById('category').value;
            const coverFile = document.getElementById('coverImage').files[0];
            const bookFileInput = document.getElementById('bookFile').files[0];
            
            // Basic validation
            if (!title || !author || !price || !description || !category) {
                alert('Please fill in all text fields.');
                return;
            }
            
            if (!coverFile || !bookFileInput) {
                alert('Please upload both cover image and book file.');
                return;
            }
            
            // Validate file types
            if (!coverFile.type.startsWith('image/')) {
                alert('Cover must be an image file (JPG, PNG, etc.)');
                return;
            }
            
            const validBookTypes = ['application/pdf', 'application/epub+zip'];
            const isBookTypeValid = validBookTypes.includes(bookFileInput.type) || 
                                   bookFileInput.name.toLowerCase().endsWith('.pdf') ||
                                   bookFileInput.name.toLowerCase().endsWith('.epub') ||
                                   bookFileInput.name.toLowerCase().endsWith('.mobi');
            
            if (!isBookTypeValid) {
                alert('Book file must be PDF, EPUB, or MOBI format.');
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Uploading... Please wait...';
            }
            
            try {
                console.log('Step 1: Uploading cover image...');
                
                // 1. Upload cover image
                const coverFormData = new FormData();
                coverFormData.append('file', coverFile);
                
                const coverResponse = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: coverFormData
                });
                
                if (!coverResponse.ok) {
                    throw new Error(`Cover upload failed: ${coverResponse.status}`);
                }
                
                const coverData = await coverResponse.json();
                console.log('Cover uploaded:', coverData);
                
                if (!coverData.success) {
                    throw new Error('Cover upload failed: ' + (coverData.error || 'Unknown error'));
                }
                
                console.log('Step 2: Uploading book file...');
                
                // 2. Upload book file
                const bookFormData = new FormData();
                bookFormData.append('file', bookFileInput);
                
                const bookResponse = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: bookFormData
                });
                
                if (!bookResponse.ok) {
                    throw new Error(`Book upload failed: ${bookResponse.status}`);
                }
                
                const bookData = await bookResponse.json();
                console.log('Book uploaded:', bookData);
                
                if (!bookData.success) {
                    throw new Error('Book upload failed: ' + (bookData.error || 'Unknown error'));
                }
                
                console.log('Step 3: Saving book to database...');
                
                // 3. Save book data to database
                const bookPayload = {
                    title: title,
                    author: author,
                    price: parseFloat(price),
                    description: description,
                    category: category,
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
                
                console.log('Sending to backend:', bookPayload);
                
                const saveResponse = await fetch('http://localhost:5000/api/books', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookPayload)
                });
                
                if (!saveResponse.ok) {
                    throw new Error(`Save failed: ${saveResponse.status}`);
                }
                
                const saveData = await saveResponse.json();
                console.log('Save response:', saveData);
                
                if (saveData.success) {
                    // SUCCESS!
                    alert(`✅ BOOK UPLOADED SUCCESSFULLY!\n\n"${title}"\nby ${author}\n\n• Cover image uploaded ✓\n• Book file uploaded ✓\n• Added to bookstore ✓\n\nPrice: $${price}\nYou earn: $${(price * 0.70).toFixed(2)} per sale`);
                    
                    // Reset form
                    form.reset();
                    
                    // Clear previews
                    if (coverPreview) coverPreview.innerHTML = '';
                    if (fileInfo) fileInfo.innerHTML = '';
                    
                    // Reset royalty calculator
                    updateRoyaltyCalculator();
                    
                    // Redirect after 3 seconds
                    setTimeout(() => {
                        alert('Redirecting to bookstore to view your book...');
                        window.location.href = 'reader-browse.html';
                    }, 3000);
                    
                } else {
                    throw new Error('Failed to save book: ' + (saveData.error || 'Unknown error'));
                }
                
            } catch (error) {
                console.error('Upload error:', error);
                
                // Show detailed error
                let errorMessage = 'Upload failed. ';
                
                if (error.message.includes('failed to fetch')) {
                    errorMessage += 'Cannot connect to server. Make sure backend is running on http://localhost:5000';
                } else if (error.message.includes('network')) {
                    errorMessage += 'Network error. Check your internet connection.';
                } else {
                    errorMessage += error.message;
                }
                
                alert(`❌ ERROR: ${errorMessage}\n\nCheck console for details.`);
                
                // Debug info
                console.log('Debug info - Check these:');
                console.log('1. Is backend running? (npm run dev in backend folder)');
                console.log('2. Check http://localhost:5000/api/test in browser');
                console.log('3. Check browser console for CORS errors');
                console.log('4. Check file size (max 50MB)');
                
            } finally {
                // Reset button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Publish Book (70% Royalty)';
                }
            }
        });
    }
    
    // Make sure file upload boxes are clickable
    const fileUploads = document.querySelectorAll('.file-upload');
    fileUploads.forEach(uploadBox => {
        uploadBox.style.cursor = 'pointer';
        uploadBox.addEventListener('click', function() {
            const fileInput = this.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.click();
            }
        });
    });
});
