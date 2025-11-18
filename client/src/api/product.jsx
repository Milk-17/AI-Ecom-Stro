import axios from "axios";


export const createProduct = async (token, productData) => {
  const res = await axios.post('http://localhost:5001/api/product', productData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // backend บางทีไม่ส่ง product กลับ ให้ fallback เป็น productData
  return {
    data: {
      product: res.data.product || productData,
      ...res.data,
    },
  };
};
export const listProduct = async (count = 20) => {
  // code body
  return axios.get("http://localhost:5001/api/products/" + count);
};

export const readProduct = async (token, id) => {
  // code body
  return axios.get("http://localhost:5001/api/product/" + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deleteProduct = async (token, id) => {
  // code body
  return axios.delete("http://localhost:5001/api/product/" + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateProduct = async (token, id, form) => {
  // code body
  return axios.put("http://localhost:5001/api/product/" + id, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const uploadFiles = async (token, form) => {
  // code
  // console.log('form api frontent', form)
  return axios.post(
    "http://localhost:5001/api/images",
    {
      image: form,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const removeFiles = async (token, public_id) => {
  // code
  // console.log('form api frontent', form)
  return axios.post(
    "http://localhost:5001/api/removeimages",
    {
      public_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const searchFilters = async (arg) => {
  // code body
  return axios.post("http://localhost:5001/api/search/filters", arg);
};

export const listProductBy = async (sort, order, limit) => {
  // code body
  return axios.post("http://localhost:5001/api/productby", {
    sort,
    order,
    limit,
  });
};

export const getAdminLogs = async (token) => {
  return await axios.get('http://localhost:5001/api/product/admin/logs', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getProductById = async (id) => {
  return await axios.get(`http://localhost:5001/api/product/${id}`);
};

// ดึง Product Price History
export const getProductPriceHistory = async (token) => {
  return await axios.get(`http://localhost:5001/api/productpricehistory`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

