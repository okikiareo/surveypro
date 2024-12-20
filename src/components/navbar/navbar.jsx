import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import iconBell from "../../assets/img/icon-bell.svg";
import iconUser from "../../assets/img/icon-user.svg";
import iconLogOut from "../../assets/img/icon-logout.svg";
import useAuthStore from "../store/useAuthStore";
import "./navbar.css";

const Navbar = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { userName, showLogoutConfirmation,  isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  // Log out
  // const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // console.log("Auth state changed:", isAuthenticated);
    // const token = localStorage.getItem("token");
    // setIsLoggedIn(!!token);


    // const token = localStorage.getItem("token");
    // if (token) {
    //   setIsLoggedIn(true); // Assume logged in if token exists
    // } else {
    //   setIsLoggedIn(false);
    // }
  }, [isAuthenticated]);

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   setIsLoggedIn(false);
  //   navigate("/signin");
  //   logout();
  // };

  return (
    <header className={`header${isAuthenticated ? " header-logged" : ""}`}>
      <div className="header-wrap wrap">
        <div className="header-w1">
          <button className="header-w1-menu">
            <div className="header-w1-line" aria-hidden></div>
            <div className="header-w1-line" aria-hidden></div>
            <div className="header-w1-line" aria-hidden></div>
          </button>
          <NavLink className="header-w1-logo" to="/">
            SURVEYPRO
            <div className="header-w1-circ" aria-hidden></div>
          </NavLink>
        </div>
        <div className="header-w2">
          <ul className="header-w2-list">
            <li className="header-w2-item hide">
              <NavLink className="header-w2-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="header-w2-item hide">
              <NavLink className="header-w2-link" to="/">
                About Us
              </NavLink>
            </li>
            {isAuthenticated  && (
              <>
                <li className="header-w2-item show header-w2-hide">
                  <NavLink className="header-w2-link" to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="header-w2-item show header-w2-hide">
                  <NavLink className="header-w2-link" to="/postsurvey">
                    Post Survey
                  </NavLink>
                </li>
              </>
            )}
            {!isAuthenticated  && (
              <>
                <li className="header-w2-item hide">
                  <NavLink className="header-w2-link" to="/signin">
                    Log In
                  </NavLink>
                </li>
                <li className="header-w2-item hide header-w2-main">
                  <NavLink className="header-w2-link" to="/signup">
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
        {isAuthenticated  && (
          <div className="header-w3 show">
            <button className="header-w3-bell" onClick={() => navigate('/notifications')}>
              <img className="header-w3-icon" src={iconBell} alt="bell" />
            </button>
            <button className="header-w3-chip" onClick={() => navigate('/profile')}>
              <div className="header-w3-user">
                <img className="header-w3-icon" src={iconUser} alt="user" />
              </div>
              {userName}
            </button>
            <button className="header-w3-link" onClick={showLogoutConfirmation}>
              <img className="header-w3-icon" src={iconLogOut} alt="logout" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar;
