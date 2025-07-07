import { FunctionComponent, useEffect, useState } from "react";
import { Product } from "../interfaces/Product";
import { getProductsFromCart } from "../services/cartsService";
import Layout from "./Layout";

interface CartProps {}

const Cart: FunctionComponent<CartProps> = () => {
  let [products, setProducts] = useState<any>([]);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    getProductsFromCart()
      .then((res: any) => {
        let products = res.map((item: any) => item.data);
        setProducts(products);
        setError(null);
      })
      .catch(() => {
        setError("שגיאה בטעינת עגלת הקניות");
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout title="עגלת הקניות שלי">
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-2 text-muted">טוען עגלת קניות...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="עגלת הקניות שלי">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4 className="text-muted">{error}</h4>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            נסה שוב
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="עגלת הקניות שלי">
      {products.length ? (
        <div className="row">
          {products.map((p: any) => (
            <div key={p.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text text-success fw-bold">₪{p.price}</p>
                  <button className="btn btn-danger btn-sm">
                    <i className="fas fa-trash me-1"></i>הסר
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="col-12 mt-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h5>סה"כ לתשלום</h5>
                <h3 className="text-success">
                  ₪{products.reduce((sum: number, p: any) => sum + p.price, 0)}
                </h3>
                <button className="btn btn-success btn-lg">
                  <i className="fas fa-credit-card me-2"></i>
                  המשך לתשלום
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-shopping-cart fa-5x text-muted mb-4"></i>
          <h4 className="text-muted">העגלה ריקה</h4>
          <p className="text-muted">הוסף מוצרים כדי להתחיל לקנות</p>
          <a href="/products" className="btn btn-primary">
            <i className="fas fa-shopping-bag me-2"></i>
            התחל לקנות
          </a>
        </div>
      )}
    </Layout>
  );
};

export default Cart;