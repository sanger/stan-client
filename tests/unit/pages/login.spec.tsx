import { describe } from '@jest/globals';
import { render, fireEvent, screen, act, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../src/pages/Login';
import '@testing-library/jest-dom';

describe('Login page', () => {
  describe('When the page loads', () => {
    it('should render the login form', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );
      expect(screen.getByTestId('username')).toBeVisible();
      expect(screen.getByTestId('password')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Register' })).toBeVisible();
    });
  });
  describe('When fields are not filled', () => {
    it('displays error message', async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Register' }));
      });
      await waitFor(async () => {
        expect(screen.getByText('Username is required')).toBeVisible();
        expect(screen.getByText('Password is required')).toBeVisible();
      });
    });
  });
});
