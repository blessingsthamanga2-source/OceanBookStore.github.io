// Stripe Configuration for BookStore (TEST MODE)

console.log('Stripe config loaded');

const STRIPE_CONFIG = {
    // TEST PUBLISHABLE KEY - Replace with your own from Stripe dashboard
    publishableKey: 'pk_test_51PBCV2RrR9L3D9gO7mT7Vk5hJ8ZxY6aQ9bC4dF7gH2jK8lM9nN0pQ1rS2tU3vW4xY5zA6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z',
    
    // Test card numbers (provided by Stripe for testing)
    testCards: {
        success: '4242424242424242',
        require_authentication: '4000002500003155',
        decline: '4000000000000002',
        insufficient_funds: '4000000000009995'
    }
};

// Format currency
function formatCurrency(amount, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
    }).format(amount);
}

// Validate card details (basic validation for demo)
function validateCardDetails(cardNumber, expiry, cvc) {
    const errors = [];
    
    // Clean card number
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    // Validate card number length
    if (!cleanCardNumber || cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        errors.push('Invalid card number');
    }
    
    // Validate expiry date
    const [month, year] = expiry.split('/').map(num => parseInt(num.trim()));
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (!month || !year || month < 1 || month > 12 || year < currentYear || 
        (year === currentYear && month < currentMonth)) {
        errors.push('Invalid or expired card');
    }
    
    // Validate CVC
    if (!cvc || cvc.length < 3 || cvc.length > 4) {
        errors.push('Invalid CVC');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Simulate Stripe API call
async function simulateStripePayment(paymentData) {
    console.log('Simulating Stripe payment:', paymentData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check for test card numbers
    const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
    
    // Test scenarios based on card number
    if (cardNumber === STRIPE_CONFIG.testCards.success) {
        return {
            success: true,
            paymentId: 'pi_' + Math.random().toString(36).substr(2, 14),
            clientSecret: 'seti_' + Math.random().toString(36).substr(2, 20),
            amount: paymentData.amount,
            status: 'succeeded',
            receiptUrl: `https://dashboard.stripe.com/test/payments/pi_${Math.random().toString(36).substr(2, 14)}`
        };
    } else if (cardNumber === STRIPE_CONFIG.testCards.require_authentication) {
        return {
            success: false,
            error: 'card_requires_authentication',
            message: 'Card requires authentication'
        };
    } else if (cardNumber === STRIPE_CONFIG.testCards.decline) {
        return {
            success: false,
            error: 'card_declined',
            message: 'Your card was declined'
        };
    } else if (cardNumber === STRIPE_CONFIG.testCards.insufficient_funds) {
        return {
            success: false,
            error: 'insufficient_funds',
            message: 'Insufficient funds'
        };
    } else {
        // For any other test number, simulate success
        return {
            success: true,
            paymentId: 'pi_' + Math.random().toString(36).substr(2, 14),
            clientSecret: 'seti_' + Math.random().toString(36).substr(2, 20),
            amount: paymentData.amount,
            status: 'succeeded',
            receiptUrl: `https://dashboard.stripe.com/test/payments/pi_${Math.random().toString(36).substr(2, 14)}`
        };
    }
}

// Process payment (demo version)
async function processStripePayment(paymentData) {
    try {
        console.log('Processing Stripe payment...');
        
        // Validate card details
        const validation = validateCardDetails(
            paymentData.cardNumber,
            paymentData.expiry,
            paymentData.cvc
        );
        
        if (!validation.isValid) {
            return {
                success: false,
                error: 'validation_error',
                message: validation.errors.join(', ')
            };
        }
        
        // Simulate payment processing
        const result = await simulateStripePayment(paymentData);
        
        if (result.success) {
            console.log('Payment successful:', result.paymentId);
            return {
                success: true,
                paymentId: result.paymentId,
                amount: result.amount,
                receiptUrl: result.receiptUrl
            };
        } else {
            console.error('Payment failed:', result.error);
            return {
                success: false,
                error: result.error,
                message: result.message || 'Payment failed'
            };
        }
        
    } catch (error) {
        console.error('Payment processing error:', error);
        return {
            success: false,
            error: 'processing_error',
            message: error.message || 'Payment processing failed'
        };
    }
}

// Create payment intent (simulated)
async function createPaymentIntent(amount, description) {
    console.log(`Creating payment intent for ${formatCurrency(amount)}: ${description}`);
    
    // In real app, this would call your backend
    return {
        clientSecret: 'pi_' + Math.random().toString(36).substr(2, 20) + '_secret_' + Math.random().toString(36).substr(2, 20),
        amount: amount,
        currency: 'usd',
        status: 'requires_payment_method'
    };
}

// Export for use in other files
window.StripeConfig = {
    STRIPE_CONFIG,
    formatCurrency,
    validateCardDetails,
    simulateStripePayment,
    processStripePayment,
    createPaymentIntent
};

// Also make functions available globally for HTML onclick handlers
window.formatCurrency = formatCurrency;