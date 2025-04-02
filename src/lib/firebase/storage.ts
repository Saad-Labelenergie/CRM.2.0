import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '../firebase';

export const uploadFile = async (path: string, file: File) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
};

export const getFileURL = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    throw new Error(`Error getting file URL: ${error.message}`);
  }
};