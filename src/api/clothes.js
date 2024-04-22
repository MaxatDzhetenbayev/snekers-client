import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { v4 as uuid } from "uuid";

export const addClothes = async (file, payload) => {
  try {
    const storage = getStorage();
    const docId = uuid();

    const fileName = `${new Date().getTime()}_${file.name}`;
    const fileRef = storageRef(storage, `clothes/${fileName}`);

    const snapshot = await uploadBytes(fileRef, file);
    const imageurl = await getDownloadURL(snapshot.ref);

    const docRef = doc(db, "clothes", docId);

    await setDoc(docRef, { ...payload, imageurl });
    console.log("Документ успешно добавлен с ID: ", docRef.id);
  } catch (e) {
    console.error("Ошибка при добавлении документа: ", e);
  }
};

export const getAllClothes = async () => {
  const clothesCollectionRef = collection(db, "clothes");
  const data = await getDocs(clothesCollectionRef);
  return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const addFavorits = async (userId, productId) => {
  try {
    const docId = uuid();
    const docRef = doc(db, "favorites", docId);

    await setDoc(docRef, { userId, productId });
    console.log("Продукт успешно добавлен в избранные ID: ", docRef.id);
  } catch (error) {
    console.error("Ошибка при добавлении продукта в избранные: ", error);
  }
};

export const getAllFavorits = async () => {
  const clothesCollectionRef = collection(db, "clothes");
  const data = await getDocs(clothesCollectionRef);
  return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export async function getFavoriteProducts(userId) {
  const favoritesQuery = query(
    collection(db, "favorites"),
    where("userId", "==", userId)
  );

  try {
    const querySnapshot = await getDocs(favoritesQuery);
    const favorites = querySnapshot.docs.map((doc) => doc.data().productId);

    const productsDetails = await Promise.all(
      favorites.map((productId) => {
        const productRef = doc(db, "clothes", productId);
        return getDoc(productRef);
      })
    );

    const products = productsDetails.map((doc, index) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return products;
  } catch (error) {
    console.error("Error fetching favorite products: ", error);
  }
}

export const addToCart = async (userId, productId) => {
  try {
    const docId = uuid();
    const docRef = doc(db, "carts", docId);

    await setDoc(docRef, { userId, productId });
    console.log("Продукт успешно добавлен в корзину ID: ", docRef.id);
  } catch (error) {
    console.error("Ошибка при добавлении продукта в корзину: ", error);
  }
};

export const removeFromCart = async (userId, productId) => {
	console.log(userId)
	console.log(productId)
  try {
    const q = query(
      collection(db, "carts"),
      where("userId", "==", userId),
      where("productId", "==", productId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const document = querySnapshot.docs[0];
      await deleteDoc(doc(db, "carts", document.id));
      console.log("Удален продукт из корзины с ID: ", document.id);
    } else {
      console.log("Не найдено продуктов в корзине для удаления.");
    }
  } catch (error) {
    console.error("Ошибка при удалении продукта из корзины: ", error);
  }
};

export const getAllCartProducts = async () => {
  const clothesCollectionRef = collection(db, "clothes");
  const data = await getDocs(clothesCollectionRef);
  return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export async function getCartProducts(userId) {
  const favoritesQuery = query(
    collection(db, "carts"),
    where("userId", "==", userId)
  );

  try {
    const querySnapshot = await getDocs(favoritesQuery);
    const favorites = querySnapshot.docs.map((doc) => doc.data().productId);

    const productsDetails = await Promise.all(
      favorites.map((productId) => {
        const productRef = doc(db, "clothes", productId);
        return getDoc(productRef);
      })
    );

    const products = productsDetails.map((doc, index) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return products;
  } catch (error) {
    console.error("Error fetching favorite products: ", error);
  }
}

export const addToOrder = async (userId, productId, productInfo) => {
  try {
    const docId = uuid();
    const docRef = doc(db, "order", docId);

    await setDoc(docRef, { userId, productId, ...productInfo });
    console.log("Продукт успешно заказан! Ожидайте звонка.: ", docRef.id);
  } catch (error) {
    console.error("Ошибка при заказе продукта! Попробуйте заново.: ", error);
  }
};
