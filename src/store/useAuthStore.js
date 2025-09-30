import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      authToken: '',
      isAuthenticated: false,
      userEmail: '',
      userName: '',
      userInst: '',
      currentSurveyId: '',
      currentFormId: '',
      signupEmail: '',
      isLogoutVisible: false,
      surveys: [],
      notifications: [],
      hasPaid: false,

      // Action to set authentication data after successful login
      setAuthData: (token, email, name, inst) => {
        set({ authToken: token, isAuthenticated: true, userEmail: email, userName: name, userInst: inst, });
      },

      setSignupEmail: (email) => {
        set({ signupEmail: email })
      },

      setSurveyId: (surveyId) => {
        set({ currentSurveyId: surveyId });
      },
      setFormId: (formId) => {
        set({ currentFormId: formId });
      },
      setSurveys: (fetchedSurveys) => {
        set({ surveys: fetchedSurveys });
      },
      setNotifications: (fetchedNotifications) => {
        set({ notifications: fetchedNotifications });
      },
      // Actions for logout confirmation
      showLogoutConfirmation: () => set({ isLogoutVisible: true }),
      hideLogoutConfirmation: () => set({ isLogoutVisible: false }),
     // check payment status
     setHasPaid: (haspaid) => {
      set({ hasPaid: haspaid})
     },
      // Action to clear user data on logout
      logout: () => {
        set({ authToken: '', isAuthenticated: false, userEmail: '', userName: '', currentSurveyId: '', currentFormId: '' });
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      // Only store the essential authentication data in localStorage
      partialize: (state) => ({ 
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
        userEmail: state.userEmail,
        userName: state.userName,
        userInst: state.userInst,
        currentFormId: state.currentFormId
      })
    }
  )
);

export default useAuthStore;


