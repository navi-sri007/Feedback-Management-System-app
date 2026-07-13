import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminFeedbackList from '../components/AdminFeedbackList';
import * as api from '../utils/api';
import { FEEDBACK_STATUS } from '../utils/constants';

describe('AdminFeedbackList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders table and action buttons for PENDING and non-PENDING', async () => {
    const data = [
      {
        id: 1,
        userId: 'user1',
        productId: 'prodA',
        rating: 5,
        comment: 'A good one',
        status: 'PENDING',
        createdAt: '2025-07-28T15:00:00.000Z',
      },
      {
        id: 2,
        userId: 'user2',
        productId: 'prodB',
        rating: 1,
        comment: 'Bad',
        status: 'APPROVED',
        createdAt: '2025-07-28T15:00:00.000Z',
      }
    ];
    jest.spyOn(api, 'getAllFeedback').mockResolvedValueOnce(data);
    render(<AdminFeedbackList />);
    await waitFor(() => {
      expect(screen.getByText(/All Feedback/)).toBeInTheDocument();
      expect(screen.getByTestId('approve-btn-1')).toBeInTheDocument();
      expect(screen.getByTestId('reject-btn-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-btn-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-btn-2')).toBeInTheDocument();
    });
  });

  test('approve workflow opens dialog and calls API', async () => {
    const data = [
      {
        id: 99,
        userId: 'userX',
        productId: 'prodX',
        rating: 2,
        comment: 'Needs review',
        status: 'PENDING',
        createdAt: '2025-07-28T17:00:00.000Z',
      }
    ];
    jest.spyOn(api, 'getAllFeedback').mockResolvedValueOnce(data);
    jest.spyOn(api, 'updateFeedbackStatus').mockResolvedValueOnce({ ...data[0], status: FEEDBACK_STATUS.APPROVED });
    render(<AdminFeedbackList />);
    // Wait for render and approve button
    await screen.findByTestId('approve-btn-99');
    fireEvent.click(screen.getByTestId('approve-btn-99'));
    await screen.findByTestId('modal-container');
    fireEvent.click(screen.getByTestId('confirm-btn'));
    await waitFor(() => {
      expect(api.updateFeedbackStatus).toHaveBeenCalledWith(99, FEEDBACK_STATUS.APPROVED);
      expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument();
    });
  });

  test('reject workflow opens dialog and calls API', async () => {
    const data = [
      {
        id: 77,
        userId: 'userY',
        productId: 'prodY',
        rating: 3,
        comment: 'Not bad.',
        status: 'PENDING',
        createdAt: '2025-07-28T18:00:00.000Z',
      }
    ];
    jest.spyOn(api, 'getAllFeedback').mockResolvedValueOnce(data);
    jest.spyOn(api, 'updateFeedbackStatus').mockResolvedValueOnce({ ...data[0], status: FEEDBACK_STATUS.REJECTED });
    render(<AdminFeedbackList />);
    // Wait for render and reject button
    await screen.findByTestId('reject-btn-77');
    fireEvent.click(screen.getByTestId('reject-btn-77'));
    await screen.findByTestId('modal-container');
    fireEvent.click(screen.getByTestId('confirm-btn'));
    await waitFor(() => {
      expect(api.updateFeedbackStatus).toHaveBeenCalledWith(77, FEEDBACK_STATUS.REJECTED);
      expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument();
    });
  });

  test('delete workflow opens dialog and calls API', async () => {
    const data = [
      {
        id: 55,
        userId: 'userDel',
        productId: 'prodDel',
        rating: 4,
        comment: 'To delete',
        status: 'PENDING',
        createdAt: '2025-07-28T18:00:00.000Z',
      }
    ];
    jest.spyOn(api, 'getAllFeedback').mockResolvedValueOnce(data);
    jest.spyOn(api, 'deleteFeedback').mockResolvedValueOnce(true);
    render(<AdminFeedbackList />);
    // Wait for render
    await screen.findByTestId('delete-btn-55');
    fireEvent.click(screen.getByTestId('delete-btn-55'));
    await screen.findByTestId('modal-container');
    fireEvent.click(screen.getByTestId('confirm-btn'));
    await waitFor(() => {
      expect(api.deleteFeedback).toHaveBeenCalledWith(55);
      expect(screen.queryByTestId('admin-feedback-item-55')).toBeNull();
    });
  });
});
