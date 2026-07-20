import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './EmailPromptModal.css';

const EmailPromptModal = ({ isOpen, onClose, onConfirm, contentType }) => {
  const [step, setStep] = useState('initial'); // initial, confirm, sending, success, error

  if (!isOpen) return null;

  const handleSendEmail = () => {
    setStep('confirm');
  };

  const confirmSend = async () => {
    setStep('sending');
    try {
      await onConfirm();
      setStep('success');
    } catch (error) {
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('initial');
    onClose();
  };

  return (
    <div className="email-inline-container">
      <div className="email-modal animate-slide-up">
        
        {step === 'initial' && (
          <div className="modal-content text-center">
            <Mail size={48} className="modal-icon text-primary mb-4" />
            <h3 className="modal-title">📧 Send this to your Email?</h3>
            <p className="modal-text">Your generated <b>{contentType}</b> is ready.</p>
            <p className="modal-text mb-4">Would you like us to send a copy to your registered email address so you can access it anytime?</p>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSendEmail}>Send to My Email</button>
              <button className="btn btn-secondary" onClick={handleClose}>Not Now</button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="modal-content text-center">
            <h3 className="modal-title mb-3">Confirm Email Delivery</h3>
            <p className="modal-text">We will send this generated content to your registered email address.</p>
            <p className="modal-text text-accent mb-4">Do you want to continue?</p>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={confirmSend}>Send Email</button>
              <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            </div>
          </div>
        )}

        {step === 'sending' && (
          <div className="modal-content text-center py-4">
            <Loader2 size={48} className="modal-icon animate-spin text-primary mb-4" />
            <h3 className="modal-title mb-2">Sending your content...</h3>
            <p className="modal-text text-secondary">Preparing email and attaching documents. Please wait.</p>
            <div className="modal-actions mt-4">
              <button className="btn btn-secondary" disabled>Cancel</button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="modal-content text-center">
            <CheckCircle size={56} className="modal-icon text-success mb-4 animate-bounce" />
            <h3 className="modal-title text-success mb-2">✅ Email Sent Successfully!</h3>
            <p className="modal-text">Your generated content has been sent to your registered email address.</p>
            <p className="modal-text mb-4">You can access it anytime from your inbox.</p>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleClose}>Done</button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="modal-content text-center">
            <XCircle size={56} className="modal-icon text-danger mb-4" />
            <h3 className="modal-title text-danger mb-2">Delivery Failed</h3>
            <p className="modal-text">We couldn't send your email right now.</p>
            <p className="modal-text mb-4">Please check your internet connection or try again later.</p>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={confirmSend}>Retry</button>
              <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmailPromptModal;
