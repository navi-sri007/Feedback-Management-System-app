import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserFeedbackList from '../components/UserFeedbackList';
import * as api from '../utils/api';

describe('UserFeedbackList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('testUserFeedbackListRendering: rendering, API mock, empty case, info display', async () => {
    const mockData = [
      {
        id: 1,
        userId: 'user123',
        productId: 'prod456',
        rating: 4,
        comment: 'Nice!',
        status: 'APPROVED',
        createdAt: '2025-07-28T08:00:00.000Z',
      },
    ];
    jest.spyOn(api, 'getUserFeedback').mockResolvedValueOnce(mockData);
    render(<UserFeedbackList />);
    fireEvent.change(screen.getByTestId('user-id-input'), { target: { value: 'user123' } });
    fireEvent.click(screen.getByTestId('search-btn'));
    // Wait for the feedback list
    await waitFor(() => {
      // Use getByText for unique labels, but queryAllByText for numeric values
      expect(screen.getByText(/Product ID/)).toBeInTheDocument();
      expect(screen.getByText(/prod456/)).toBeInTheDocument();
      expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/APPROVED/)).toBeInTheDocument();
      expect(screen.getByText(/07\/28\/2025/)).toBeInTheDocument();
    });
  });

  test('testUserFeedbackListRendering: shows empty state when no results', async () => {
    jest.spyOn(api, 'getUserFeedback').mockRejectedValueOnce({ message: 'Not found' });
    render(<UserFeedbackList />);
    fireEvent.change(screen.getByTestId('user-id-input'), { target: { value: 'nouser' } });
    fireEvent.click(screen.getByTestId('search-btn'));
    await waitFor(() => {
      expect(screen.getByText(/No feedback found for this user/)).toBeInTheDocument();
    });
  });
});
