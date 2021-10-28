import { graphql } from "msw";
import {
  CurrentUserQuery,
  CurrentUserQueryVariables,
  LoginMutation,
  LoginMutationVariables,
  LogoutMutation,
  LogoutMutationVariables,
  UserRole,
} from "../../types/sdk";

const CURRENT_USER_KEY = "currentUser";

const userHandlers = [
  graphql.mutation<LoginMutation, LoginMutationVariables>(
    "Login",
    (req, res, ctx) => {
      const { username } = req.variables;
      sessionStorage.setItem(CURRENT_USER_KEY, username);
      return res(
        ctx.data({
          login: {
            user: {
              __typename: "User",
              username,
              role: UserRole.Normal,
            },
          },
        })
      );
    }
  ),

  graphql.mutation<LogoutMutation, LogoutMutationVariables>(
    "Logout",
    (req, res, ctx) => {
      sessionStorage.removeItem(CURRENT_USER_KEY);
      return res(
        ctx.data({
          logout: "OK",
        })
      );
    }
  ),

  graphql.query<CurrentUserQuery, CurrentUserQueryVariables>(
    "CurrentUser",
    (req, res, ctx) => {
      const currentUser = sessionStorage.getItem(CURRENT_USER_KEY);

      // By default we want the user to be logged in.
      // If this is the first request, currentUser won't be set yet.
      if (!currentUser) {
        sessionStorage.setItem(CURRENT_USER_KEY, "jb1");
        return res(
          ctx.data({
            user: {
              __typename: "User",
              username: "jb1",
              role: UserRole.Normal,
            },
          })
        );
      } else {
        return res(
          ctx.data({
            user: {
              __typename: "User",
              username: currentUser,
              role: UserRole.Normal,
            },
          })
        );
      }
    }
  ),
];

export default userHandlers;
