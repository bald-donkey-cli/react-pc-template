import { getProduct } from "../../api"

const creator = (type, payload) => ({ type, payload })

const ProductActon = async (dispatch) => {
  try {
    let res = await getProduct()
    dispatch(creator("FETCH_PRODUCT_SUCCESS", { data: res.data.data }))
  } catch (err) {
    console.log(err);
  }
  // getProduct()
  //   .then(res => {
  //     dispatch(creator("FETCH_PRODUCT_SUCCESS", { data: res.data }))
  //   })
  //   .catch(error => {
  //     dispatch(creator("FETCH_PRODUCT_FAIL", { data: null, error: error }))
  //   })
}

export default ProductActon