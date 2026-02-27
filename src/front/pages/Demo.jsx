// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.

export const Demo = () => {
  // Access the global state and dispatch function using the useGlobalReducer hook.
  const { store, dispatch } = useGlobalReducer()

  return (
          <div className="flex flex-col items-center justify-center bg-gray-100 p-6">
            <p>ESTA PÁGINA SOLO SE MUESTRA SI ESTAS LOGEADO</p>
            <p>Tu token es: {store.token}</p>
            <p>Tu email es: {store.user.email}</p>
            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={() => dispatch({ type: "logout" })}>
              Logout
            </button>
          </div>
  );
};
