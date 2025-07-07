import { FunctionComponent, useEffect, useState } from "react";
import { Product } from "../interfaces/Product";
import { getAllProducts } from "../services/productsService";
import Layout from "./Layout";
import { getPayloadFromToken } from "../services/usersService";
import AddProductModal from "./AddProductModal";
import UpdateProductModal from "./UpdateProductModal";
import DeleteProductModal from "./DeleteProductModal";
import { addToCart } from "../services/cartsService";

interface ProductsProps {}

const Products: FunctionComponent<ProductsProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [productsChanged, setProductsChanged] = useState<boolean>(false);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [productId, setProductId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

    
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
      .catch((err) => console.log(err));
  }, [productsChanged]);

  // פילטור מוצרים
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.available;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleAddProduct = () => {
    setOpenAddModal(true);
  };

  const refresh = () => {
    setProductsChanged(!productsChanged);
  };

  return (
    <Layout containerFluid title="המוצרים שלנו">
      {/* כלי בר עליון */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-3 align-items-center">
          {/* חיפוש */}
          <div className="input-group" style={{width: "300px"}}>
            <input
              type="text"
              className="form-control"
              placeholder="חפש מוצרים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-info">
              <i className="fas fa-search"></i>
            </button>
          </div>

          {/* סינון קטגוריות */}
          <select
            className="form-select"
            style={{width: "200px"}}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">כל הקטגוריות</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* כפתור הוספה למנהלים */}
        {isAdmin && (
          <button className="btn btn-success" onClick={handleAddProduct}>
            <i className="fas fa-plus me-2"></i>
            הוסף מוצר
          </button>
        )}
      </div>

      {/* תוצאות */}
      <div className="mb-3">
        <small className="text-muted">
          נמצאו {filteredProducts.length} מוצרים
          {searchTerm && ` עבור "${searchTerm}"`}
        </small>
      </div>

      {/* רשת מוצרים */}
      {filteredProducts.length ? (
        <div className="row">
          {filteredProducts.map((product: Product) => (
            <div key={product._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-info text-white">
                  <small>{product.category}</small>
                </div>
                <img
                  src={product.image}
                  className="card-img-top"
                  alt={`תמונה של ${product.name}`}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted small flex-grow-1">
                    {product.description}
                  </p>
                  <p className="card-text text-success fw-bold fs-5">
                    ₪{product.price}
                  </p>
                  
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary flex-grow-1"
                      onClick={() => {
                        addToCart(product._id as string)
                          .then(() => alert("המוצר נוסף לעגלה!"))
                          .catch(err => console.log(err));
                      }}
                    >
                      <i className="fas fa-cart-plus me-1"></i>
                      עגלה
                    </button>
                    
                    {isAdmin && (
                      <>
                        <button
                          className="btn btn-warning"
                          onClick={() => {
                            setOpenUpdateModal(true);
                            setProductId(product._id as string);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => {
                            setOpenDeleteModal(true);
                            setProductId(product._id as string);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-search fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">לא נמצאו מוצרים</h4>
          <p className="text-muted">נסה לשנות את תנאי החיפוש</p>
        </div>
      )}

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
    </Layout>
  );
};

export default Products;