// utils/errorHelper.js

export const getErrorMessage = (error) => {
  // 1. Check for the specific array structure you mentioned
  const arrayMessage = error?.response?.data?.errors?.[0]?.message;
  
  // 2. Check for a standard message field
  const standardMessage = error?.response?.data?.message;

  // 3. Check for a top-level axios error message
  const axiosMessage = error?.message;

  return arrayMessage || standardMessage || axiosMessage || "Something went wrong";
};