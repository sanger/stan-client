import { describe } from '@jest/globals';
import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
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
      expect(screen.getByRole('button', { name: 'Sign In (Existing User)' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Register (New User)' })).toBeVisible();
    });
  });
  describe('Register New user', () => {
    describe('When the form is not filled', () => {
      it('displays error message', async () => {
        render(
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        );
        act(() => {
          fireEvent.click(screen.getByRole('button', { name: 'Register (New User)' }));
        });
        await waitFor(async () => {
          expectToDisplayErrorMessage();
        });
      });
    });
  });
  describe('Sign in existing user', () => {
    describe('When the form is not filled', () => {
      it('displays error message', async () => {
        render(
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        );
        act(() => {
          fireEvent.click(screen.getByRole('button', { name: 'Sign In (Existing User)' }));
        });
        await waitFor(async () => {
          expectToDisplayErrorMessage();
        });
      });
    });
  });
});

const expectToDisplayErrorMessage = () => {
  expect(screen.getByText('Username is required')).toBeVisible();
  expect(screen.getByText('Password is required')).toBeVisible();
};
