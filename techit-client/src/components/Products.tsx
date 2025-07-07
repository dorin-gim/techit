import { FunctionComponent, useEffect, useState } from "react";
import { Product } from "../interfaces/Product";
import { getAllProducts } from "../services/productsService";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SearchBar from "./SearchBar";
import { getPayloadFromToken } from "../services/usersService";
import AddProductModal from "./AddProductModal";
import UpdateProductModal from "./UpdateProductModal";
import DeleteProductModal from "./DeleteProductModal";
import FavoriteButton from "./FavoriteButton";
import { addToCart } from "../services/cartsService";
import { Link } from "react-router-dom";

interface ProductsProps {}

type ViewMode = 'cards' | 'table';

const Products: FunctionComponent<ProductsProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [productsChanged, setProductsChanged] = useState<boolean>(false);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [productId, setProductId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState<string>("");

  // קבלת קטגוריות ייחודיות
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  useEffect(() => {
    // בדיקה אם מנהל
    if (localStorage.getItem("token") != null) {
      let payload = getPayloadFromToken();
      setIsAdmin(payload.isAdmin);
    }
  }, []);

  useEffect(() => {
    getAllProducts()
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch((err) => {
        // טיפול שקט בשגיאות - ניתן להוסיף התראה למשתמש
        setProducts([]);
        setFilteredProducts([]);
      });
  }, [productsChanged]);

  // פילטור מוצרים לפי חיפוש וקטגוריה
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.available;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAddProduct = () => {
    setOpenAddModal(true);
  };

  const refresh = () => {
    setProductsChanged(!productsChanged);
  };

  const renderCards = () => (
    <div className="row">
      {filteredProducts.map((product: Product) => (
        <div key={product._id} className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <small>{product.category}</small>
              <span className={`badge ${product.available ? "bg-success" : "bg-danger"}`}>
                {product.available ? "זמין" : "אזל"}
              </span>
            </div>
            
            {/* תמונה עם קישור */}
            <Link to={`/products/${product._id}`} className="text-decoration-none">
              <img
                src={product.image}
                className="card-img-top"
                alt={`תמונה של ${product.name}`}
                title={`לחץ לצפייה בפרטי ${product.name}`}
                style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
              />
            </Link>
            
            <div className="card-body d-flex flex-column">
              {/* שם המוצר עם קישור */}
              <h5 className="card-title">
                <Link 
                  to={`/products/${product._id}`} 
                  className="text-decoration-none text-dark"
                  title={`צפה בפרטי ${product.name}`}
                >
                  {product.name}
                </Link>
              </h5>
              
              <p className="card-text flex-grow-1">{product.description}</p>
              <p className="card-text text-success fw-bold fs-5">{product.price}₪</p>
              
              <div className="d-flex gap-2 flex-wrap">
                {/* כפתור פרטים */}
                <Link 
                  to={`/products/${product._id}`}
                  className="btn btn-outline-info btn-sm"
                  title={`צפה בפרטי ${product.name}`}
                >
                  <i className="fas fa-eye me-1"></i>
                  פרטים
                </Link>
                
                {/* כפתור הוספה לעגלה */}
                <button
                  className="btn btn-primary flex-grow-1"
                  onClick={() => {
                    addToCart(product._id as string)
                      .then(() => {
                        alert("המוצר נוסף לעגלה בהצלחה");
                      })
                      .catch(() => {
                        alert("שגיאה בהוספת המוצר לעגלה");
                      });
                  }}
                  disabled={!product.available}
                >
                  <i className="fa fa-cart-plus me-2"></i>
                  {product.available ? "הוסף לעגלה" : "אזל מהמלאי"}
                </button>
                
                {/* כפתור מועדפים */}
                <FavoriteButton 
                  productId={product._id as string}
                  className="btn"
                />
                
                {/* כפתורי מנהל */}
                {isAdmin && (
                  <>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        setOpenUpdateModal(true);
                        setProductId(product._id as string);
                      }}
                      title="ערוך מוצר"
                    >
                      <i className="fa fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setOpenDeleteModal(true);
                        setProductId(product._id as string);
                      }}
                      title="מחק מוצר"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>תמונה</th>
            <th>שם מוצר</th>
            <th>קטגוריה</th>
            <th>מחיר</th>
            <th>תיאור</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product: Product) => (
            <tr key={product._id}>
              <td>
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.image}
                    alt={`תמונה של ${product.name}`}
                    style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                    className="rounded"
                    title={`לחץ לצפייה בפרטי ${product.name}`}
                  />
                </Link>
              </td>
              <td className="fw-bold">
                <Link 
                  to={`/products/${product._id}`} 
                  className="text-decoration-none"
                  title={`צפה בפרטי ${product.name}`}
                >
                  {product.name}
                </Link>
              </td>
              <td>
                <span className="badge bg-info">{product.category}</span>
              </td>
              <td className="text-success fw-bold">{product.price}₪</td>
              <td>
                <small>{product.description.substring(0, 50)}...</small>
              </td>
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  {/* כפתור פרטים */}
                  <Link 
                    to={`/products/${product._id}`}
                    className="btn btn-sm btn-outline-info"
                    title={`צפה בפרטי ${product.name}`}
                  >
                    <i className="fas fa-eye"></i>
                  </Link>
                  
                  {/* כפתור הוספה לעגלה */}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      addToCart(product._id as string)
                        .then(() => {
                          alert("המוצר נוסף לעגלה בהצלחה");
                        })
                        .catch(() => {
                          alert("שגיאה בהוספת המוצר לעגלה");
                        });
                    }}
                    title="הוסף לעגלה"
                    disabled={!product.available}
                  >
                    <i className="fa fa-cart-plus"></i>
                  </button>
                  
                  {/* כפתור מועדפים */}
                  <FavoriteButton 
                    productId={product._id as string}
                    className="btn btn-sm"
                  />
                  
                  {/* כפתורי מנהל */}
                  {isAdmin && (
                    <>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                          setOpenUpdateModal(true);
                          setProductId(product._id as string);
                        }}
                        title="ערוך"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          setOpenDeleteModal(true);
                          setProductId(product._id as string);
                        }}
                        title="מחק"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5">המוצרים שלנו</h1>
          {isAdmin && (
            <button className="btn btn-success" onClick={handleAddProduct}>
              <i className="fa fa-plus me-2"></i>
              הוסף מוצר
            </button>
          )}
        </div>

        {/* שורת חיפוש וסינון */}
        <div className="row mb-4">
          <div className="col-lg-6">
            <SearchBar onSearch={handleSearch} placeholder="חפש מוצרים לפי שם או תיאור..." />
          </div>
          <div className="col-lg-3">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              <option value="all">כל הקטגוריות</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="col-lg-3">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'cards' ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => setViewMode('cards')}
                title="תצוגת כרטיסים"
              >
                <i className="fa fa-th-large"></i>
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'table' ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => setViewMode('table')}
                title="תצוגת טבלה"
              >
                <i className="fa fa-table"></i>
              </button>
            </div>
          </div>
        </div>

        {/* תוצאות החיפוש */}
        <div className="mb-3">
          <small className="text-muted">
            נמצאו {filteredProducts.length} מוצרים
            {searchTerm && ` עבור "${searchTerm}"`}
            {selectedCategory !== "all" && ` בקטגוריה "${selectedCategory}"`}
          </small>
        </div>

        {/* תצוגת המוצרים */}
        {filteredProducts.length ? (
          viewMode === 'cards' ? renderCards() : renderTable()
        ) : (
          <div className="text-center py-5">
            <i className="fa fa-search fa-3x text-muted mb-3"></i>
            <h4 className="text-muted">לא נמצאו מוצרים</h4>
            <p className="text-muted">נסה לשנות את תנאי החיפוש</p>
          </div>
        )}
      </div>

      {/* מודלים */}
      <AddProductModal
        show={openAddModal}
        onHide={() => setOpenAddModal(false)}
        refresh={refresh}
      />
      <UpdateProductModal
        show={openUpdateModal}
        onHide={() => setOpenUpdateModal(false)}
        refresh={refresh}
        productId={productId}
      />
      <DeleteProductModal
        show={openDeleteModal}
        onHide={() => setOpenDeleteModal(false)}
        refresh={refresh}
        productId={productId}
      />
      
      <Footer />
    </>
  );
};

export default Products;