import { Location } from "history";
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { StaticContext } from "react-router";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import LoginButton from "../components/buttons/LoginButton";
import Warning from "../components/notifications/Warning";
import Success from "../components/notifications/Success";
import GradientBackground from "../components/GradientBackground";
import Logo from "../components/Logo";
import FadeInTransition from "../components/transitions/FadeInTransition";

/**
 * Properties that can be added on to the URL state. Frequently used with react-router's Redirect component.
 */
type LocationState = {
  referrer?: Location;
  success?: string;
  warning?: string;
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
  const authContext = useContext(AuthContext);
  const [redirectOnLogin, setRedirectOnLogin] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  return (
    <>
      {redirectOnLogin && (
        <Redirect to={props.location.state?.referrer ?? "/"} />
      )}

      <GradientBackground direction="to-bl">
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <FadeInTransition>
            <div className="max-w-md w-full">
              <div>
                <Logo className="mx-auto h-20 w-auto" />
              </div>
              <div>
                <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-white">
                  (Pretend to) Sign in to STAN
                </h2>
              </div>

              {showLoginSuccess && (
                <Success className="mt-8">Login Successful!</Success>
              )}

              {props.location.state?.success && !showLoginSuccess && (
                <Success className="mt-8">
                  {props.location.state.success}
                </Success>
              )}

              {props.location.state?.warning && !showLoginSuccess && (
                <Warning className="mt-8">
                  {props.location.state.warning}
                </Warning>
              )}

              <Formik
                initialValues={{
                  username: "",
                  password: "",
                }}
                onSubmit={(values, formikHelpers) => {
                  // Mocked it out for now
                  authContext.setAuthState({
                    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                    userInfo: { username: values.username },
                  });
                  setTimeout(() => {
                    setShowLoginSuccess(true);
                  }, 1000);
                  setTimeout(() => {
                    formikHelpers.setSubmitting(false);
                    setRedirectOnLogin(true);
                  }, 2500);
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
            </div>
          </FadeInTransition>
        </div>
      </GradientBackground>
    </>
  );
};

export default Login;
