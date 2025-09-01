import { graphql, HttpResponse } from 'msw';
import {
  AddUserMutation,
  AddUserMutationVariables,
  CurrentUserQuery,
  CurrentUserQueryVariables,
  LoginMutation,
  LoginMutationVariables,
  LogoutMutation,
  LogoutMutationVariables,
  RegisterAsEndUserMutation,
  RegisterAsEndUserMutationVariables,
  SetUserRoleMutation,
  SetUserRoleMutationVariables,
  UserRole
} from '../../types/sdk';
import userFactory from '../../lib/factories/userFactory';
import userRepository from '../repositories/userRepository';

const CURRENT_USER_KEY = 'currentUser';

const userHandlers = [
  graphql.mutation<LoginMutation, LoginMutationVariables>('Login', ({ variables }) => {
    const { username } = variables;
    sessionStorage.setItem(CURRENT_USER_KEY, username);
    return HttpResponse.json({
      data: {
        login: {
          user: {
            __typename: 'User',
            username,
            role: UserRole.Normal
          }
        }
      }
    });
  }),

  graphql.mutation<LogoutMutation, LogoutMutationVariables>('Logout', () => {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    return HttpResponse.json({ data: { logout: 'OK' } });
  }),

  graphql.query<CurrentUserQuery, CurrentUserQueryVariables>('CurrentUser', () => {
    const currentUser = sessionStorage.getItem(CURRENT_USER_KEY);

    // By default we want the user to be logged in.
    // If this is the first request, currentUser won't be set yet.
    if (!currentUser) {
      sessionStorage.setItem(CURRENT_USER_KEY, 'jb1');
      return HttpResponse.json({
        data: {
          user: {
            __typename: 'User',
            username: 'jb1',
            role: UserRole.Admin
          }
        }
      });
    } else {
      return HttpResponse.json({
        data: {
          user: {
            __typename: 'User',
            username: currentUser,
            role: UserRole.Admin
          }
        }
      });
    }
  }),

  graphql.mutation<AddUserMutation, AddUserMutationVariables>('AddUser', ({ variables }) => {
    const addUser = userFactory.build({
      username: variables.username
    });
    userRepository.save(addUser);
    return HttpResponse.json({ data: { addUser } }, { status: 200 });
  }),

  graphql.mutation<SetUserRoleMutation, SetUserRoleMutationVariables>('SetUserRole', ({ variables }) => {
    const user = userRepository.find('username', variables.username);
    if (user) {
      user.role = variables.role;
      userRepository.save(user);
      return HttpResponse.json({ data: { setUserRole: user } }, { status: 200 });
    } else {
      return HttpResponse.json(
        { errors: [{ message: `Could not find user: "${variables.username}"` }] },
        { status: 404 }
      );
    }
  }),

  graphql.mutation<RegisterAsEndUserMutation, RegisterAsEndUserMutationVariables>(
    'RegisterAsEndUser',
    ({ variables }) => {
      const { username } = variables;
      sessionStorage.setItem(CURRENT_USER_KEY, username);
      return HttpResponse.json({
        data: {
          registerAsEndUser: {
            user: {
              __typename: 'User',
              username,
              role: UserRole.Enduser
            }
          }
        }
      });
    }
  )
];

export default userHandlers;
