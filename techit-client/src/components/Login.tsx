import { FormikValues, useFormik } from "formik";
import { FunctionComponent, useState } from "react";
import { checkUser } from "../services/usersService";
import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import { loginSchema } from "../utils/validationSchemas";

interface LoginProps {}

const Login: FunctionComponent<LoginProps> = () => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await checkUser(values);
        localStorage.setItem("token", JSON.stringify(res.data));
        navigate("/home");
      } catch (err: any) {
        const errorMessage = err.response?.data || "אימייל או סיסמה שגויים";
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h2 className="card-title text-info">
                    <i className="fas fa-laptop me-2"></i>
                    TechIt
                  </h2>
                  <p className="text-muted">התחבר לחשבון שלך</p>
                </div>

                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      כתובת אימייל
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className={`form-control ${
                          formik.touched.email && formik.errors.email
                            ? "is-invalid"
                            : formik.touched.email
                            ? "is-valid"
                            : ""
                        }`}
                        id="email"
                        name="email"
                        placeholder="הכנס את האימייל שלך"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <div className="text-danger mt-1">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {formik.errors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      סיסמה
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : formik.touched.password
                            ? "is-valid"
                            : ""
                        }`}
                        id="password"
                        name="password"
                        placeholder="הכנס את הסיסמה שלך"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <div className="text-danger mt-1">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {formik.errors.password}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-info w-100 mb-3"
                    type="submit"
                    disabled={!formik.isValid || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        מתחבר...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        התחבר
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      עדיין אין לך חשבון?{" "}
                      <Link to="/register" className="text-info text-decoration-none">
                        הירשם עכשיו
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;