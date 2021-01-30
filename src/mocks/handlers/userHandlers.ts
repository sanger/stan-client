import { graphql } from "msw";
import {
  CurrentUserQuery,
  CurrentUserQueryVariables,
  LoginMutation,
  LoginMutationVariables,
  LogoutMutation,
  LogoutMutationVariables,
} from "../../types/graphql";

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
              username,
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
              username: "jb1",
            },
          })
        );
      } else {
        return res(
          ctx.data({
            user: {
              username: currentUser,
            },
          })
        );
      }
    }
  ),
];

export default userHandlers;
