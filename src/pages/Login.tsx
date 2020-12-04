import { Location } from "history";
import React, { useContext, useEffect, useState } from "react";
import { authContext } from "../context/AuthContext";
import { Link, Redirect, RouteComponentProps } from "react-router-dom";
import { StaticContext } from "react-router";
import {
  ErrorMessage,
  Field,
  Form,
  Formik,
  FormikHelpers,
  FormikValues,
} from "formik";
import * as Yup from "yup";
import LoginButton from "../components/buttons/LoginButton";
import Warning from "../components/notifications/Warning";
import Success from "../components/notifications/Success";
import Logo from "../components/Logo";
import { useApolloClient } from "@apollo/client";
import { useLoginMutation } from "../types/graphql";
import { motion } from "framer-motion";

/**
 * Properties that can be added on to the URL state. Frequently used with react-router's Redirect component.
 */
type LocationState = {
  referrer?: Location;
  success?: string;
  warning?: string;
  loggedOut?: boolean;
};

/**
 * Schema used by Formik in the login form.
 */
const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = (
  props: RouteComponentProps<{}, StaticContext, LocationState>
): JSX.Element => {
  const auth = useContext(authContext);

  // If the user was redirected here because they were logged in, and then their session expired, clear the AuthState
  useEffect(() => {
    if (props.location?.state?.loggedOut) {
      auth.clearAuthState();
    }
  }, [auth, props.location]);

  const [login] = useLoginMutation();
  const client = useApolloClient();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formInitialValues = {
    username: "",
    password: "",
  };

  const submitCredentials = async (
    credentials: FormikValues,
    formikHelpers: FormikHelpers<typeof formInitialValues>
  ) => {
    try {
      setErrorMessage(null);

      const { data, errors } = await login({
        variables: {
          username: credentials.username,
          password: credentials.password,
        },
      });

      if (errors) {
        setErrorMessage(errors.join("\n"));
        formikHelpers.setSubmitting(false);
        return;
      }

      if (!data?.login?.user?.username) {
        setErrorMessage("Username or password is incorrect");
        formikHelpers.setSubmitting(false);
        return;
      }

      // Queries are cached by Apollo into its store so it's important to clear it after login state changes
      // See https://www.apollographql.com/docs/react/networking/authentication/#reset-store-on-logout
      await client.clearStore();
      setShowLoginSuccess(true);
      const userInfo = data.login.user;

      // Allow some time for the user to see the success message before redirecting
      setTimeout(() => {
        auth.setAuthState({
          userInfo,
        });
        formikHelpers.setSubmitting(false);
      }, 2500);
    } catch (e) {
      setErrorMessage(e.message);
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <>
      {auth.isAuthenticated() && (
        <Redirect to={props.location.state?.referrer ?? "/"} />
      )}

      <div className="bg-gradient-to-bl from-sdb to-sdb-400">
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0.1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full"
          >
            <div>
              <Link to="/">
                <Logo className="mx-auto h-20 w-auto" />
              </Link>
            </div>
            <div>
              <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-white">
                Sign in to STAN
              </h2>
            </div>

            {showLoginSuccess && (
              <Success message={"Login Successful!"} className="mt-8" />
            )}

            {props.location.state?.success &&
              !showLoginSuccess &&
              errorMessage == null && (
                <Success
                  message={props.location.state.success}
                  className="mt-8"
                />
              )}

            {props.location.state?.warning &&
              !showLoginSuccess &&
              errorMessage == null && (
                <Warning
                  className="mt-8"
                  message={props.location.state.warning}
                />
              )}

            {errorMessage && (
              <Warning className="mt-8" message={errorMessage} />
            )}

            <Formik
              initialValues={formInitialValues}
              onSubmit={(values, formikHelpers) => {
                submitCredentials(values, formikHelpers);
              }}
              validationSchema={LoginSchema}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {(formik) => (
                <Form className="mt-8">
                  <ErrorMessage name="username" />
                  <ErrorMessage name="password" />
                  <div className="rounded-md shadow-sm">
                    <div>
                      <Field
                        aria-label="Sanger username"
                        name="username"
                        type="text"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
                        placeholder="Sanger username"
                      />
                    </div>
                  </div>

                  <div className="-mt-px">
                    <Field
                      aria-label="Password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
                      placeholder="Password"
                    />
                  </div>

                  <div className="mt-6">
                    <LoginButton loading={formik.isSubmitting}>
                      Sign In
                    </LoginButton>
                  </div>
                </Form>
              )}
            </Formik>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
