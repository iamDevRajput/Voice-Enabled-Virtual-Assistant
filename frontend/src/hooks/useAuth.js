import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { userDataContext } from "../context/UserContext";
import { authService } from "../services/auth.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const AUTH_STATES = {
  IDLE: "IDLE",
  VALIDATING: "VALIDATING", // Zod is running
  SUBMITTING: "SUBMITTING", // API is running
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};

export const useAuth = () => {
  const [authState, setAuthState] = useState(AUTH_STATES.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const abortControllerRef = useRef(null);
  
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  // Cleanup pending requests if component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleAuthAction = useCallback(async (actionType, data) => {
    if (authState === AUTH_STATES.SUBMITTING) return; // Prevent double click / race conditions

    setAuthState(AUTH_STATES.SUBMITTING);
    setErrorMsg("");
    
    // Create new abort controller for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      let result;
      if (actionType === "login") {
        result = await authService.login(serverUrl, data, abortControllerRef.current.signal);
        toast.success(`Welcome back, ${result.name}!`);
        setUserData(result);
        setAuthState(AUTH_STATES.SUCCESS);
        navigate("/");
      } else if (actionType === "signup") {
        result = await authService.signup(serverUrl, data, abortControllerRef.current.signal);
        toast.success("Account created successfully!");
        setUserData(result);
        setAuthState(AUTH_STATES.SUCCESS);
        navigate("/customize");
      }
    } catch (error) {
      // Ignore AbortError since it's an intentional cancellation
      if (error.name === "CanceledError" || error.message.includes("canceled")) {
        setAuthState(AUTH_STATES.IDLE);
        return;
      }

      setAuthState(AUTH_STATES.ERROR);
      setUserData(null);
      
      const message = error.response?.data?.message || "An unexpected error occurred. Please try again.";
      setErrorMsg(message);
      
      // Toast handles global network errors, but we can also toast specific form errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
         toast.error(message);
      }
    }
  }, [authState, navigate, serverUrl, setUserData]);

  const login = (data) => handleAuthAction("login", data);
  const signup = (data) => handleAuthAction("signup", data);

  const logout = async () => {
    try {
      await authService.logout(serverUrl);
      toast.success("Logged out successfully");
    } catch (e) {
      console.warn("Logout error", e);
    } finally {
      setUserData(null);
      navigate("/signin");
    }
  };

  return {
    authState,
    errorMsg,
    login,
    signup,
    logout,
    isSubmitting: authState === AUTH_STATES.SUBMITTING,
  };
};
