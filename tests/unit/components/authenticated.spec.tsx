import { render, screen, cleanup } from '@testing-library/react';
import { describe } from '@jest/globals';
import { Authenticated } from '../../../src/components/Authenticated';
import { UserRole } from '../../../src/types/sdk';

afterEach(() => {
  cleanup();
});

/* 
  Here we are mocking useAuth() because its used
  in the authenticated component and we don't want
  to set up all the auth context here

  There might be a better way to get different mock responses
  but after a bit of digging this seems sufficient.
  This does cause a small inter dependency between tests though
*/

jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: jest
    .fn()
    // Authenticated component calls
    .mockImplementationOnce(() => {
      return {
        isAuthenticated: () => false,
        userRoleIncludes: (role: UserRole) => true
      };
    })
    .mockImplementationOnce(() => {
      return {
        isAuthenticated: () => true,
        userRoleIncludes: (role: UserRole) => false
      };
    })
    .mockImplementationOnce(() => {
      return {
        isAuthenticated: () => false,
        userRoleIncludes: (role: UserRole) => false
      };
    })
    // Unauthenticated component calls
    .mockImplementationOnce(() => {
      return {
        isAuthenticated: () => true,
        userRoleIncludes: (role: UserRole) => true
      };
    })
    .mockImplementationOnce(() => {
      return {
        isAuthenticated: () => false,
        userRoleIncludes: (role: UserRole) => true
      };
    })
}));

describe('Authenticated.tsx', () => {
  describe('Authenticated', () => {
    it('displays the child component if the role is included in authorised roles', () => {
      const authProps = {
        role: UserRole.Admin,
        children: <h1>Child component!</h1>
      };

      render(<Authenticated {...authProps} />);
      expect(screen.getByText('Child component!')).toBeInTheDocument();
    });

    it('displays the child component if no role is passed but isAuthenticated is true', () => {
      const authProps = {
        children: <h1>Child component!</h1>
      };

      render(<Authenticated {...authProps} />);
      expect(screen.getByText('Child component!')).toBeInTheDocument();
    });

    it('the role is invalid and the user is not authenticated it returns nothing', () => {
      const authProps = {
        role: UserRole.Disabled,
        children: <h1>Child component!</h1>
      };
      render(<Authenticated {...authProps} />);
      /* 
        Because we dont expect to find this text we use queryByText
        instead of getByText as that will through an error before validation
      */
      expect(screen.queryByText('Child component!')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated', () => {
    it('displays the child component if isAuthenticated is true', () => {
      const authProps = {
        children: <h1>Child component!</h1>
      };

      render(<Authenticated {...authProps} />);
      expect(screen.getByText('Child component!')).toBeInTheDocument();
    });

    it('doesnt display the child component if isAuthenticated is false', () => {
      const authProps = {
        children: <h1>Child component!</h1>
      };

      render(<Authenticated {...authProps} />);
      expect(screen.queryByText('Child component!')).not.toBeInTheDocument();
    });
  });
});
