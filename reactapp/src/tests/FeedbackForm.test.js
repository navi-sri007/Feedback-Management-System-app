import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackForm from '../components/FeedbackForm';
import * as api from '../utils/api';

describe('FeedbackForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('testFeedbackFormRendering: fields, submit button, error/success states', async () => {
    render(<FeedbackForm />);
    expect(screen.getByLabelText(/User ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comment/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    // Empty state
    expect(screen.getByTestId('userId-input')).toHaveValue('');
    // Simulate success
    jest.spyOn(api, 'submitFeedback').mockResolvedValueOnce({});
    fireEvent.change(screen.getByTestId('userId-input'), { target: { value: 'user1' } });
    fireEvent.change(screen.getByTestId('productId-input'), { target: { value: 'prod2' } });
    fireEvent.change(screen.getByTestId('rating-select'), { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('comment-input'), { target: { value: 'Great product experience!' } });
    fireEvent.click(screen.getByTestId('submit-button'));
    await waitFor(() => {
      expect(screen.getByText(/Feedback submitted successfully!/i)).toBeInTheDocument();
    });
    // Form clears
    expect(screen.getByTestId('userId-input')).toHaveValue('');
  });

  test('testFeedbackFormValidation: disables submission and shows errors on invalid data', async () => {
    render(<FeedbackForm />);
    fireEvent.click(screen.getByTestId('submit-button'));
    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });
    fireEvent.change(screen.getByTestId('userId-input'), { target: { value: 'x' } });
    fireEvent.change(screen.getByTestId('productId-input'), { target: { value: 'y' } });
    fireEvent.change(screen.getByTestId('rating-select'), { target: { value: '7' } });
    fireEvent.change(screen.getByTestId('comment-input'), { target: { value: 'short' } });
    // Try submit
    fireEvent.click(screen.getByTestId('submit-button'));
    await waitFor(() => {
      expect(screen.getByText(/Rating must be between 1 and 5/)).toBeInTheDocument();
      expect(screen.getByText(/Comment must be between 10 and 500/)).toBeInTheDocument();
    });
    // Simulate API failure
    jest.spyOn(api, 'submitFeedback').mockRejectedValueOnce({ message: 'Failed to submit feedback' });
    fireEvent.change(screen.getByTestId('userId-input'), { target: { value: 'user123' } });
    fireEvent.change(screen.getByTestId('productId-input'), { target: { value: 'prod456' } });
    fireEvent.change(screen.getByTestId('rating-select'), { target: { value: '3' } });
    fireEvent.change(screen.getByTestId('comment-input'), { target: { value: 'This is a valid comment.' } });
    fireEvent.click(screen.getByTestId('submit-button'));
    await waitFor(() => {
      expect(screen.getByText(/Failed to submit feedback/)).toBeInTheDocument();
    });
  });
});
