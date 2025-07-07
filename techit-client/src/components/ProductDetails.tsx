import { FunctionComponent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { Product } from "../interfaces/Product";
import { getProductById } from "../services/productsService";
import { addToCart } from "../services/cartsService";
import FavoriteButton from "./FavoriteButton";
import { getPayloadFromToken } from "../services/usersService";

interface ProductDetailsProps {}

const ProductDetails: FunctionComponent<ProductDetailsProps> = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    // בדיקה אם מנהל
    if (localStorage.getItem("token")) {
      try {
        const payload = getPayloadFromToken();
        setIsAdmin(payload.isAdmin);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!productId) {
      setError("מזהה מוצר לא תקין");
      setLoading(false);
      return;
    }

    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProductById(productId as string);
      setProduct(response.data);
    } catch (err: any) {
      console.error("Error loading product:", err);
      setError("שגיאה בטעינת המוצר");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      await addToCart(product._id as string);
      alert(`${product.name} נוסף לעגלה בהצלחה!`);
    } catch (error: any) {
      alert("שגיאה בהוספה לעגלה");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBackToProducts = () => {
    navigate("/products");
  };

  if (loading) {
    return (
      <Layout title="טוען מוצר...">
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-3 text-muted">טוען פרטי מוצר...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout title="שגיאה">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-5x text-warning mb-4"></i>
          <h4 className="text-muted">{error || "מוצר לא נמצא"}</h4>
          <p className="text-muted">לא הצלחנו למצוא את המוצר שחיפשת</p>
          <button className="btn btn-primary" onClick={handleBackToProducts}>
            <i className="fas fa-arrow-right me-2"></i>
            חזור לרשימת המוצרים
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={product.name}>
      {/* כפתור חזרה */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary" onClick={handleBackToProducts}>
          <i className="fas fa-arrow-right me-2"></i>
          חזור לרשימת המוצרים
        </button>
      </div>

      <div className="row">
        {/* תמונת המוצר */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <img
              src={product.image}
              className="card-img-top"
              alt={`תמונה של ${product.name}`}
              style={{ height: "400px", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=תמונה+לא+זמינה";
              }}
            />
            {!product.available && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                   style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
                <span className="badge bg-danger fs-4">אזל מהמלאי</span>
              </div>
            )}
          </div>
        </div>

        {/* פרטי המוצר */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                פרטי המוצר
              </h5>
            </div>
            <div className="card-body">
              {/* שם המוצר */}
              <h2 className="card-title text-primary mb-3">{product.name}</h2>

              {/* קטגוריה */}
              <div className="mb-3">
                <span className="badge bg-info fs-6">
                  <i className="fas fa-tag me-1"></i>
                  {product.category}
                </span>
              </div>

              {/* מחיר */}
              <div className="mb-4">
                <h3 className="text-success mb-0">
                  <i className="fas fa-shekel-sign me-2"></i>
                  {product.price.toLocaleString()}
                </h3>
                <small className="text-muted">מחיר כולל מע"ם</small>
              </div>

              {/* זמינות */}
              <div className="mb-4">
                <h6>זמינות:</h6>
                {product.available ? (
                  <span className="badge bg-success fs-6">
                    <i className="fas fa-check-circle me-1"></i>
                    זמין במלאי
                  </span>
                ) : (
                  <span className="badge bg-danger fs-6">
                    <i className="fas fa-times-circle me-1"></i>
                    אזל מהמלאי
                  </span>
                )}
              </div>

              {/* תיאור */}
              <div className="mb-4">
                <h6>תיאור המוצר:</h6>
                <p className="text-muted">{product.description}</p>
              </div>

              {/* כמות במלאי (רק למנהלים) */}
              {isAdmin && (
                <div className="mb-4">
                  <h6>כמות במלאי:</h6>
                  <span className="badge bg-secondary fs-6">
                    {product.quantity || 0} יחידות
                  </span>
                </div>
              )}

              {/* כפתורי פעולה */}
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-primary flex-grow-1"
                  onClick={handleAddToCart}
                  disabled={!product.available || addingToCart}
                  style={{ minWidth: "150px" }}
                >
                  {addingToCart ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      מוסיף...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cart-plus me-2"></i>
                      {product.available ? "הוסף לעגלה" : "אזל מהמלאי"}
                    </>
                  )}
                </button>

                <FavoriteButton 
                  productId={product._id as string}
                  className="btn btn-outline-danger"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* מידע נוסף */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                מידע נוסף
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-truck text-info me-2"></i>
                    <div>
                      <h6 className="mb-0">משלוח חינם</h6>
                      <small className="text-muted">לכל הארץ</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-shield-alt text-success me-2"></i>
                    <div>
                      <h6 className="mb-0">אחריות יצרן</h6>
                      <small className="text-muted">2 שנים</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-undo text-warning me-2"></i>
                    <div>
                      <h6 className="mb-0">החזרה</h6>
                      <small className="text-muted">30 יום</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* המלצות (מדומה) */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-star text-warning me-2"></i>
                מוצרים דומים
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-0">
                <i className="fas fa-lightbulb me-2"></i>
                רוצה לראות מוצרים דומים? עבור ל
                <button 
                  className="btn btn-link p-0 mx-2"
                  onClick={handleBackToProducts}
                >
                  רשימת המוצרים
                </button>
                וסנן לפי קטגוריה "{product.category}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;