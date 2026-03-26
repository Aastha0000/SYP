import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmStripePayment } from '../services/api';

const CARD_ELEMENT_OPTIONS = {
    hidePostalCode: true,
    style: {
        base: {
            color: "#32325d",
            fontFamily: 'Arial, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#aab7c4"
            }
        },
        invalid: {
            color: "#fa755a",
            iconColor: "#fa755a"
        }
    }
};

const StripePaymentForm = ({ amount, bookingDetails, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);

    useEffect(() => {
        // Create PaymentIntent as soon as the component loads
        const getClientSecret = async () => {
            try {
                const res = await createPaymentIntent({
                    amount,
                    currency: 'npr',
                    bookingDetails
                });
                setClientSecret(res.data.clientSecret);
            } catch (err) {
                const msg = err.response?.data?.message || 'Failed to initialize payment.';
                setError(msg);
                console.error(err);
            }
        };
        getClientSecret();
    }, [amount, bookingDetails]);

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        const payload = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement)
            }
        });

        if (payload.error) {
            setError(`Payment failed: ${payload.error.message}`);
            setProcessing(false);
        } else if (payload.paymentIntent) {
            // Confirm with backend
            try {
                await confirmStripePayment({
                    paymentIntentId: payload.paymentIntent.id,
                    bookingDetails
                });
                setError(null);
                setProcessing(false);
                setSucceeded(true);
                onSuccess();
            } catch (err) {
                console.error('Backend confirmation error:', err);
                const backendMsg = err.response?.data?.message || 'Local confirmation failed.';
                setError(`Payment succeeded but ${backendMsg}`);
                setProcessing(false);
            }
        } else {
            setError('An unexpected error occurred.');
            setProcessing(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} style={{ width: '100%', padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h4 style={{ marginBottom: '15px' }}>Payment for Guide Booking</h4>
            <div style={{ padding: '15px', background: 'white', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
            </div>
            
            {error && (
                <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '15px', padding: '10px', background: '#fef2f2', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                    disabled={processing || succeeded || !stripe || !clientSecret} 
                    id="submit"
                    style={{
                        flex: 1,
                        background: '#1a434e',
                        color: 'white',
                        padding: '12px',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: (processing || succeeded) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {processing ? "Processing..." : `Pay NRs. ${amount}`}
                </button>
                <button 
                    type="button" 
                    onClick={onCancel}
                    disabled={processing}
                    style={{
                        padding: '12px 20px',
                        background: 'white',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontWeight: '600',
                        cursor: processing ? 'not-allowed' : 'pointer'
                    }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default StripePaymentForm;
