import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ErrorMessage, Field, Form, Formik, FormikHelpers, FormikValues } from 'formik';
import * as Yup from 'yup';
import LoginButton from '../components/buttons/LoginButton';
import Warning from '../components/notifications/Warning';
import Success from '../components/notifications/Success';
import Logo from '../components/Logo';
import { motion } from '../dependencies/motion';
import { extractServerErrors } from '../types/stan';
import { StanCoreContext } from '../lib/sdk';
import { ClientError } from 'graphql-request';
import RegisterButton from '../components/buttons/RegisterButton';

/**
 * Schema used by Formik in the login form.
 */
const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  isSelfRegistration: Yup.boolean()
});

const Login = (): JSX.Element => {
  const auth = useAuth();
  let location = useLocation();
  // If the user was redirected here because they were logged in, and then their session expired, clear the AuthState
  useEffect(() => {
    if (location?.state?.loggedOut) {
      auth.clearAuthState();
    }
  }, [auth, location]);

  const stanCore = useContext(StanCoreContext);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formInitialValues = {
    username: '',
    password: '',
    isSelfRegistration: false
  };

  const submitCredentials = async (
    credentials: FormikValues,
    formikHelpers: FormikHelpers<typeof formInitialValues>
  ) => {
    try {
      setErrorMessage(null);

      const { user } = credentials.isSelfRegistration
        ? await stanCore
            .RegisterAsEndUser({
              username: credentials.username,
              password: credentials.password
            })
            .then((response) => {
              return response.registerAsEndUser;
            })
        : await stanCore
            .Login({
              username: credentials.username,
              password: credentials.password
            })
            .then((response) => {
              return response.login;
            });

      if (!user) {
        setErrorMessage(
          credentials.isSelfRegistration
            ? `LDAP check failed for ${credentials.username}`
            : 'Username or password is incorrect'
        );
        formikHelpers.setSubmitting(false);
        return;
      }

      setSuccessMessage(credentials.isSelfRegistration ? 'Successfully registered as End User!' : 'Login Successful!');
      // Allow some time for the user to see the success message before redirecting
      setTimeout(() => {
        auth.setAuthState({
          user: user!
        });
        formikHelpers.setSubmitting(false);
      }, 1500);
    } catch (e) {
      setErrorMessage(extractServerErrors(e as ClientError).message);
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <>
      {auth.isAuthenticated() && <Navigate to={location.state?.referrer ?? '/'} />}

      <div className="bg-linear-to-bl from-sdb via-sdb-400 to-sdb-400">
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0.1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full"
          >
            <div>
              <Link to="/">
                <Logo className="mx-auto h-20" />
              </Link>
            </div>
            <div>
              <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-white">Sign in to STAN</h2>
            </div>

            {successMessage && <Success message={successMessage} className="mt-8" />}

            {location.state?.success && !successMessage && errorMessage == null && (
              <Success message={location.state.success} className="mt-8" />
            )}

            {location.state?.warning && !successMessage && errorMessage == null && (
              <Warning className="mt-8" message={location.state.warning} />
            )}

            {errorMessage && <Warning className="mt-8" message={errorMessage} />}

            <Formik
              initialValues={formInitialValues}
              onSubmit={(values, formikHelpers) => submitCredentials(values, formikHelpers)}
              validationSchema={LoginSchema}
            >
              {(formik) => (
                <Form className="mt-8">
                  <ErrorMessage
                    component="div"
                    name="username"
                    className="items-start justify-between border-l-4 border-orange-600 p-2 bg-orange-200 text-orange-800"
                  />
                  <ErrorMessage
                    component="div"
                    name="password"
                    className="items-start justify-between border-l-4 border-orange-600 p-2 bg-orange-200 text-orange-800"
                  />
                  <div className="rounded-md shadow-xs">
                    <div>
                      <Field
                        data-testid="username"
                        aria-label="Sanger username"
                        name="username"
                        type="text"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md
                        focus:outline-hidden focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
                        placeholder="Sanger username"
                      />
                    </div>
                  </div>

                  <div className="-mt-px">
                    <Field
                      data-testid="password"
                      aria-label="Password"
                      name="password"
                      type="password"
                      className="appearance-none rounded-none relative block w-full px-3 py-2 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-hidden focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
                      placeholder="Password"
                    />
                  </div>

                  <div className="mt-6">
                    <LoginButton loading={formik.isSubmitting} data-testid="signIn" disabled={formik.isSubmitting}>
                      Sign In <span className=" ml-2"> (Existing User)</span>
                    </LoginButton>
                  </div>
                  <div className="m-3 text-white text-center">OR</div>
                  <div className="">
                    <RegisterButton
                      disabled={formik.isSubmitting}
                      data-testid="register"
                      loading={formik.isSubmitting}
                      onClick={() => formik.setFieldValue('isSelfRegistration', true)}
                    >
                      Register <span className=" ml-2"> (New User)</span>
                    </RegisterButton>
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
