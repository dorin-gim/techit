import { FunctionComponent } from "react";
import { NavigateFunction, NavLink, useNavigate } from "react-router-dom";

interface NavbarProps {}

const Navbar: FunctionComponent<NavbarProps> = () => {
  const navigate: NavigateFunction = useNavigate();
  
  return (
    <>
      <nav
        className="navbar navbar-expand-lg bg-dark text-light"
        data-bs-theme="dark"
      >
        <div className="container-fluid">
          <NavLink className="navbar-brand text-info" to="/home">
            <i className="fas fa-laptop me-2"></i>
            TechIt
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/home">
                  <i className="fas fa-home me-1"></i>
                  בית
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to="/products"
                >
                  <i className="fas fa-box me-1"></i>
                  מוצרים
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/cart">
                  <i className="fas fa-shopping-cart me-1"></i>
                  עגלה
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/favorites">
                  <i className="fas fa-heart me-1"></i>
                  מועדפים
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/about">
                  <i className="fas fa-info-circle me-1"></i>
                  אודות
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/profile">
                  <i className="fas fa-user me-1"></i>
                  פרופיל
                </NavLink>
              </li>
            </ul>
            <form className="d-flex" role="search">
              <button
                className="btn btn-outline-info"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                  localStorage.removeItem("token");
                }}
              >
                <i className="fas fa-sign-out-alt me-1"></i>
                התנתק
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;