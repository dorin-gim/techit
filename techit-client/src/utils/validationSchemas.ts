import * as yup from "yup";

// Regex לסיסמה חזקה לפי הדרישות:
// לפחות אות אחת גדולה, אות אחת קטנה, 4 מספרים, סימן מיוחד, מינימום 8 תווים
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*\d.*\d.*\d)(?=.*[!@%$#^&*\-_*]).{8,}$/;

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("אימייל נדרש")
    .email("כתובת אימייל לא תקינה"),
  password: yup
    .string()
    .required("סיסמה נדרשת")
    .min(8, "סיסמה חייבת להכיל לפחות 8 תווים")
    .matches(
      passwordRegex,
      "סיסמה חייבת לכלול: אות גדולה, אות קטנה, 4 מספרים וסימן מיוחד (!@%$#^&*-_*)"
    ),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .required("שם נדרש")
    .min(2, "שם חייב להכיל לפחות 2 תווים"),
  email: yup
    .string()
    .required("אימייל נדרש")
    .email("כתובת אימייל לא תקינה"),
  password: yup
    .string()
    .required("סיסמה נדרשת")
    .min(8, "סיסמה חייבת להכיל לפחות 8 תווים")
    .matches(
      passwordRegex,
      "סיסמה חייבת לכלול: אות גדולה, אות קטנה, 4 מספרים וסימן מיוחד (!@%$#^&*-_*)"
    ),
});

export const productSchema = yup.object({
  name: yup
    .string()
    .required("שם המוצר נדרש")
    .min(2, "שם המוצר חייב להכיל לפחות 2 תווים"),
  price: yup
    .number()
    .required("מחיר נדרש")
    .positive("המחיר חייב להיות חיובי")
    .min(0.01, "מחיר מינימלי 0.01"),
  category: yup
    .string()
    .required("קטגוריה נדרשת")
    .min(2, "קטגוריה חייבת להכיל לפחות 2 תווים"),
  description: yup
    .string()
    .required("תיאור נדרש")
    .min(10, "תיאור חייב להכיל לפחות 10 תווים"),
  image: yup
    .string()
    .url("כתובת URL לא תקינה")
    .required("תמונה נדרשת"),
});